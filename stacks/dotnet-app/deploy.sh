#!/usr/bin/env bash
# =============================================================================
# FILE: deploy.sh
# DESCRIPTION: Deployment script for .NET applications stack
# VERSION: 1.0 - Environment variables migration
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STACK_NAME="${STACK_NAME:-dotnet-app}"

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    .NET Applications Stack                   ║${NC}"
echo -e "${CYAN}║                    Deployment Script                         ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo -e "${BLUE}==> Deploying ${STACK_NAME} Stack${NC}"
echo ""

# Function to print error and exit
error_exit() {
    echo -e "${RED}❌ ERROR: $1${NC}" >&2
    exit 1
}

# Function to print success
success_msg() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print warning
warning_msg() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print info
info_msg() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
echo -e "${PURPLE}🔍 Checking prerequisites...${NC}"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    error_exit "Docker is not installed or not in PATH"
fi

# Check if docker compose is available
if ! docker compose version &> /dev/null; then
    error_exit "Docker Compose is not available"
fi

success_msg "Docker and Docker Compose are available"

# Check if .env file exists
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    error_exit ".env file not found at $SCRIPT_DIR/.env
    
Please create it from the example:
  cp $SCRIPT_DIR/.env.example $SCRIPT_DIR/.env
  nano $SCRIPT_DIR/.env
  
Make sure to configure at least:
  - DOTNET_IMAGE
  - DOMAIN
  - POSTGRES_PASSWORD (or your chosen DB password)
  - JWT_SECRET"
fi

success_msg ".env file found"

# Load environment variables
echo -e "${PURPLE}📋 Loading environment configuration...${NC}"
set -a
source "$SCRIPT_DIR/.env"
set +a

# Validate required variables
REQUIRED_VARS=(
    "DOTNET_IMAGE"
    "DOMAIN"
    "POSTGRES_PASSWORD"
    "JWT_SECRET"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var:-}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    error_exit "Missing required environment variables in .env:
    ${MISSING_VARS[*]}
    
Please set these variables in $SCRIPT_DIR/.env"
fi

success_msg "All required variables are set"
echo ""

# Navigate to stack directory
cd "$SCRIPT_DIR"

# Check if Traefik network exists
if ! docker network inspect "${TRAEFIK_NETWORK:-traefik-net}" &> /dev/null; then
    warning_msg "Traefik network '${TRAEFIK_NETWORK:-traefik-net}' not found"
    info_msg "Creating network..."
    docker network create "${TRAEFIK_NETWORK:-traefik-net}" || error_exit "Failed to create network"
    success_msg "Network created"
fi

# Pull latest images
echo -e "${PURPLE}🐳 Pulling latest images...${NC}"
docker compose pull || warning_msg "Some images could not be pulled (may need to build)"
echo ""

# Build if BUILD_CONTEXT is set
if [ -n "${BUILD_CONTEXT:-}" ]; then
    echo -e "${PURPLE}🔨 Building application image...${NC}"
    docker compose build || error_exit "Build failed"
    success_msg "Build completed"
    echo ""
else
    info_msg "BUILD_CONTEXT not set - using pre-built image: ${DOTNET_IMAGE}"
    echo ""
fi

# Stop existing containers
echo -e "${PURPLE}🛑 Stopping existing containers...${NC}"
docker compose down --remove-orphans 2>/dev/null || true
echo ""

# Start services
echo -e "${PURPLE}🚀 Starting services...${NC}"
docker compose up -d || error_exit "Failed to start services"
echo ""

# Wait for services to be healthy
echo -e "${PURPLE}⏳ Waiting for services to initialize...${NC}"
sleep 10

# Check service health
echo -e "${BLUE}📋 Service Status:${NC}"
docker compose ps
echo ""

# Verify main app is running
if docker compose ps | grep -q "${STACK_NAME:-dotnet}-app.*Up"; then
    success_msg "Application is running"
else
    warning_msg "Application may still be starting up"
    info_msg "Check logs: docker compose logs -f app"
fi

# Run migrations if needed
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    echo -e "${PURPLE}🔄 Running database migrations...${NC}"
    docker compose --profile tools run --rm migrate || warning_msg "Migration failed - check logs"
    echo ""
fi

# Clean up dangling images
echo -e "${PURPLE}🧹 Cleaning up unused images...${NC}"
docker image prune -f > /dev/null 2>&1 || true
echo ""

echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           🎉 Deployment Completed Successfully!              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}🔗 Access your application:${NC}"
echo -e "   ${GREEN}https://${DOMAIN}${NC}"
echo ""
echo -e "${CYAN}📋 Useful commands:${NC}"
echo "   View logs:        docker compose -f $SCRIPT_DIR/docker-compose.yml logs -f"
echo "   View app logs:    docker compose -f $SCRIPT_DIR/docker-compose.yml logs -f app"
echo "   Check status:     docker compose -f $SCRIPT_DIR/docker-compose.yml ps"
echo "   Restart app:      docker compose -f $SCRIPT_DIR/docker-compose.yml restart app"
echo "   Stop all:         docker compose -f $SCRIPT_DIR/docker-compose.yml down"
echo "   Run migrations:   docker compose -f $SCRIPT_DIR/docker-compose.yml --profile tools run --rm migrate"
echo ""
echo -e "${CYAN}🔍 Health check:${NC}"
echo "   curl https://${DOMAIN}${HEALTH_CHECK_PATH:-/health}"
echo ""
