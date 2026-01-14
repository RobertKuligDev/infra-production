#!/usr/bin/env bash
# =============================================================================
# FILE: deploy.sh
# DESCRIPTION: Deployment script for Traefik reverse proxy
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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    Traefik Reverse Proxy                     ║${NC}"
echo -e "${CYAN}║                    Deployment Script v1.1                    ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
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
  - ACME_EMAIL (for Let's Encrypt)
  - TRAEFIK_DASHBOARD_DOMAIN (optional)
  - TRAEFIK_DASHBOARD_AUTH (recommended for production)"
fi

success_msg ".env file found"

# Load environment variables
echo -e "${PURPLE}📋 Loading environment configuration...${NC}"
set -a
source "$SCRIPT_DIR/.env"
set +a

# =============================================================================
# SECURITY VALIDATION - NEW
# =============================================================================
echo -e "${PURPLE}🔒 Validating security configuration...${NC}"

# Validate required variables
if [ -z "${ACME_EMAIL:-}" ]; then
    error_exit "ACME_EMAIL is required in .env for Let's Encrypt certificates"
fi

# Security warning for API_INSECURE
if [ "${API_INSECURE:-true}" = "true" ]; then
    warning_msg "API_INSECURE=true - This is INSECURE for production!"
    read -p "Continue anyway? (NOT recommended for production) [y/N]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Edit .env and set API_INSECURE=false, then run again."
        exit 1
    fi
else
    success_msg "API_INSECURE=false (secure)"
fi

# Validate ACME email format
if [[ ! "$ACME_EMAIL" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
    warning_msg "ACME_EMAIL format may be invalid: $ACME_EMAIL"
fi

# Check if dashboard port is exposed (security issue)
if grep -q '"8080:8080"' "$SCRIPT_DIR/docker-compose.yml" 2>/dev/null || 
   grep -q '"${DASHBOARD_PORT:-8080}:8080"' "$SCRIPT_DIR/docker-compose.yml" 2>/dev/null; then
    warning_msg "Dashboard port 8080 is exposed externally - security risk!"
    echo "Recommendation: Remove port 8080 mapping from docker-compose.yml"
    echo "Dashboard will still be accessible via: https://${TRAEFIK_DASHBOARD_DOMAIN:-your-domain}"
fi

success_msg "Security validation completed"
echo ""

# Ensure network exists
if ! docker network inspect traefik-net >/dev/null 2>&1; then
    echo -e "${PURPLE}🌐 Creating traefik-net network...${NC}"
    docker network create traefik-net || error_exit "Failed to create network"
    success_msg "Created traefik-net network"
else
    info_msg "traefik-net network already exists"
fi

# Create letsencrypt directory and acme.json with proper permissions
echo -e "${PURPLE}🔒 Setting up SSL certificate storage...${NC}"
mkdir -p "$SCRIPT_DIR/letsencrypt"
touch "$SCRIPT_DIR/letsencrypt/acme.json"
chmod 600 "$SCRIPT_DIR/letsencrypt/acme.json"
success_msg "SSL certificate storage configured"
echo ""

cd "$SCRIPT_DIR"

# Validate docker-compose configuration
echo -e "${PURPLE}🔧 Validating Docker Compose configuration...${NC}"
if docker compose config >/dev/null 2>&1; then
    success_msg "Docker Compose configuration is valid"
else
    error_exit "Docker Compose configuration is invalid. Run: docker compose config"
fi
echo ""

# Pull latest Traefik image
echo -e "${PURPLE}🐳 Pulling latest Traefik image...${NC}"
docker compose pull || warning_msg "Could not pull image (may already be latest)"
echo ""

# Stop existing Traefik (if running)
echo -e "${PURPLE}🛑 Stopping existing Traefik...${NC}"
docker compose down 2>/dev/null || true
echo ""

# Deploy Traefik
echo -e "${PURPLE}🚀 Deploying Traefik...${NC}"
docker compose up -d || error_exit "Failed to start Traefik"
echo ""

# Wait for Traefik to initialize
echo -e "${PURPLE}⏳ Waiting for Traefik to initialize...${NC}"
sleep 5

# Check if Traefik is running
if docker ps | grep -q "traefik"; then
    success_msg "Traefik is running"
else
    error_exit "Traefik failed to start. Check logs: docker logs traefik"
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           🎉 Traefik Deployed Successfully!                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Display access information
echo -e "${CYAN}🔗 Access Points:${NC}"
if [ -n "${TRAEFIK_DASHBOARD_DOMAIN:-}" ]; then
    echo -e "   ${GREEN}Dashboard (HTTPS): https://${TRAEFIK_DASHBOARD_DOMAIN}/dashboard/${NC}"
else
    echo -e "   ${YELLOW}Dashboard Domain: Not configured - set TRAEFIK_DASHBOARD_DOMAIN in .env${NC}"
fi

if [ "${API_INSECURE:-true}" = "true" ]; then
    echo -e "   ${RED}Dashboard (INSECURE): http://$(hostname -I | awk '{print $1}'):8080/dashboard/${NC}"
    echo -e "   ${YELLOW}⚠️  Warning: Insecure access enabled - disable in production${NC}"
else
    echo -e "   ${GREEN}✅ Dashboard: HTTPS only (secure)${NC}"
fi
echo ""

echo -e "${CYAN}📊 Monitoring Endpoints:${NC}"
if [ "${ENABLE_METRICS:-false}" = "true" ]; then
    echo -e "   ${GREEN}Metrics:  http://$(hostname -I | awk '{print $1}'):8080/metrics${NC}"
fi
echo -e "   ${BLUE}Health:   http://$(hostname -I | awk '{print $1}'):8080/ping${NC}"
echo ""

echo -e "${CYAN}📋 Useful commands:${NC}"
echo "   View logs:        docker logs traefik -f"
echo "   Check status:     docker ps | grep traefik"
echo "   Restart:          docker compose -f $SCRIPT_DIR/docker-compose.yml restart"
echo "   Stop:             docker compose -f $SCRIPT_DIR/docker-compose.yml down"
echo "   Validate config:  docker compose config"
echo ""

# Security warnings
if [ -z "${TRAEFIK_DASHBOARD_AUTH:-}" ]; then
    echo -e "${RED}⚠️  SECURITY WARNING:${NC}"
    echo -e "${YELLOW}   Dashboard authentication is NOT configured!${NC}"
    echo -e "${YELLOW}   Set TRAEFIK_DASHBOARD_AUTH in .env${NC}"
    echo ""
    echo -e "${BLUE}   Generate credentials:${NC}"
    echo "   echo \$(htpasswd -nb admin your_password)"
    echo "   Add output to TRAEFIK_DASHBOARD_AUTH in .env"
    echo ""
fi

if grep -q "8080:8080" "$SCRIPT_DIR/docker-compose.yml"; then
    echo -e "${YELLOW}⚠️  PRODUCTION RECOMMENDATION:${NC}"
    echo -e "${YELLOW}   Port 8080 is exposed. Consider:${NC}"
    echo "   - Using firewall to restrict access"
    echo "   - Removing port 8080 exposure in docker-compose.yml"
    echo "   - Accessing dashboard only via HTTPS"
    echo ""
fi

echo -e "${BLUE}📖 Next steps:${NC}"
echo "   1. Deploy your application stacks"
echo "   2. Monitor routing in the dashboard"
echo "   3. Check SSL certificates are issued"
echo "   4. Configure dashboard authentication"
echo ""