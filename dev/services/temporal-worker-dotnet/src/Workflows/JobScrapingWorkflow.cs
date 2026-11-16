using Temporalio.Workflows;
using Temporalio.Common;
using Microsoft.Extensions.Logging;

/// <summary>
/// Główny workflow scrapingu ofert pracy z generowaniem propozycji.
///
/// Uruchomienie ręczne (wszystkie portale):
///   temporal workflow start \
///     --task-queue dev-task-queue \
///     --type JobScrapingWorkflow \
///     --input '{}' \
///     --workflow-id job-scraping-001
///
/// Dla konkretnej kategorii:
///   temporal workflow start \
///     --task-queue dev-task-queue \
///     --type JobScrapingWorkflow \
///     --input '{"Category":"it","PortalSlug":null,"Limit":30}' \
///     --workflow-id job-scraping-it-001
/// </summary>
[Workflow]
public class JobScrapingWorkflow
{
    // Options dla szybkich operacji (scraping, DB)
    private static readonly ActivityOptions FastOptions = new()
    {
        StartToCloseTimeout = TimeSpan.FromMinutes(5),
        RetryPolicy = new RetryPolicy
        {
            MaximumAttempts       = 3,
            InitialInterval       = TimeSpan.FromSeconds(5),
            BackoffCoefficient    = 2,
            MaximumInterval       = TimeSpan.FromSeconds(30),
        }
    };

    // Options dla wolnych operacji (Ollama AI)
    private static readonly ActivityOptions AiOptions = new()
    {
        StartToCloseTimeout = TimeSpan.FromMinutes(10),
        RetryPolicy = new RetryPolicy
        {
            MaximumAttempts       = 2,
            InitialInterval       = TimeSpan.FromSeconds(10),
            BackoffCoefficient    = 2,
        }
    };

    private static readonly ActivityOptions AiOptions = new()
    {
        StartToCloseTimeout = TimeSpan.FromMinutes(10),
        RetryPolicy = new RetryPolicy
        {
            MaximumAttempts    = 2,
            InitialInterval    = TimeSpan.FromSeconds(10),
            BackoffCoefficient = 2,
        }
    };
 
    private static readonly ActivityOptions ProposalOptions = new()
    {
        StartToCloseTimeout = TimeSpan.FromMinutes(15),
        RetryPolicy = new RetryPolicy
        {
            MaximumAttempts    = 2,
            InitialInterval    = TimeSpan.FromSeconds(15),
            BackoffCoefficient = 2,
        }
    };

