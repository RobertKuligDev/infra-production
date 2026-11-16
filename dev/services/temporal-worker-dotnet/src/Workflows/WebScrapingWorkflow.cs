using Temporalio.Workflows;
using Temporalio.Common;

/// <summary>
/// Przykładowy workflow: scraping strony + analiza AI
/// Uruchomienie:
///   temporal workflow start \
///     --task-queue dev-task-queue \
///     --type WebScrapingWorkflow \
///     --input '"https://example.com"' \
///     --workflow-id scrape-001
/// </summary>
[Workflow]
public class WebScrapingWorkflow
{
    private static readonly ActivityOptions DefaultOptions = new()
    {
        StartToCloseTimeout = TimeSpan.FromSeconds(60),
        RetryPolicy = new RetryPolicy
        {
            MaximumAttempts = 3,
            InitialInterval = TimeSpan.FromSeconds(2),
            BackoffCoefficient = 2
        }
    };

    [WorkflowRun]
    public async Task<WebScrapingResult> RunAsync(string url)
    {
        // 1. Pobierz podstawowe info o stronie
        var browseResult = await Workflow.ExecuteActivityAsync(
            (PlaywrightActivities a) => a.BrowseUrl(url),
            DefaultOptions);

        // 2. Zrób screenshot
        var screenshot = await Workflow.ExecuteActivityAsync(
            (PlaywrightActivities a) => a.TakeScreenshot(url, false),
            DefaultOptions);

        // 3. Analiza AI - co robi ta strona?
        var aiResult = await Workflow.ExecuteActivityAsync(
            (PlaywrightActivities a) => a.AiBrowse(
                url,
                "Summarize what this page is about in 2-3 sentences.",
                "llama3.2:1b"),
            DefaultOptions);

        return new WebScrapingResult(
            Url: url,
            Title: browseResult.Title,
            Summary: aiResult.Analysis,
            ScreenshotBase64: screenshot
        );
    }
}

public record WebScrapingResult(string Url, string Title, string Summary, string ScreenshotBase64);