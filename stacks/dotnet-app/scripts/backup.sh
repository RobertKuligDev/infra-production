#!/usr/bin/env bash
# =============================================================================
# FILE: backup.sh
# DESCRIPTION: Backup script for .NET applications stack
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
echo -e "${PURPLE}║              .NET Application Stack - Backup                 ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print error and exit
error_exit() {
    echo -e "${RED}❌ ERROR: $1${NC}" >&2
    exit 1
}

# Check if .env exists
if [ ! -f "$STACK_DIR/.env" ]; then
    error_exit ".env file not found at $STACK_DIR/.env"
fi

# Load environment variables
echo -e "${YELLOW}📋 Loading configuration...${NC}"
set -a
source "$STACK_DIR/.env"
set +a

# Configuration from .env
STACK_NAME="${STACK_NAME:-dotnet-app}"
BACKUP_DIR="${BACKUP_PATH:-$STACK_DIR/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${STACK_NAME}_backup_$TIMESTAMP.tar.gz"

# Container names
CONTAINER_NAME="${STACK_NAME}-app"
DB_CONTAINER_NAME="${STACK_NAME}-postgres"

echo -e "${GREEN}✅ Configuration loaded${NC}"
echo -e "${BLUE}   Stack: ${STACK_NAME}${NC}"
echo -e "${BLUE}   Backup directory: ${BACKUP_DIR}${NC}"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Stop application temporarily (keep database running)
echo -e "${YELLOW}🛑 Stopping application temporarily...${NC}"
cd "$STACK_DIR"
docker compose stop app || true
echo ""

# Create backup archive
echo -e "${YELLOW}📦 Creating backup archive...${NC}"

# Create a temporary directory for backup content
TEMP_BACKUP_DIR=$(mktemp -d)

# Backup metadata
cat > "$TEMP_BACKUP_DIR/backup_info.txt" << EOF
Backup Information
==================
Stack Name: ${STACK_NAME}
Timestamp: ${TIMESTAMP}
Date: $(date)
Host: $(hostname)
User: $(whoami)
EOF

# Copy docker-compose.yml
echo -e "${BLUE}   • Backing up docker-compose.yml...${NC}"
cp "$STACK_DIR/docker-compose.yml" "$TEMP_BACKUP_DIR/"

# Copy .env.example (never actual .env for security)
echo -e "${BLUE}   • Backing up .env.example...${NC}"
if [ -f "$STACK_DIR/.env.example" ]; then
    cp "$STACK_DIR/.env.example" "$TEMP_BACKUP_DIR/"
fi

# Copy configuration files if they exist
if [ -d "$STACK_DIR/config" ]; then
    echo -e "${BLUE}   • Backing up config directory...${NC}"
    cp -r "$STACK_DIR/config" "$TEMP_BACKUP_DIR/"
fi

# Backup database
if docker ps | grep -q "$DB_CONTAINER_NAME"; then
    echo -e "${YELLOW}💾 Backing up PostgreSQL database...${NC}"
    DB_DUMP_FILE="$TEMP_BACKUP_DIR/db_backup_${POSTGRES_DB}.sql"
    
    docker exec "$DB_CONTAINER_NAME" pg_dump \
        -U "${POSTGRES_USER}" \
        -d "${POSTGRES_DB}" \
        -F p \
        -b \
        -v \
        > "$DB_DUMP_FILE" 2>/dev/null
    
    if [ -f "$DB_DUMP_FILE" ]; then
        DB_SIZE=$(du -h "$DB_DUMP_FILE" | cut -f1)
        echo -e "${GREEN}   ✅ Database backed up (${DB_SIZE})${NC}"
    else
        echo -e "${RED}   ❌ Database backup failed${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  Database container not running, skipping database backup${NC}"
fi

# Backup application data volumes (if needed)
if docker volume ls | grep -q "${STACK_NAME}.*data"; then
    echo -e "${YELLOW}📂 Backing up application data volumes...${NC}"
    # This is optional - uncomment if you need volume backups
    # docker run --rm -v ${STACK_NAME}_app-data:/data -v "$TEMP_BACKUP_DIR":/backup alpine tar czf /backup/app_data.tar.gz -C /data .
fi

# Create the archive
echo -e "${YELLOW}📦 Compressing backup...${NC}"
tar -czf "$BACKUP_FILE" -C "$TEMP_BACKUP_DIR" . 2>/dev/null

# Clean up temporary directory
rm -rf "$TEMP_BACKUP_DIR"

# Calculate backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
echo -e "${BLUE}   Size: ${BACKUP_SIZE}${NC}"
echo ""

# Restart services
echo -e "${YELLOW}🚀 Restarting application...${NC}"
cd "$STACK_DIR"
docker compose up -d
echo ""

# Wait for health check
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 5

# Verify services are running
if docker compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Services restarted successfully${NC}"
else
    echo -e "${RED}⚠️  Warning: Some services may not be running${NC}"
fi
echo ""

# Cleanup old backups based on retention
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
echo -e "${YELLOW}🧹 Cleaning up old backups (keeping last ${RETENTION_DAYS} days)...${NC}"
find "$BACKUP_DIR" -name "${STACK_NAME}_backup_*.tar.gz" -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true

# List recent backups
echo -e "${BLUE}📋 Recent backups:${NC}"
ls -lht "$BACKUP_DIR"/${STACK_NAME}_backup_*.tar.gz 2>/dev/null | head -5 || echo "No backups found"
echo ""

echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  Backup Completed Successfully!               ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "   • Store backup securely offsite"
echo "   • Test restore procedure periodically"
echo "   • Verify backup integrity"
echo ""
echo -e "${BLUE}💡 Restore command:${NC}"
echo "   ./scripts/restore.sh $BACKUP_FILE"
echo ""
