#!/usr/bin/env bash
# =============================================================================
# FILE: restore.sh
# DESCRIPTION: Restore script for .NET applications stack
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

echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║             .NET Application Stack - Restore                 ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print error and exit
error_exit() {
    echo -e "${RED}❌ ERROR: $1${NC}" >&2
    exit 1
}

# Check if .env exists
if [ ! -f "$STACK_DIR/.env" ]; then
    error_exit ".env file not found at $STACK_DIR/.env
    
Restore requires .env to be configured with database credentials."
fi

# Load environment variables
echo -e "${YELLOW}📋 Loading configuration...${NC}"
set -a
source "$STACK_DIR/.env"
set +a

# Configuration from .env
STACK_NAME="${STACK_NAME:-dotnet-app}"
BACKUP_DIR="${BACKUP_PATH:-$STACK_DIR/backups}"

# Container names
CONTAINER_NAME="${STACK_NAME}-app"
DB_CONTAINER_NAME="${STACK_NAME}-postgres"

echo -e "${GREEN}✅ Configuration loaded${NC}"
echo ""

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Usage: $0 <backup-file>${NC}"
    echo ""
    echo -e "${YELLOW}📋 Available backups:${NC}"
    if [ -d "$BACKUP_DIR" ]; then
        ls -laht "$BACKUP_DIR"/${STACK_NAME}_backup_*.tar.gz 2>/dev/null | head -10 || echo "No backups found"
    else
        echo "No backup directory found"
    fi
    echo ""
    error_exit "Backup file not specified"
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    error_exit "Backup file does not exist: $BACKUP_FILE"
fi

# Show backup info
echo -e "${BLUE}📦 Selected backup:${NC}"
echo -e "${BLUE}   File: $BACKUP_FILE${NC}"
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
BACKUP_DATE=$(stat -c %y "$BACKUP_FILE" 2>/dev/null || stat -f %Sm "$BACKUP_FILE" 2>/dev/null)
echo -e "${BLUE}   Size: ${BACKUP_SIZE}${NC}"
echo -e "${BLUE}   Date: ${BACKUP_DATE}${NC}"
echo ""

# Confirm restore
echo -e "${RED}⚠️  WARNING: This will overwrite current data and configurations!${NC}"
echo -e "${RED}   • Application will be stopped${NC}"
echo -e "${RED}   • Database will be replaced${NC}"
echo -e "${RED}   • Configuration files will be replaced${NC}"
echo ""
read -p "Are you sure you want to continue? Type 'yes' to proceed: " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo ""
echo -e "${YELLOW}🚀 Starting restore process...${NC}"
echo ""

# Create backup of current state before restore
echo -e "${YELLOW}💾 Creating safety backup of current state...${NC}"
SAFETY_BACKUP="$BACKUP_DIR/${STACK_NAME}_pre_restore_$(date +%Y%m%d_%H%M%S).tar.gz"
cd "$STACK_DIR"
docker compose exec postgres pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" 2>/dev/null | gzip > "$SAFETY_BACKUP" || true
echo -e "${GREEN}   ✅ Safety backup created: $SAFETY_BACKUP${NC}"
echo ""

# Stop services
echo -e "${YELLOW}🛑 Stopping services...${NC}"
cd "$STACK_DIR"
docker compose down
echo -e "${GREEN}   ✅ Services stopped${NC}"
echo ""

# Create temporary directory for extraction
TEMP_RESTORE_DIR=$(mktemp -d)

# Extract backup
echo -e "${YELLOW}📂 Extracting backup...${NC}"
tar -xzf "$BACKUP_FILE" -C "$TEMP_RESTORE_DIR"
echo -e "${GREEN}   ✅ Backup extracted${NC}"
echo ""

# Show backup info
if [ -f "$TEMP_RESTORE_DIR/backup_info.txt" ]; then
    echo -e "${BLUE}📋 Backup Information:${NC}"
    cat "$TEMP_RESTORE_DIR/backup_info.txt"
    echo ""
fi

# Start database for restore
echo -e "${YELLOW}🚀 Starting database...${NC}"
cd "$STACK_DIR"
docker compose up -d postgres
sleep 5

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
for i in {1..30}; do
    if docker compose exec postgres pg_isready -U "${POSTGRES_USER}" &>/dev/null; then
        echo -e "${GREEN}   ✅ Database is ready${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        error_exit "Database did not become ready in time"
    fi
done
echo ""

# Restore database if backup contains database dump
if [ -f "$TEMP_RESTORE_DIR/db_backup_${POSTGRES_DB}.sql" ]; then
    echo -e "${YELLOW}💾 Restoring database...${NC}"
    
    # Drop and recreate database
    docker compose exec -T postgres psql -U "${POSTGRES_USER}" -d postgres <<EOF
DROP DATABASE IF EXISTS "${POSTGRES_DB}";
CREATE DATABASE "${POSTGRES_DB}";
EOF
    
    # Restore database
    docker compose exec -T postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
        < "$TEMP_RESTORE_DIR/db_backup_${POSTGRES_DB}.sql"
    
    echo -e "${GREEN}   ✅ Database restored${NC}"
else
    echo -e "${YELLOW}   ⚠️  No database backup found in archive${NC}"
fi
echo ""

# Restore docker-compose.yml
if [ -f "$TEMP_RESTORE_DIR/docker-compose.yml" ]; then
    echo -e "${YELLOW}📝 Restoring docker-compose.yml...${NC}"
    cp "$TEMP_RESTORE_DIR/docker-compose.yml" "$STACK_DIR/"
    echo -e "${GREEN}   ✅ docker-compose.yml restored${NC}"
fi

# Restore configuration files
if [ -d "$TEMP_RESTORE_DIR/config" ]; then
    echo -e "${YELLOW}⚙️  Restoring configuration files...${NC}"
    rm -rf "$STACK_DIR/config"
    cp -r "$TEMP_RESTORE_DIR/config" "$STACK_DIR/"
    echo -e "${GREEN}   ✅ Configuration files restored${NC}"
fi
echo ""

# Clean up
rm -rf "$TEMP_RESTORE_DIR"

# Start all services
echo -e "${YELLOW}🚀 Starting all services...${NC}"
cd "$STACK_DIR"
docker compose up -d
echo ""

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check health
if docker compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Services are running${NC}"
else
    echo -e "${RED}⚠️  Warning: Some services may not be running${NC}"
fi
echo ""

echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                 Restore Completed Successfully!               ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📝 Next steps:${NC}"
echo "   1. Verify services: docker compose ps"
echo "   2. Check logs: docker compose logs -f"
echo "   3. Test application: curl https://${DOMAIN}${HEALTH_CHECK_PATH:-/health}"
echo "   4. Verify database: docker compose exec postgres psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}"
echo ""

echo -e "${BLUE}💡 Safety backup location:${NC}"
echo "   $SAFETY_BACKUP"
echo ""
