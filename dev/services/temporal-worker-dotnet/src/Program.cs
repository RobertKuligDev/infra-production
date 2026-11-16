using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Temporalio.Extensions.Hosting;
using Npgsql;

var builder = Host.CreateApplicationBuilder(args);

// ── Temporal ──────────────────────────────────────────────────────────────────

var temporalHost = Environment.GetEnvironmentVariable("TEMPORAL__HOST") ?? "temporal:7233";
builder.Services.AddTemporalClient(temporalHost);

// ── PostgreSQL (Npgsql DataSource) ────────────────────────────────────────────

var connString = new NpgsqlConnectionStringBuilder
{
    Host     = Environment.GetEnvironmentVariable("POSTGRES__HOST")     ?? "postgres",
    Port     = int.Parse(Environment.GetEnvironmentVariable("POSTGRES__PORT") ?? "5432"),
    Database = Environment.GetEnvironmentVariable("POSTGRES__DB")       ?? "devdb",
    Username = Environment.GetEnvironmentVariable("POSTGRES__USER")     ?? "dev",
    Password = Environment.GetEnvironmentVariable("POSTGRES__PASSWORD") ?? "",
}.ConnectionString;

builder.Services.AddSingleton(NpgsqlDataSource.Create(connString));

// ── Temporal Worker ───────────────────────────────────────────────────────────

builder.Services.AddHostedTemporalWorker("dev-task-queue")
    // Workflows
    .AddWorkflow<OrderWorkflow>()
    .AddWorkflow<WebScrapingWorkflow>()
    .AddWorkflow<JobScrapingWorkflow>()
    // Activities
    .AddSingletonActivities<OrderActivities>()
    .AddSingletonActivities<PlaywrightActivities>()
    .AddSingletonActivities<JobScrapingActivities>();

var app = builder.Build();
app.Run();