import express from "express";
import { chromium } from "playwright-core";
import pg from "pg";

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT        = process.env.PORT        || 3000;
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://ollama:11434";

// ─── PostgreSQL ───────────────────────────────────────────────────────────────

const db = new pg.Pool({
  host:     process.env.POSTGRES_HOST     || "postgres",
  port:     parseInt(process.env.POSTGRES_PORT || "5432"),
  database: process.env.POSTGRES_DB       || "devdb",
  user:     process.env.POSTGRES_USER     || "dev",
  password: process.env.POSTGRES_PASSWORD || "",
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function withBrowser(fn) {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    return await fn(browser);
  } finally {
    await browser.close();
  }
}

async function ollamaGenerate(model, prompt) {
  const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.response;
}

// ─── Health ───────────────────────────────────────────────────────────────────

app.get("/health", async (_req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok", ollama: OLLAMA_HOST, db: "connected" });
  } catch {
    res.json({ status: "ok", ollama: OLLAMA_HOST, db: "disconnected" });
  }
});

// ─── /browse ──────────────────────────────────────────────────────────────────

app.post("/browse", async (req, res) => {
  const { url, waitUntil = "domcontentloaded" } = req.body;
  if (!url) return res.status(400).json({ error: "url is required" });
  try {
    const result = await withBrowser(async (browser) => {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil, timeout: 30_000 });
      const title = await page.title();
      const text  = await page.evaluate(() => document.body?.innerText?.slice(0, 5000) ?? "");
      return { url, title, text };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── /screenshot ──────────────────────────────────────────────────────────────

app.post("/screenshot", async (req, res) => {
  const { url, fullPage = false } = req.body;
  if (!url) return res.status(400).json({ error: "url is required" });
  try {
    const result = await withBrowser(async (browser) => {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
      const screenshot = await page.screenshot({ fullPage, type: "png" });
      return { url, image: screenshot.toString("base64") };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── /scrape ──────────────────────────────────────────────────────────────────

app.post("/scrape", async (req, res) => {
  const { url, selector } = req.body;
  if (!url || !selector) return res.status(400).json({ error: "url and selector are required" });
  try {
    const result = await withBrowser(async (browser) => {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
      const items = await page.$$eval(selector, (els) =>
        els.map((el) => ({ text: el.innerText?.trim(), href: el.href ?? null, src: el.src ?? null }))
      );
      return { url, selector, count: items.length, items };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── /form ────────────────────────────────────────────────────────────────────

app.post("/form", async (req, res) => {
  const { url, fields = [], submit } = req.body;
  if (!url) return res.status(400).json({ error: "url is required" });
  try {
    const result = await withBrowser(async (browser) => {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
      for (const { selector, value } of fields) await page.fill(selector, value);
      if (submit) {
        await Promise.all([
          page.waitForNavigation({ timeout: 15_000 }).catch(() => {}),
          page.click(submit),
        ]);
      }
      return { success: true, title: await page.title(), url: page.url() };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── /ai-browse ───────────────────────────────────────────────────────────────

app.post("/ai-browse", async (req, res) => {
  const { url, prompt, model = "llama3.2:1b" } = req.body;
  if (!url || !prompt) return res.status(400).json({ error: "url and prompt are required" });
  try {
    const pageContent = await withBrowser(async (browser) => {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
      const title = await page.title();
      const text  = await page.evaluate(() => document.body?.innerText?.slice(0, 4000) ?? "");
      return { title, text };
    });
    const analysis = await ollamaGenerate(model,
      `Page title: ${pageContent.title}\n\nPage content:\n${pageContent.text}\n\nTask: ${prompt}`
    );
    res.json({ url, title: pageContent.title, model, analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── /scrape-portal ───────────────────────────────────────────────────────────
// Główny endpoint job scrapingu
// Czyta konfigurację z PostgreSQL, scrape'uje portal, zapisuje surowe oferty
// Body: { portal: string, limit?: number }
// Przykład: { "portal": "justjoin" }

app.post("/scrape-portal", async (req, res) => {
  const { portal: portalSlug, limit = 50 } = req.body;
  if (!portalSlug) return res.status(400).json({ error: "portal is required" });

  // 1. Pobierz konfigurację portalu z bazy
  const portalResult = await db.query(
    `SELECT p.*, c.slug as category_slug
     FROM portals p
     JOIN portal_categories c ON c.id = p.category_id
     WHERE p.slug = $1 AND p.active = true`,
    [portalSlug]
  );

  if (portalResult.rows.length === 0) {
    return res.status(404).json({ error: `Portal '${portalSlug}' not found or inactive` });
  }

  const portal = portalResult.rows[0];
  const sel    = portal.selectors;
  const filters = portal.filters || {};

  console.log(`[scrape-portal] Starting: ${portal.name} (${portal.url})`);

  try {
    // 2. Scraping
    const rawItems = await withBrowser(async (browser) => {
      const page = await browser.newPage();

      // Blokuj obrazy i fonty dla szybkości
      await page.route("**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf}", r => r.abort());

      await page.goto(portal.url, { waitUntil: "domcontentloaded", timeout: 60_000 });

      // Poczekaj na elementy ofert
      if (sel.wait_for) {
        await page.waitForSelector(sel.wait_for, { timeout: 30_000 }).catch(() => {});
      }

      // Wyciągnij oferty
      const items = await page.$$eval(
        sel.items,
        (els, { s, lim }) => els.slice(0, lim).map(el => ({
          title:    el.querySelector(s.title)?.innerText?.trim()    ?? null,
          company:  el.querySelector(s.company)?.innerText?.trim()  ?? null,
          location: el.querySelector(s.location)?.innerText?.trim() ?? null,
          salary:   el.querySelector(s.salary)?.innerText?.trim()   ?? null,
          tags:     Array.from(el.querySelectorAll(s.tags ?? "span")).map(t => t.innerText?.trim()).filter(Boolean),
          url:      (s.link === "self" || s.link === "a") ? (el.href ?? null) : (el.querySelector(s.link)?.href ?? el.href ?? null),
        })),
        { s: sel, lim: limit }
      );

      return items;
    });

    console.log(`[scrape-portal] Scraped ${rawItems.length} items from ${portal.name}`);

    // 3. Filtrowanie po keywords/exclude
    const exclude  = (filters.exclude  || []).map(k => k.toLowerCase());
    const keywords = (filters.keywords || []).map(k => k.toLowerCase());

    const filtered = rawItems.filter(item => {
      const text = `${item.title} ${item.tags?.join(" ")}`.toLowerCase();

      // Wyklucz jeśli zawiera excluded keywords
      if (exclude.length && exclude.some(k => text.includes(k))) return false;

      // Wymagaj przynajmniej jednego keyword (jeśli podane)
      if (keywords.length && !keywords.some(k => text.includes(k))) return false;

      // Musi mieć URL i tytuł
      return item.url && item.title;
    });

    console.log(`[scrape-portal] After filters: ${filtered.length} items`);

    // 4. Zapisz do bazy (INSERT ... ON CONFLICT DO NOTHING — deduplikacja po URL)
    let saved = 0;
    let duplicates = 0;

    for (const item of filtered) {
      try {
        const result = await db.query(
          `INSERT INTO offers_raw (portal_id, url, title, company, location, salary, tags, raw_json)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (url) DO NOTHING
           RETURNING id`,
          [
            portal.id,
            item.url,
            item.title,
            item.company,
            item.location,
            item.salary,
            JSON.stringify(item.tags || []),
            JSON.stringify(item),
          ]
        );
        if (result.rows.length > 0) saved++;
        else duplicates++;
      } catch (err) {
        console.error(`[scrape-portal] DB error for ${item.url}: ${err.message}`);
      }
    }

    // 5. Zaktualizuj last_scraped_at
    await db.query(
      "UPDATE portals SET last_scraped_at = NOW() WHERE id = $1",
      [portal.id]
    );

    console.log(`[scrape-portal] Done: ${saved} new, ${duplicates} duplicates`);

    res.json({
      portal:     portalSlug,
      scraped:    rawItems.length,
      filtered:   filtered.length,
      saved,
      duplicates,
      items:      filtered,
    });

  } catch (err) {
    console.error(`[scrape-portal] Error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// ─── /portals ─────────────────────────────────────────────────────────────────
// Lista portali z bazy

app.get("/portals", async (_req, res) => {
  try {
    const result = await db.query(
      `SELECT p.slug, p.name, p.active, p.schedule, p.last_scraped_at,
              c.slug as category
       FROM portals p
       JOIN portal_categories c ON c.id = p.category_id
       ORDER BY c.slug, p.slug`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── /offers ──────────────────────────────────────────────────────────────────
// Ostatnie zapisane oferty z opcjonalnym filtrem po portalu

app.get("/offers", async (req, res) => {
  const { portal, limit = 20 } = req.query;
  try {
    const result = await db.query(
      `SELECT r.id, r.title, r.company, r.salary, r.location, r.tags,
              r.url, r.scraped_at, p.slug as portal, p.name as portal_name
       FROM offers_raw r
       JOIN portals p ON p.id = r.portal_id
       ${portal ? "WHERE p.slug = $2" : ""}
       ORDER BY r.scraped_at DESC
       LIMIT $1`,
      portal ? [limit, portal] : [limit]
    );
    res.json({ count: result.rows.length, offers: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── /models ──────────────────────────────────────────────────────────────────

app.get("/models", async (_req, res) => {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Playwright Bridge running on port ${PORT}`);
  console.log(`Ollama: ${OLLAMA_HOST}`);
  console.log(`DB: ${process.env.POSTGRES_HOST || "postgres"}:${process.env.POSTGRES_DB || "devdb"}`);
});