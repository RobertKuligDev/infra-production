#!/bin/bash
# scripts/wait-for-services.sh - Wait for Docker services to become healthy

SERVICE_NAME=$1
TIMEOUT=${2:-120}  # Default 2 minutes
INTERVAL=${3:-5}   # Check every 5 seconds

if [ -z "$SERVICE_NAME" ]; then
    echo "Usage: $0 <service_name> [timeout_seconds] [check_interval]"
    echo "Example: $0 postgres 60 3"
    exit 1
fi

echo "⏳ Waiting for '$SERVICE_NAME' to be healthy (timeout: ${TIMEOUT}s)..."

START_TIME=$(date +%s)
ELAPSED=0

while [ $ELAPSED -lt $TIMEOUT ]; do
    # Check service health status
    if docker compose ps "$SERVICE_NAME" 2>/dev/null | grep -q "(healthy)"; then
        echo "✅ '$SERVICE_NAME' is healthy! (took ${ELAPSED}s)"
        exit 0
    fi
    
    # Show progress every 10 seconds
    if [ $((ELAPSED % 10)) -eq 0 ]; then
        echo -n "[${ELAPSED}s]"
    else
        echo -n "."
    fi
    
    sleep $INTERVAL
    
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
done

# Timeout reached
echo ""
echo "❌ ERROR: '$SERVICE_NAME' did not become healthy within ${TIMEOUT} seconds"
echo ""
echo "Last 20 logs for '$SERVICE_NAME':"
docker compose logs "$SERVICE_NAME" --tail=20 2>/dev/null || echo "Could not retrieve logs"
exit 1
