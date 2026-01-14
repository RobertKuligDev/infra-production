#!/bin/bash
# deploy-all.sh - Multi-stack infrastructure deployment
set -e

echo "================================================"
echo "   INFRASTRUCTURE MULTI-STACK DEPLOYMENT"
echo "================================================"
echo "Project: ${COMPOSE_PROJECT_NAME:-infra-production}"
echo "Timestamp: $(date)"
echo ""

# Set project name for all stacks
export COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME:-infraprod}

# ------------------------------------------------------------
# 1. NETWORK SETUP
# ------------------------------------------------------------
echo "📡 Setting up Docker networks..."
./scripts/create-networks.sh

# ------------------------------------------------------------
# 2. TRAEFIK DEPLOYMENT (reverse proxy)
# ------------------------------------------------------------
echo ""
echo "🚦 Deploying Traefik (reverse proxy)..."
cd reverse-proxy/traefik
./deploy.sh
cd ../..

echo "⏳ Waiting for Traefik initialization (15 seconds)..."
sleep 15

# ------------------------------------------------------------
# 3. APPLICATION STACK DEPLOYMENT
# ------------------------------------------------------------
echo ""
echo "🚀 Deploying .NET Application Stack..."
cd stacks/dotnet-app
./deploy.sh
cd ../..

# ------------------------------------------------------------
# 4. FINAL STATUS & VERIFICATION
# ------------------------------------------------------------
echo ""
echo "✅ ALL STACKS DEPLOYED SUCCESSFULLY"
echo ""
echo "📊 Deployment Summary:"
echo "   - Traefik: https://$(cd reverse-proxy/traefik && grep -o 'TRAEFIK_DASHBOARD_DOMAIN=.*' .env.example 2>/dev/null | cut -d= -f2 || echo 'dashboard.your-domain.com')"
echo "   - .NET App: https://$(cd stacks/dotnet-app && grep -o 'DOMAIN=.*' .env.example 2>/dev/null | cut -d= -f2 || echo 'api.your-domain.com')"
echo ""
./scripts/status.sh
