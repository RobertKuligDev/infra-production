#!/bin/bash
# scripts/status.sh - Unified status reporting for all infrastructure stacks

echo "📊 INFRASTRUCTURE STATUS REPORT"
echo "================================"
echo "Generated: $(date)"
echo "Project: ${COMPOSE_PROJECT_NAME:-infra-production}"
echo ""

# ------------------------------------------------------------
# TRAEFIK STATUS
# ------------------------------------------------------------
echo "🚦 TRAEFIK REVERSE PROXY:"
echo "-------------------------"
if [ -d "reverse-proxy/traefik" ]; then
    cd reverse-proxy/traefik 2>/dev/null
    docker compose ps 2>/dev/null || echo "  Traefik not running"
    cd - >/dev/null
else
    echo "  Traefik directory not found"
fi

# ------------------------------------------------------------
# .NET APPLICATION STATUS
# ------------------------------------------------------------
echo ""
echo "🚀 .NET APPLICATION STACK:"
echo "--------------------------"
if [ -d "stacks/dotnet-app" ]; then
    cd stacks/dotnet-app 2>/dev/null
    docker compose ps 2>/dev/null || echo "  .NET app not running"
    cd - >/dev/null
else
    echo "  .NET app directory not found"
fi

# ------------------------------------------------------------
# NETWORK INFORMATION
# ------------------------------------------------------------
echo ""
echo "🔗 DOCKER NETWORKS:"
echo "-------------------"
docker network ls --filter "name=traefik\|${COMPOSE_PROJECT_NAME:-infra}" --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}" 2>/dev/null || echo "  No networks found"

# ------------------------------------------------------------
# VOLUME INFORMATION
# ------------------------------------------------------------
echo ""
echo "💾 DOCKER VOLUMES:"
echo "------------------"
docker volume ls --filter "name=${COMPOSE_PROJECT_NAME:-infra}" --format "table {{.Name}}\t{{.Driver}}\t{{.Mountpoint}}" 2>/dev/null | head -20 || echo "  No volumes found"

# ------------------------------------------------------------
# RESOURCE USAGE
# ------------------------------------------------------------
echo ""
echo "📈 RESOURCE USAGE (top 10 containers):"
echo "--------------------------------------"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" 2>/dev/null | head -11 || echo "  Could not retrieve stats"

# ------------------------------------------------------------
# RECENT ERRORS
# ------------------------------------------------------------
echo ""
echo "⚠ RECENT ERRORS (last hour):"
echo "----------------------------"
for stack in reverse-proxy/traefik stacks/dotnet-app; do
    if [ -d "$stack" ]; then
        echo "$(basename $stack):"
        cd "$stack" 2>/dev/null
        docker compose logs --since 1h 2>/dev/null | grep -i "error\|fail\|exception\|panic" | tail -5 || echo "  No recent errors"
        cd - >/dev/null
    fi
done

echo ""
echo "✅ Status check complete"
