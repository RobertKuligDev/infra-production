#!/bin/bash
# =============================================================================
# DevMorph — Load portals.yml into PostgreSQL
# Użycie: ./load-portals.sh
# =============================================================================

set -e

CONTAINER="dev-postgres"
DB="${POSTGRES_DB}"
USER="${POSTGRES_USER}"
CONFIG_FILE="./services/playwright-bridge/config/portals.yml"

echo "🔄 Loading portals.yml into PostgreSQL..."

# Parsowanie YAML przez Python (dostępny w większości systemów)
python3 - <<'PYTHON'
import subprocess, json, os, sys

try:
    import yaml
except ImportError:
    subprocess.run(["pip3", "install", "pyyaml", "-q"], check=True)
    import yaml

with open("./services/playwright-bridge/config/portals.yml") as f:
    config = yaml.safe_load(f)

container = os.getenv("CONTAINER", "dev-postgres")
db        = os.getenv("DB", "devdb")
user      = os.getenv("USER_PG", "postgres")

def pg(sql):
    result = subprocess.run(
        ["docker", "exec", container, "psql", "-U", user, "-d", db, "-c", sql],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"SQL ERROR: {result.stderr}")
    return result.returncode == 0

inserted = 0
updated  = 0

for category in config["categories"]:
    cat_slug = category["slug"]
    cat_name = category["name"]

    # Upsert kategorii
    pg(f"""
        INSERT INTO portal_categories (slug, name)
        VALUES ('{cat_slug}', '{cat_name}')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
    """)

    for portal in category.get("portals", []):
        selectors = json.dumps(portal["selectors"]).replace("'", "''")
        filters   = json.dumps(portal.get("filters", {})).replace("'", "''")
        schedule  = portal.get("schedule", "0 8 * * *")
        active    = "true" if portal.get("active", True) else "false"

        sql = f"""
            INSERT INTO portals (category_id, slug, name, url, selectors, filters, schedule, active)
            SELECT
                (SELECT id FROM portal_categories WHERE slug = '{cat_slug}'),
                '{portal["slug"]}',
                '{portal["name"]}',
                '{portal["url"]}',
                '{selectors}'::jsonb,
                '{filters}'::jsonb,
                '{schedule}',
                {active}
            ON CONFLICT (slug) DO UPDATE SET
                url       = EXCLUDED.url,
                selectors = EXCLUDED.selectors,
                filters   = EXCLUDED.filters,
                schedule  = EXCLUDED.schedule,
                active    = EXCLUDED.active;
        """
        if pg(sql):
            inserted += 1

print(f"✅ Loaded {inserted} portals from portals.yml")
PYTHON

echo "✅ Done. Verify with:"
echo "   docker exec $CONTAINER psql -U $USER -d $DB -c 'SELECT p.slug, c.slug as category, p.active FROM portals p JOIN portal_categories c ON c.id = p.category_id;'"