    [WorkflowRun]
    public async Task<JobScrapingResult> RunAsync(JobScrapingInput input)
    {
        var result = new JobScrapingResult();

        // 1. Pobierz profil użytkownika (kontekst dla AI)
        var profile = await Workflow.ExecuteActivityAsync(
            (JobScrapingActivities a) => a.GetUserProfile(input.UserId ?? "00000000-0000-0000-0000-000000000001"),
            FastOptions);

        // 2. Pobierz aktywne portale z bazy
        var portals = await Workflow.ExecuteActivityAsync(
            (JobScrapingActivities a) => a.GetActivePortals(input.Category),
            FastOptions);

        // Jeśli podano konkretny portal, filtruj
        if (input.PortalSlug != null)
            portals = portals.Where(p => p.Slug == input.PortalSlug).ToList();

        Workflow.Logger.LogInformation(
            "Starting job scraping for {Count} portals", portals.Count);

        // 3. Dla każdego portalu — scraping + analiza AI
        foreach (var portal in portals)
        {
            Workflow.Logger.LogInformation("Scraping portal: {Portal}", portal.Slug);

            // 3a. Scraping
            ScrapePortalResult scrapeResult;
            try
            {
                scrapeResult = await Workflow.ExecuteActivityAsync(
                    (JobScrapingActivities a) => a.ScrapePortal(portal.Slug, input.Limit ?? 50),
                    FastOptions);

                result.TotalScraped    += scrapeResult.Scraped;
                result.TotalSaved      += scrapeResult.Saved;
                result.TotalDuplicates += scrapeResult.Duplicates;

                Workflow.Logger.LogInformation(
                    "Portal {Portal}: scraped={Scraped} saved={Saved} duplicates={Dup}",
                    portal.Slug, scrapeResult.Scraped, scrapeResult.Saved, scrapeResult.Duplicates);
            }
            catch (Exception ex)
            {
                Workflow.Logger.LogError(
                    "Scraping failed for {Portal}: {Error}", portal.Slug, ex.Message);
                result.Errors.Add($"{portal.Slug}: {ex.Message}");
                continue; // przejdź do następnego portalu
            }

            // 3b. Pobierz oferty bez analizy
            var unanalyzed = await Workflow.ExecuteActivityAsync(
                (JobScrapingActivities a) => a.GetUnanalyzedOffers(portal.Slug, 20),
                FastOptions);

            if (unanalyzed.Count == 0)
            {
                Workflow.Logger.LogInformation(
                    "No new offers to analyze for {Portal}", portal.Slug);
                continue;
            }

            Workflow.Logger.LogInformation(
                "Analyzing {Count} new offers from {Portal}", unanalyzed.Count, portal.Slug);

            var passed = new List<(OfferToAnalyze Offer, ScoringResult Scoring)>();

            foreach (var offer in unanalyzed)
            {
                // 3c. Pre-screening każdej oferty (gemma:e2b — szybki)
                try
                {
                    var preScreen = await Workflow.ExecuteActivityAsync(
                        (JobScrapingActivities a) => a.PreScreenOffer(offer, profile),
                        AiOptions);

                    result.TotalPrescreened++;

                    if (preScreen.Score >= 5)
                    {
                        Workflow.Logger.LogInformation(
                            "PASS [{Score}/10] {Title}", preScreen.Score, offer.Title);

                        // 3d. Scoring tylko ofert które przeszły pre-screening (gemma:e4b)
                        try
                        {
                            var scoring = await Workflow.ExecuteActivityAsync(
                                (JobScrapingActivities a) => a.ScoreOffer(offer, profile),
                                AiOptions);

                            result.TotalScored++;

                            if (scoring.Score >= 7)
                            {
                                passed.Add((offer, scoring));

                                result.TopOffers.Add(new TopOffer(
                                    offer.Id, offer.Title ?? "?", offer.Url,
                                    scoring.Score, scoring.MatchReasons));

                                Workflow.Logger.LogInformation(
                                    "TOP OFFER [{Score}/10] {Title}", 
                                    scoring.Score, offer.Title);
                            }
                        }
                        catch (Exception ex)
                        {
                            Workflow.Logger.LogError(
                                "Scoring failed for offer {Id}: {Error}", offer.Id, ex.Message);
                        }
                    }
                    else
                    {
                        Workflow.Logger.LogInformation(
                            "FAIL [{Score}/10] {Title} — {Reason}",
                            preScreen.Score, offer.Title, preScreen.Reason);
                    }
                }
                catch (Exception ex)
                {
                    Workflow.Logger.LogError(
                        "PreScreen failed for offer {Id}: {Error}", offer.Id, ex.Message);
                }
            }
            
            // 3e. Generuj propozycje dla TOP ofert (score >= 7)
            foreach (var (offer, scoring) in passed)
            {
                try
                {
                    var proposal = await Workflow.ExecuteActivityAsync(
                        (JobScrapingActivities a) => a.GenerateProposals(offer, profile, scoring),
                        ProposalOptions);
 
                    result.TotalProposals++;
 
                    Workflow.Logger.LogInformation(
                        "PROPOSAL GENERATED [{Lang}] {Title}",
                        proposal.Language, offer.Title);
                }
                catch (Exception ex)
                {
                    Workflow.Logger.LogError(
                        "Proposal generation failed for {Id}: {Error}", offer.Id, ex.Message);
                }
            }
        }

        Workflow.Logger.LogInformation(
            "Job scraping complete. Scraped={S} Saved={Sv} Prescreened={P} Scored={Sc} Top={T} Proposals={Pr}",
            result.TotalScraped, result.TotalSaved, result.TotalPrescreened,
            result.TotalScored, result.TopOffers.Count, result.TotalProposals);

        return result;
    }
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

public record JobScrapingInput(
    string? Category   = null,   // null = wszystkie kategorie
    string? PortalSlug = null,   // null = wszystkie portale w kategorii
    int?    Limit      = 50,     // max ofert na portal
    string? UserId     = null    // null = domyślny użytkownik
);

public class JobScrapingResult
{
    public int TotalScraped      { get; set; }
    public int TotalSaved        { get; set; }
    public int TotalDuplicates   { get; set; }
    public int TotalPrescreened  { get; set; }
    public int TotalScored       { get; set; }
    public int TotalProposals    { get; set; }
    public List<TopOffer> TopOffers { get; set; } = [];
    public List<string>   Errors    { get; set; } = [];
}

public record TopOffer(
    string Id, string Title, string Url,
    int Score, List<string> MatchReasons);