using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Temporalio.Activities;

/// <summary>
/// Activities dla pipeline'u scrapingu ofert pracy.
/// Komunikuje się z Playwright Bridge i PostgreSQL przez Npgsql.
/// </summary>
public class JobScrapingActivities
{
    private static readonly HttpClient PlaywrightHttp = new()
    {
        BaseAddress = new Uri(Environment.GetEnvironmentVariable("PLAYWRIGHT_HOST")
                              ?? "http://playwright-bridge:3000"),
        Timeout = TimeSpan.FromSeconds(120)
    };

    private static readonly HttpClient OllamaHttp = new()
    {
        BaseAddress = new Uri(Environment.GetEnvironmentVariable("OLLAMA_HOST")
                              ?? "http://ollama:11434"),
        Timeout = TimeSpan.FromSeconds(180)
    };

    private readonly Npgsql.NpgsqlDataSource _db;

    public JobScrapingActivities(Npgsql.NpgsqlDataSource db)
    {
        _db = db;
    }

    // ── 1. Pobierz aktywne portale z bazy ────────────────────────────────────

    [Activity]
    public async Task<List<PortalConfig>> GetActivePortals(string? category = null)
    {
        await using var conn = await _db.OpenConnectionAsync();

        var sql = """
            SELECT p.id, p.slug, p.name, p.url, p.selectors, p.filters, p.schedule,
                   c.slug as category_slug
            FROM portals p
            JOIN portal_categories c ON c.id = p.category_id
            WHERE p.active = true
            """;

        if (category != null)
            sql += " AND c.slug = @category";

        sql += " ORDER BY c.slug, p.slug";

        await using var cmd = conn.CreateCommand();
        cmd.CommandText = sql;
        if (category != null)
            cmd.Parameters.AddWithValue("category", category);

        var portals = new List<PortalConfig>();
        await using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            portals.Add(new PortalConfig(
                Id:           reader.GetGuid(0).ToString(),
                Slug:         reader.GetString(1),
                Name:         reader.GetString(2),
                Url:          reader.GetString(3),
                Category:     reader.GetString(7)
            ));
        }

