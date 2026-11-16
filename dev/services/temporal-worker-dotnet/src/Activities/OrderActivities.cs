using Temporalio.Activities;

public class OrderActivities
{
    [Activity]
    public string ProcessOrder(string orderId)
    {
        Console.WriteLine($"[Activity] Processing order {orderId}");
        return $"Order {orderId} processed successfully";
    }
}
