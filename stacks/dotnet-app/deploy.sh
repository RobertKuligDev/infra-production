#!/usr/bin/env bash
# =============================================================================
# FILE: deploy.sh
# DESCRIPTION: Deployment script for .NET applications stack
# VERSION: 1.1 - Security fixes & enhanced validation
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
echo -e "${CYAN}║                    Deployment Script v1.1                    ║${NC}"
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

# =============================================================================
# ENHANCED SECURITY VALIDATION - NEW
# =============================================================================
echo -e "${PURPLE}🔒 Validating security configuration...${NC}"

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

# Security checks for passwords
if [[ "$POSTGRES_PASSWORD" == "ChangeMe123!" || ${#POSTGRES_PASSWORD} -lt 12 ]]; then
    warning_msg "POSTGRES_PASSWORD is weak or default!"
    echo "  Current: $POSTGRES_PASSWORD"
    echo "  Recommendation: Use at least 12 chars with mix of letters, numbers, symbols"
    read -p "Continue anyway? (NOT recommended) [y/N]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Edit .env and set a secure POSTGRES_PASSWORD"
        exit 1
    fi
else
    success_msg "POSTGRES_PASSWORD strength: OK"
fi

# JWT Secret validation
if [[ "$JWT_SECRET" == *"example"* || "$JWT_SECRET" == *"change"* || ${#JWT_SECRET} -lt 32 ]]; then
    warning_msg "JWT_SECRET may be insecure!"
    echo "  Current length: ${#JWT_SECRET} chars"
    echo "  Recommendation: Use at least 32 random chars"
    echo "  Generate: openssl rand -base64 32"
    read -p "Continue anyway? (NOT recommended) [y/N]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Edit .env and set a secure JWT_SECRET"
        exit 1
    fi
else
    success_msg "JWT_SECRET strength: OK"
fi

# Domain validation
if [[ "$DOMAIN" == *"example"* || "$DOMAIN" == *"localhost"* ]]; then
    warning_msg "DOMAIN is set to example/localhost"
    echo "  Current: $DOMAIN"
    echo "  This may cause issues with SSL certificates"
    read -p "Continue anyway? [y/N]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Edit .env and set your actual domain"
        exit 1
    fi
else
    success_msg "DOMAIN configuration: OK"
fi

success_msg "Security validation completed"
echo ""

# Navigate to stack directory
cd "$SCRIPT_DIR"

# Validate docker-compose configuration
echo -e "${PURPLE}🔧 Validating Docker Compose configuration...${NC}"
if docker compose config >/dev/null 2>&1; then
    success_msg "Docker Compose configuration is valid"
else
    error_exit "Docker Compose configuration is invalid. Run: docker compose config"
fi
echo ""

# Check if Traefik network exists
if ! docker network inspect "${TRAEFIK_NETWORK:-traefik-net}" &> /dev/null; then
    warning_msg "Traefik network '${TRAEFIK_NETWORK:-traefik-net}' not found"
    info_msg "Creating network..."
    docker network create "${TRAEFIK_NETWORK:-traefik-net}" || error_exit "Failed to create network"
    success_msg "Network created"
fi

# Check if internal network exists
if ! docker network inspect "${STACK_NAME:-dotnet-app}_internal" &> /dev/null; then
    info_msg "Creating internal network..."
    docker network create "${STACK_NAME:-dotnet-app}_internal" || warning_msg "Could not create internal network"
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

# Wait for services to be healthy with better waiting
echo -e "${PURPLE}⏳ Waiting for services to initialize...${NC}"
echo -n "Waiting for PostgreSQL..."
for i in {1..30}; do
    if docker compose ps postgres 2>/dev/null | grep -q "(healthy)"; then
        success_msg " PostgreSQL is healthy"
        break
    fi
    sleep 2
    echo -n "."
    if [ $i -eq 30 ]; then
        warning_msg " PostgreSQL health check timeout"
        echo "Check logs: docker compose logs postgres"
    fi
done

echo -n "Waiting for application..."
for i in {1..45}; do
    if docker compose ps app 2>/dev/null | grep -q "(healthy)"; then
        success_msg " Application is healthy"
        break
    fi
    sleep 2
    echo -n "."
    if [ $i -eq 45 ]; then
        warning_msg " Application health check timeout"
        echo "Check logs: docker compose logs app"
    fi
done
echo ""

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

# Test application endpoint (optional)
if [ "${TEST_ENDPOINT:-true}" = "true" ]; then
    echo -e "${PURPLE}🔍 Testing application endpoint...${NC}"
    sleep 5
    if curl -s -f "https://${DOMAIN}${HEALTH_CHECK_PATH:-/health}" > /dev/null 2>&1; then
        success_msg "Application endpoint responding"
    else
        warning_msg "Application endpoint may not be ready"
        echo "Try manually: curl https://${DOMAIN}${HEALTH_CHECK_PATH:-/health}"
    fi
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