using System.Net.Http.Json;
using Temporalio.Activities;

/// <summary>
/// Activities integrujące Temporal z Playwright Bridge i Ollama.
/// Rejestracja w Program.cs: builder.Services.AddHostedTemporalWorker("dev-task-queue")
///     .AddSingletonActivities<PlaywrightActivities>();
/// </summary>
public class PlaywrightActivities
{
    private static readonly HttpClient Http = new()
    {
        BaseAddress = new Uri(Environment.GetEnvironmentVariable("PLAYWRIGHT_HOST") 
                              ?? "http://playwright-bridge:3000"),
        Timeout = TimeSpan.FromSeconds(60)
    };

    // ── /browse ──────────────────────────────────────────────────────────────

    [Activity]
    public async Task<BrowseResult> BrowseUrl(string url)
    {
        var response = await Http.PostAsJsonAsync("/browse", new { url });
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<BrowseResult>()
               ?? throw new InvalidOperationException("Empty response from Playwright Bridge");
    }

    // ── /screenshot ──────────────────────────────────────────────────────────

    [Activity]
    public async Task<string> TakeScreenshot(string url, bool fullPage = false)
    {
        var response = await Http.PostAsJsonAsync("/screenshot", new { url, fullPage });
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<ScreenshotResult>()
                     ?? throw new InvalidOperationException("Empty response from Playwright Bridge");
        return result.Image; // base64 PNG
    }

    // ── /scrape ──────────────────────────────────────────────────────────────

    [Activity]
    public async Task<ScrapeResult> ScrapeSelector(string url, string selector)
    {
        var response = await Http.PostAsJsonAsync("/scrape", new { url, selector });
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<ScrapeResult>()
               ?? throw new InvalidOperationException("Empty response from Playwright Bridge");
    }

    // ── /ai-browse ───────────────────────────────────────────────────────────

    [Activity]
    public async Task<AiBrowseResult> AiBrowse(string url, string prompt, string model = "llama3.2:1b")
    {
        var response = await Http.PostAsJsonAsync("/ai-browse", new { url, prompt, model });
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<AiBrowseResult>()
               ?? throw new InvalidOperationException("Empty response from Playwright Bridge");
    }
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

public record BrowseResult(string Url, string Title, string Text);

public record ScreenshotResult(string Url, string Image);

public record ScrapeItem(string? Text, string? Href, string? Src);
public record ScrapeResult(string Url, string Selector, int Count, List<ScrapeItem> Items);

public record AiBrowseResult(string Url, string Title, string Model, string Analysis);