        return portals;
    }

    // ── 2. Scraping portalu przez Playwright Bridge ───────────────────────────

    [Activity]
    public async Task<ScrapePortalResult> ScrapePortal(string portalSlug, int limit = 50)
    {
        var response = await PlaywrightHttp.PostAsJsonAsync("/scrape-portal",
            new { portal = portalSlug, limit });

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Playwright Bridge error [{response.StatusCode}]: {error}");
        }

        return await response.Content.ReadFromJsonAsync<ScrapePortalResult>()
               ?? throw new InvalidOperationException("Empty response from Playwright Bridge");
    }

    // ── 3. Pobierz nowe oferty (jeszcze nie analizowane) ─────────────────────

    [Activity]
    public async Task<List<OfferToAnalyze>> GetUnanalyzedOffers(string portalSlug, int limit = 20)
    {
        await using var conn = await _db.OpenConnectionAsync();
        await using var cmd = conn.CreateCommand();

        cmd.CommandText = """
            SELECT r.id, r.url, r.title, r.company, r.salary, r.description
            FROM offers_raw r
            JOIN portals p ON p.id = r.portal_id
            WHERE p.slug = @portal
              AND NOT EXISTS (
                SELECT 1 FROM offers_analyzed a
                WHERE a.offer_id = r.id AND a.stage = 'prescreening'
              )
            ORDER BY r.scraped_at DESC
            LIMIT @limit
            """;

        cmd.Parameters.AddWithValue("portal", portalSlug);
        cmd.Parameters.AddWithValue("limit", limit);

        var offers = new List<OfferToAnalyze>();
        await using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            offers.Add(new OfferToAnalyze(
                Id:          reader.GetGuid(0).ToString(),
                Url:         reader.GetString(1),
                Title:       reader.IsDBNull(2) ? null : reader.GetString(2),
                Company:     reader.IsDBNull(3) ? null : reader.GetString(3),
                Salary:      reader.IsDBNull(4) ? null : reader.GetString(4),
                Description: reader.IsDBNull(5) ? null : reader.GetString(5)
            ));
        }

        return offers;
    }

    // ── 4. Pre-screening przez Ollama (gemma4:e2b — szybki) ──────────────────

    [Activity]
    public async Task<PreScreenResult> PreScreenOffer(OfferToAnalyze offer, UserProfileData profile)
    {
        var model = Environment.GetEnvironmentVariable("OLLAMA_PRESCREENING_MODEL")
                    ?? "llama3.2:1b";

        var prompt = $$"""
            You are a job offer pre-screener. Analyze this job offer and rate relevance 1-10.
            Be strict and fast. Return ONLY valid JSON, no markdown, no explanation.

            Candidate profile:
            - Skills: {{string.Join(", ", profile.Skills)}}
            - Experience: {{profile.ExperienceYears}} years
            - Remote only: {{profile.RemoteOnly}}
            - Salary range: {{profile.SalaryMin}}-{{profile.SalaryMax}} {{profile.Currency}}

            Job offer:
            - Title: {{offer.Title}}
            - Company: {{offer.Company}}
            - Salary: {{offer.Salary}}
            - URL: {{offer.Url}}

            Return JSON: { "score": 1-10, "pass": true/false, "reason": "one sentence" }
            """;

        var ollamaResponse = await OllamaHttp.PostAsJsonAsync("/api/generate", new
        {
            model,
            prompt,
            stream = false
        });

        ollamaResponse.EnsureSuccessStatusCode();
        var ollamaData = await ollamaResponse.Content.ReadFromJsonAsync<OllamaResponse>()
                         ?? throw new InvalidOperationException("Empty Ollama response");

        // Parsuj JSON z odpowiedzi modelu
        PreScreenJson parsed;
        try
        {
            var json = ExtractJson(ollamaData.Response);
            parsed = JsonSerializer.Deserialize<PreScreenJson>(json)
                     ?? new PreScreenJson(5, false, "Parse error");
        }
        catch
        {
            parsed = new PreScreenJson(5, false, "Parse error");
        }

        // Zapisz wynik do bazy
        await SaveAnalysis(offer.Id, profile.UserId, model, "prescreening",
            parsed.Score, new[] { parsed.Reason }, Array.Empty<string>(), null, ollamaData.Response);

        return new PreScreenResult(offer.Id, parsed.Score, parsed.Pass, parsed.Reason);
    }

    // ── 5. Scoring przez Ollama (gemma4:e4b — dokładny) ──────────────────────

    [Activity]
    public async Task<ScoringResult> ScoreOffer(OfferToAnalyze offer, UserProfileData profile)
    {
        var model = Environment.GetEnvironmentVariable("OLLAMA_SCORING_MODEL")
                    ?? "llama3.2:1b"; // zastąp gemma4:e4b gdy dostępny

        // Pobierz pełny opis oferty przez Playwright jeśli nie mamy
        var description = offer.Description ?? await FetchOfferDescription(offer.Url);

        var prompt = $$"""
            You are a senior career advisor. Score this job offer 1-10 for the candidate.
            Return ONLY valid JSON, no markdown.

            Candidate profile:
            - Skills: {{string.Join(", ", profile.Skills)}}
            - Experience: {{profile.ExperienceYears}} years
            - Remote only: {{profile.RemoteOnly}}
            - Salary range: {{profile.SalaryMin}}-{{profile.SalaryMax}} {{profile.Currency}}
            - Bio: {{profile.Bio}}

            Job offer:
            - Title: {{offer.Title}}
            - Company: {{offer.Company}}
            - Salary: {{offer.Salary}}
            - Description: {{description?.Substring(0, Math.Min(description?.Length ?? 0, 2000))}}

            Return JSON:
            {
            "score": 1-10,
            "match_reasons": ["reason1", "reason2"],
            "mismatch_reasons": ["reason1"],
            "salary_match": true/false,
            "remote_match": true/false,
            "skills_match_percent": 0-100
            }
            """;

        var ollamaResponse = await OllamaHttp.PostAsJsonAsync("/api/generate", new
        {
            model,
            prompt,
            stream = false
        });

        ollamaResponse.EnsureSuccessStatusCode();
        var ollamaData = await ollamaResponse.Content.ReadFromJsonAsync<OllamaResponse>()
                         ?? throw new InvalidOperationException("Empty Ollama response");

        ScoringJson parsed;
        try
        {
            var json = ExtractJson(ollamaData.Response);
            parsed = JsonSerializer.Deserialize<ScoringJson>(json)
                     ?? new ScoringJson(5, [], [], false, false, 0);
        }
        catch
        {
            parsed = new ScoringJson(5, [], [], false, false, 0);
        }

        await SaveAnalysis(offer.Id, profile.UserId, model, "scoring",
            parsed.Score, parsed.MatchReasons, parsed.MismatchReasons, null, ollamaData.Response);

        return new ScoringResult(
            offer.Id, parsed.Score,
            parsed.MatchReasons, parsed.MismatchReasons,
            parsed.SalaryMatch, parsed.RemoteMatch, parsed.SkillsMatchPercent);
    }

    // ── GenerateProposals Activity ────────────────────────────────────────────
 
    [Activity]
    public async Task<ProposalResult> GenerateProposals(
        OfferToAnalyze offer,
        UserProfileData profile,
        ScoringResult scoring)
    {
        var model = Environment.GetEnvironmentVariable("OLLAMA_PROPOSAL_MODEL")
                    ?? "llama3.2:1b"; // na produkcji: gemma4:26b
 
        var description = offer.Description ?? await FetchOfferDescription(offer.Url);
        var descSnippet = description?.Substring(0, Math.Min(description?.Length ?? 0, 1500)) ?? "";
 
        var language = DetectLanguage(offer.Title + " " + descSnippet);
        var langInstruction = language == "pl"
            ? "Napisz propozycję PO POLSKU."
            : "Write the proposal IN ENGLISH.";
 
        var prompt = $"""
            You are writing a freelance/job application for Robert Kulig — senior .NET/C#/TypeScript developer from Poland.
 
            {langInstruction}
            Write THREE variants. Return ONLY valid JSON, no markdown, no text outside JSON.
 
            Candidate profile:
            - Skills: {string.Join(", ", profile.Skills)}
            - Experience: {profile.ExperienceYears} years
            - Bio: {profile.Bio}
 
            Job offer:
            - Title: {offer.Title}
            - Company: {offer.Company ?? "?"}
            - Salary: {offer.Salary ?? "not specified"}
            - Description: {descSnippet}
 
            AI scoring: {scoring.Score}/10
            Match reasons: {string.Join(", ", scoring.MatchReasons)}
 
            Return JSON (no markdown, no text outside):
            {{
              "language": "pl",
              "balanced": "proposal text 150-200 words",
              "aggressive": "proposal text 100-150 words",
              "premium": "proposal text 200-250 words"
            }}
            """;
 
        var ollamaResponse = await OllamaHttp.PostAsJsonAsync("/api/generate", new
        {
            model,
            prompt,
            stream = false,
            options = new { temperature = 0.7, num_predict = 1500 }
        });
 
        ollamaResponse.EnsureSuccessStatusCode();
        var ollamaData = await ollamaResponse.Content.ReadFromJsonAsync<OllamaResponse>()
                         ?? throw new InvalidOperationException("Empty Ollama response");
 
        ProposalJson parsed;
        try
        {
            var json = ExtractJson(ollamaData.Response);
            parsed = JsonSerializer.Deserialize<ProposalJson>(json)
                     ?? new ProposalJson("pl",
                         $"Aplikuję na pozycję {offer.Title}.",
                         $"Zainteresowany pozycją {offer.Title}.",
                         $"W odpowiedzi na ogłoszenie {offer.Title}.");
        }
        catch
        {
            parsed = new ProposalJson("pl",
                $"Aplikuję na pozycję {offer.Title}. {profile.Bio}",
                $"Zainteresowany pozycją {offer.Title}.",
                $"W odpowiedzi na ogłoszenie {offer.Title} — {profile.ExperienceYears} lat doświadczenia.");
        }
 
        await SaveProposals(offer.Id, parsed.Balanced, parsed.Aggressive, parsed.Premium);
 
        return new ProposalResult(
            offer.Id, parsed.Language,
            parsed.Balanced, parsed.Aggressive, parsed.Premium);
    }
 
    private static string DetectLanguage(string text)
    {
        var polishWords = new[] { "oraz", "dla", "jest", "będzie", "który", "pracy",
                                   "oferta", "wymagania", "mile", "widziane", "doświadczenie" };
        var lowerText = text.ToLower();
        var polishCount = polishWords.Count(w => lowerText.Contains(w));
        return polishCount >= 2 ? "pl" : "en";
    }

    // ── 6. Pobierz profil użytkownika ─────────────────────────────────────────

    [Activity]
    public async Task<UserProfileData> GetUserProfile(string userId = "00000000-0000-0000-0000-000000000001")
    {
        await using var conn = await _db.OpenConnectionAsync();
        await using var cmd = conn.CreateCommand();

        cmd.CommandText = """
            SELECT up.skills, up.experience_years, up.salary_min, up.salary_max,
                   up.currency, up.remote_only, up.bio, u.id::text
            FROM user_profiles up
            JOIN users u ON u.id = up.user_id
            WHERE u.id = @userId::uuid
            """;

        cmd.Parameters.AddWithValue("userId", userId);

        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            throw new InvalidOperationException($"User profile not found: {userId}");

        var skillsJson = reader.GetString(0);
        var skills = JsonSerializer.Deserialize<List<string>>(skillsJson) ?? [];

        return new UserProfileData(
            UserId:          reader.GetString(7),
            Skills:          skills,
            ExperienceYears: reader.IsDBNull(1) ? 0 : reader.GetInt32(1),
            SalaryMin:       reader.IsDBNull(2) ? 0 : reader.GetInt32(2),
            SalaryMax:       reader.IsDBNull(3) ? 0 : reader.GetInt32(3),
            Currency:        reader.IsDBNull(4) ? "PLN" : reader.GetString(4),
            RemoteOnly:      reader.IsDBNull(5) ? true : reader.GetBoolean(5),
            Bio:             reader.IsDBNull(6) ? "" : reader.GetString(6)
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<string?> FetchOfferDescription(string url)
    {
        try
        {
            var response = await PlaywrightHttp.PostAsJsonAsync("/browse", new { url });
            if (!response.IsSuccessStatusCode) return null;
            var result = await response.Content.ReadFromJsonAsync<BrowseResult>();
            return result?.Text;
        }
        catch { return null; }
    }

    // ── Zapisz do offers_analyzed (nasza tabela) + job_scores (most do n8n) ──
 
    private async Task SaveAnalysis(
        string offerId, string userId, string model, string stage,
        int score, IEnumerable<string> matchReasons, IEnumerable<string> mismatchReasons,
        string? suggestedResponse, string rawResponse)
    {
        await using var conn = await _db.OpenConnectionAsync();
 
        // 1. Zawsze zapisuj do offers_analyzed
        await using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = """
                INSERT INTO offers_analyzed
                    (offer_id, user_id, model, stage, score, match_reasons, mismatch_reasons,
                     suggested_response, raw_llm_response)
                VALUES
                    (@offerId::uuid, @userId::uuid, @model, @stage, @score,
                     @matchReasons::jsonb, @mismatchReasons::jsonb,
                     @suggestedResponse, @rawResponse)
                ON CONFLICT DO NOTHING
                """;
 
            cmd.Parameters.AddWithValue("offerId",           offerId);
            cmd.Parameters.AddWithValue("userId",            userId);
            cmd.Parameters.AddWithValue("model",             model);
            cmd.Parameters.AddWithValue("stage",             stage);
            cmd.Parameters.AddWithValue("score",             score);
            cmd.Parameters.AddWithValue("matchReasons",      JsonSerializer.Serialize(matchReasons));
            cmd.Parameters.AddWithValue("mismatchReasons",   JsonSerializer.Serialize(mismatchReasons));
            cmd.Parameters.AddWithValue("suggestedResponse", (object?)suggestedResponse ?? DBNull.Value);
            cmd.Parameters.AddWithValue("rawResponse",       rawResponse);
 
            await cmd.ExecuteNonQueryAsync();
        }
 
        // 2. Przy etapie 'scoring' zapisuj też do job_scores (most do n8n)
        if (stage == "scoring")
        {
            await using var cmd2 = conn.CreateCommand();
 
            // Przelicz score 1-10 na 0.0-1.0 dla job_scores
            var normalizedScore = score / 10.0m;
            var verdict = score >= 8 ? "PRIORITY" : score >= 6 ? "CONSIDER" : "SKIP";
            var reasoning = matchReasons.Any()
                ? string.Join("; ", matchReasons)
                : string.Join("; ", mismatchReasons);
 
            cmd2.CommandText = """
                INSERT INTO job_scores
                    (job_id, tech_score, seniority_score, project_fit, clarity_score,
                     budget_fit, red_flags, green_flags, overall, verdict,
                     track, reasoning, source_portal)
                SELECT
                    @jobId::uuid,
                    @overall,  -- tech_score (uproszczenie — jeden model)
                    @overall,  -- seniority_score
                    @overall,  -- project_fit
                    @overall,  -- clarity_score
                    @overall,  -- budget_fit
                    @redFlags::text[],
                    @greenFlags::text[],
                    @overall,
                    @verdict,
                    'A',       -- track (domyślnie A, można rozszerzyć)
                    @reasoning,
                    p.slug
                FROM offers_raw r
                JOIN portals p ON p.id = r.portal_id
                WHERE r.id = @jobId::uuid
                ON CONFLICT (job_id) DO UPDATE SET
                    overall    = EXCLUDED.overall,
                    verdict    = EXCLUDED.verdict,
                    reasoning  = EXCLUDED.reasoning
                """;
 
            cmd2.Parameters.AddWithValue("jobId",      offerId);
            cmd2.Parameters.AddWithValue("overall",    normalizedScore);
            cmd2.Parameters.AddWithValue("redFlags",   mismatchReasons.ToArray());
            cmd2.Parameters.AddWithValue("greenFlags",  matchReasons.ToArray());
            cmd2.Parameters.AddWithValue("verdict",    verdict);
            cmd2.Parameters.AddWithValue("reasoning",  reasoning);
 
            await cmd2.ExecuteNonQueryAsync();
        }
    }
 
    // ── Zapisz propozycje do job_scores (wywoływane po wygenerowaniu) ─────────
 
    [Activity]
    public async Task SaveProposals(
        string offerId,
        string? proposalBalanced,
        string? proposalAggressive,
        string? proposalPremium)
    {
        await using var conn = await _db.OpenConnectionAsync();
        await using var cmd  = conn.CreateCommand();
 
        cmd.CommandText = """
            UPDATE job_scores SET
                proposal_balanced   = @balanced,
                proposal_aggressive = @aggressive,
                proposal_premium    = @premium
            WHERE job_id = @jobId::uuid
            """;
 
        cmd.Parameters.AddWithValue("jobId",       offerId);
        cmd.Parameters.AddWithValue("balanced",    (object?)proposalBalanced   ?? DBNull.Value);
        cmd.Parameters.AddWithValue("aggressive",  (object?)proposalAggressive ?? DBNull.Value);
        cmd.Parameters.AddWithValue("premium",     (object?)proposalPremium    ?? DBNull.Value);
 
        await cmd.ExecuteNonQueryAsync();
    }

    private static string ExtractJson(string text)
    {
        // Wyciągnij JSON z odpowiedzi modelu (może zawierać tekst przed/po)
        var start = text.IndexOf('{');
        var end   = text.LastIndexOf('}');
        if (start >= 0 && end > start)
            return text[start..(end + 1)];
        return text;
    }
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

public record PortalConfig(string Id, string Slug, string Name, string Url, string Category);

public record OfferToAnalyze(
    string Id, string Url, string? Title, string? Company,
    string? Salary, string? Description);

public record UserProfileData(
    string UserId, List<string> Skills, int ExperienceYears,
    int SalaryMin, int SalaryMax, string Currency, bool RemoteOnly, string Bio);

public record PreScreenResult(string OfferId, int Score, bool Pass, string Reason);

public record ScoringResult(
    string OfferId, int Score,
    List<string> MatchReasons, List<string> MismatchReasons,
    bool SalaryMatch, bool RemoteMatch, int SkillsMatchPercent);

public record ScrapePortalResult(
    string Portal, int Scraped, int Filtered, int Saved, int Duplicates);

public record OllamaResponse(string Response);

// Wewnętrzne DTOs do parsowania JSON z Ollamy
file record PreScreenJson(
    [property: JsonPropertyName("score")]  int Score,
    [property: JsonPropertyName("pass")]   bool Pass,
    [property: JsonPropertyName("reason")] string Reason);

file record ScoringJson(
    [property: JsonPropertyName("score")]               int Score,
    [property: JsonPropertyName("match_reasons")]       List<string> MatchReasons,
    [property: JsonPropertyName("mismatch_reasons")]    List<string> MismatchReasons,
    [property: JsonPropertyName("salary_match")]        bool SalaryMatch,
    [property: JsonPropertyName("remote_match")]        bool RemoteMatch,
    [property: JsonPropertyName("skills_match_percent")] int SkillsMatchPercent);

public record ProposalResult(
    string OfferId, string Language,
    string Balanced, string Aggressive, string Premium);
 
file record ProposalJson(
    [property: JsonPropertyName("language")]   string Language,
    [property: JsonPropertyName("balanced")]   string Balanced,
    [property: JsonPropertyName("aggressive")] string Aggressive,
    [property: JsonPropertyName("premium")]    string Premium);    