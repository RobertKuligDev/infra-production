#!/usr/bin/env bash
# =============================================================================
# FILE: health-check.sh
# DESCRIPTION: Health check script for .NET applications stack
# VERSION: 1.0 - Enhanced with .env support
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STACK_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Check if .env exists
if [ ! -f "$STACK_DIR/.env" ]; then
    echo -e "${RED}❌ .env file not found at $STACK_DIR/.env${NC}"
    exit 1
fi

# Load environment variables
set -a
source "$STACK_DIR/.env"
set +a

STACK_NAME="${STACK_NAME:-dotnet-app}"

echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║          .NET Application Stack - Health Check              ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

cd "$STACK_DIR"

# Initialize counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to check status
check_status() {
    local name="$1"
    local check="$2"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    echo -n "🔍 Checking $name... "
    
    if eval "$check" &>/dev/null; then
        echo -e "${GREEN}✅ OK${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Check 1: Docker Compose services running
echo -e "${BLUE}📦 Container Status:${NC}"
check_status "Docker Compose services" "docker compose ps --format json | jq -e '. | length > 0'"

# Check 2: Application container
check_status "Application container" "docker compose ps | grep -q '${STACK_NAME}-app.*Up'"

# Check 3: Database container
check_status "Database container" "docker compose ps | grep -q '${STACK_NAME}-postgres.*Up'"

echo ""

# Check 4: Database connectivity
echo -e "${BLUE}💾 Database Health:${NC}"
check_status "PostgreSQL connection" "docker compose exec -T postgres pg_isready -U ${POSTGRES_USER}"

# Check 5: Database exists
check_status "Database exists" "docker compose exec -T postgres psql -U ${POSTGRES_USER} -lqt | cut -d \\| -f 1 | grep -qw ${POSTGRES_DB}"

echo ""

# Check 6: Application health endpoint
echo -e "${BLUE}🌐 Application Health:${NC}"
if [ -n "${DOMAIN:-}" ]; then
    HEALTH_URL="https://${DOMAIN}${HEALTH_CHECK_PATH:-/health}"
    check_status "HTTPS endpoint" "curl -f -s -k -m 10 '$HEALTH_URL'"
else
    echo -e "${YELLOW}⚠️  DOMAIN not set, skipping HTTPS check${NC}"
fi

# Check 7: Application container health
check_status "Container health status" "docker compose ps app | grep -q 'healthy\\|Up'"

echo ""

# Check 8: Docker resources
echo -e "${BLUE}💻 Resource Usage:${NC}"
APP_CONTAINER=$(docker compose ps -q app)
if [ -n "$APP_CONTAINER" ]; then
    STATS=$(docker stats --no-stream --format "{{.CPUPerc}} {{.MemUsage}}" "$APP_CONTAINER" 2>/dev/null || echo "N/A N/A")
    CPU=$(echo "$STATS" | awk '{print $1}')
    MEM=$(echo "$STATS" | awk '{print $2}')
    
    echo -e "   CPU Usage:    ${BLUE}$CPU${NC}"
    echo -e "   Memory Usage: ${BLUE}$MEM${NC}"
fi

echo ""

# Check 9: Logs for errors
echo -e "${BLUE}📋 Recent Logs:${NC}"
ERROR_COUNT=$(docker compose logs --tail=100 app 2>/dev/null | grep -i "error\|exception\|fatal" | wc -l || echo "0")
if [ "$ERROR_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $ERROR_COUNT errors in recent logs${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
else
    echo -e "${GREEN}✅ No errors in recent logs${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

echo ""

# Summary
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                      Health Check Summary                     ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "Total Checks: ${BLUE}$TOTAL_CHECKS${NC}"
echo -e "Passed:       ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed:       ${RED}$FAILED_CHECKS${NC}"
echo ""

# Calculate percentage
if [ $TOTAL_CHECKS -gt 0 ]; then
    PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
    echo -e "Health Score: ${BLUE}${PERCENTAGE}%${NC}"
    echo ""
fi

# Exit code based on critical checks
if docker compose ps | grep -q "Exit\|unhealthy"; then
    echo -e "${RED}❌ CRITICAL: Some services are down or unhealthy${NC}"
    echo ""
    echo -e "${YELLOW}📋 Service Status:${NC}"
    docker compose ps
    echo ""
    exit 1
fi

if [ $FAILED_CHECKS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  WARNING: Some health checks failed${NC}"
    echo ""
    echo -e "${BLUE}💡 Troubleshooting:${NC}"
    echo "   • Check logs: docker compose logs -f"
    echo "   • Restart services: docker compose restart"
    echo "   • Verify .env configuration"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ All health checks passed!${NC}"
echo ""
echo -e "${BLUE}📊 Quick Stats:${NC}"
docker compose ps
echo ""

exit 0
