using System.Threading.Tasks;
using Temporalio.Workflows;
using Temporalio.Common;

[Workflow]
public class OrderWorkflow
{
    [WorkflowRun]
    public async Task<string> RunAsync(string orderId)
    {
        var result = await Workflow.ExecuteActivityAsync(
            (OrderActivities act) => act.ProcessOrder(orderId),
            new ActivityOptions
            {
                StartToCloseTimeout = TimeSpan.FromSeconds(10),
                RetryPolicy = new RetryPolicy
                {
                    MaximumAttempts = 5,
                    InitialInterval = TimeSpan.FromSeconds(1),
                    BackoffCoefficient = 2
                }
            });

        return result;
    }
}
