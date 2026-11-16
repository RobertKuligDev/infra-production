#!/bin/bash
# scripts/create-networks.sh - Idempotent Docker network creation

echo "🔗 Creating Docker networks for ${COMPOSE_PROJECT_NAME:-infrastructure}..."

# Traefik network (shared across all stacks)
if ! docker network inspect traefik-net >/dev/null 2>&1; then
    docker network create traefik-net
    echo "  ✓ Created shared network: traefik-net"
else
    echo "  ✓ Using existing network: traefik-net"
fi

# Internal application network (project-scoped)
INTERNAL_NET="${COMPOSE_PROJECT_NAME:-infra}_internal"
if ! docker network inspect "$INTERNAL_NET" >/dev/null 2>&1; then
    docker network create "$INTERNAL_NET"
    echo "  ✓ Created internal network: $INTERNAL_NET"
else
    echo "  ✓ Using existing network: $INTERNAL_NET"
fi

# List all relevant networks
echo ""
echo "📋 Available networks:"
docker network ls --filter "name=traefik\|${COMPOSE_PROJECT_NAME:-infra}" --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"
