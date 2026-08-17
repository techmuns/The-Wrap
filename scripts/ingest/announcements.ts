/**
 * Ingests corporate announcements from Screener.in's logged-in feed into a
 * static JSON file the app reads.
 *
 * Auth: standard Django form login (no CAPTCHA). Credentials come from env
 *   SCREENER_USERNAME / SCREENER_PASSWORD (GitHub Actions secrets) and are
 *   NEVER logged.
 *
 * Flow:
 *   1. GET /login/            -> csrftoken cookie + csrfmiddlewaretoken field
 *   2. POST /login/           -> sessionid cookie
 *   3. GET /announcements/?p=N (paginated) -> parse rows -> classify by category
 *
 * Safety: if the pull yields zero rows while a previous snapshot has data, the
 * script exits non-zero WITHOUT writing, so a failed login/scrape never
 * overwrites good data.
 *
 * DEBUG: set DEBUG_SCRAPE=1 to print structural diagnostics (no data written,
 * no credentials logged) so the HTML parser can be validated/refined from CI
 * logs.
 *
 * Run: `npm run ingest:announcements`
 */
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as cheerio from "cheerio";
import { classifyAnnouncement } from "../../src/lib/announcements/classify";
import type {
  Announcement,
  AnnouncementCategory,
  AnnouncementsDataset,
} from "../../src/types/announcements";

const BASE = "https://www.screener.in";
const LOGIN_URL = `${BASE}/login/`;
const ANN_URL = `${BASE}/announcements/`;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const OUT = resolve(process.cwd(), "src/data/announcements.json");
const DEBUG = process.env.DEBUG_SCRAPE === "1";
const MAX_PAGES = Number(process.env.ANN_PAGES ?? "5");

type Jar = Record<string, string>;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var ${name}`);
  return v;
}

function absorbCookies(res: Response, jar: Jar) {
  const setCookies = res.headers.getSetCookie?.() ?? [];
  for (const c of setCookies) {
    const pair = c.split(";")[0];
    const idx = pair.indexOf("=");
    if (idx > 0) jar[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
  }
}

function cookieHeader(jar: Jar): string {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function login(): Promise<Jar> {
  const jar: Jar = {};
  const getRes = await fetch(LOGIN_URL, { headers: { "User-Agent": UA } });
  absorbCookies(getRes, jar);
  const $ = cheerio.load(await getRes.text());
  const token =
    $('input[name="csrfmiddlewaretoken"]').attr("value") || jar["csrftoken"];
  if (!token) throw new Error("Could not find CSRF token on the login page");

  const body = new URLSearchParams({
    csrfmiddlewaretoken: token,
    username: requireEnv("SCREENER_USERNAME"),
    password: requireEnv("SCREENER_PASSWORD"),
    next: "/",
  });

  const postRes = await fetch(LOGIN_URL, {
    method: "POST",
    headers: {
      "User-Agent": UA,
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: LOGIN_URL,
      Origin: BASE,
      Cookie: cookieHeader(jar),
    },
    body: body.toString(),
    redirect: "manual",
  });
  absorbCookies(postRes, jar);

  if (!jar["sessionid"]) {
    throw new Error(
      `Login failed: no sessionid cookie returned (HTTP ${postRes.status}). Check SCREENER_USERNAME / SCREENER_PASSWORD.`
    );
  }
  if (DEBUG) console.log(`[debug] login OK (HTTP ${postRes.status}), session established`);
  return jar;
}

async function fetchPage(jar: Jar, page: number): Promise<string> {
  const url = page > 1 ? `${ANN_URL}?p=${page}` : ANN_URL;
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml",
      Cookie: cookieHeader(jar),
      Referer: `${BASE}/filings/`,
    },
    redirect: "manual",
  });
  if (res.status >= 300 && res.status < 400) {
    throw new Error(
      `Announcements page ${page} redirected (HTTP ${res.status}) — session not authenticated`
    );
  }
  if (!res.ok) throw new Error(`Announcements page ${page}: HTTP ${res.status}`);
  return res.text();
}

/** Best-effort row parser. Each announcement row on Screener links to a
 *  /company/ page and carries a headline, a date and (usually) a PDF link.
 *  Selectors are refined against DEBUG output from the first authenticated run. */
function parsePage(html: string): Announcement[] {
  const $ = cheerio.load(html);
  const out: Announcement[] = [];
  const seen = new Set<string>();

  $('a[href*="/company/"]').each((_, el) => {
    const $a = $(el);
    const company = $a.text().trim();
    if (!company) return;
    const href = $a.attr("href") || "";
    const symbol = (href.match(/\/company\/([^/]+)/)?.[1] || "").toUpperCase() || null;

    // Walk up to the row-like container.
    const $row = $a.closest("li, tr, .flex, .announcement, div");
    const rowText = $row.text().replace(/\s+/g, " ").trim();
    // Headline = row text minus the company name.
    const headline = rowText.replace(company, "").trim() || null;

    const pdf =
      $row
        .find('a[href$=".pdf"], a[href*="bseindia"], a[href*="nseindia"], a[href*="nsearchives"]')
        .attr("href") || null;
    const dateText =
      $row.find("time").attr("datetime") ||
      $row.find("time, .date, .ink-600").first().text().trim() ||
      null;

    const key = `${symbol}|${headline}`;
    if (seen.has(key)) return;
    seen.add(key);

    out.push({
      company,
      symbol,
      category: classifyAnnouncement(headline, headline),
      subject: null,
      headline,
      date: dateText,
      isoDate: dateText && /^\d{4}-\d{2}-\d{2}/.test(dateText) ? dateText : null,
      url: pdf ? (pdf.startsWith("http") ? pdf : `${BASE}${pdf}`) : null,
    });
  });

  return out;
}

function debugDump(html: string) {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();
  const companyLinks = $('a[href*="/company/"]');
  console.log(`[debug] announcements HTML length: ${html.length}`);
  console.log(`[debug] /company/ links found: ${companyLinks.length}`);
  console.log(`[debug] gated? contains 'register': ${/\/register\//.test(html)}`);
  companyLinks.slice(0, 3).each((i, el) => {
    const container = $(el).closest("li, tr, div");
    const parentHtml = $.html(container.parent()) || $.html(container) || "";
    console.log(`\n[debug] ---- row ${i} ancestor HTML (truncated) ----`);
    console.log(parentHtml.replace(/\s+/g, " ").slice(0, 700));
  });
}

function previousTotal(): number {
  if (!existsSync(OUT)) return 0;
  try {
    const prev = JSON.parse(readFileSync(OUT, "utf8")) as AnnouncementsDataset;
    return prev.total ?? 0;
  } catch {
    return 0;
  }
}

async function main() {
  const jar = await login();

  const all: Announcement[] = [];
  const seen = new Set<string>();
  for (let p = 1; p <= MAX_PAGES; p++) {
    const html = await fetchPage(jar, p);
    if (DEBUG && p === 1) debugDump(html);
    const rows = parsePage(html);
    if (rows.length === 0) break;
    let added = 0;
    for (const r of rows) {
      const key = `${r.symbol}|${r.headline}|${r.date}`;
      if (seen.has(key)) continue;
      seen.add(key);
      all.push(r);
      added++;
    }
    if (DEBUG) console.log(`[debug] page ${p}: parsed ${rows.length}, new ${added}`);
    if (added === 0) break;
    await sleep(800); // be polite between page requests
  }

  if (DEBUG) {
    const byCat = all.reduce<Record<string, number>>((m, a) => {
      m[a.category] = (m[a.category] ?? 0) + 1;
      return m;
    }, {});
    console.log(`[debug] total parsed: ${all.length}`);
    console.log(`[debug] by category:`, JSON.stringify(byCat));
    console.log(`[debug] sample:`, JSON.stringify(all.slice(0, 3), null, 2));
    console.log("[debug] DEBUG_SCRAPE set — not writing output.");
    return;
  }

  const total = all.length;
  const prevTotal = previousTotal();
  if (total === 0 && prevTotal > 0) {
    throw new Error(
      `Refusing to overwrite ${prevTotal} existing announcements with 0 new rows`
    );
  }

  const byCategory: Partial<Record<AnnouncementCategory, number>> = {};
  for (const a of all) byCategory[a.category] = (byCategory[a.category] ?? 0) + 1;

  const dataset: AnnouncementsDataset = {
    fetchedAt: new Date().toISOString(),
    source: "Screener",
    total,
    byCategory,
    items: all,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(dataset, null, 2) + "\n");
  console.log(`Wrote ${OUT}: ${total} announcements across ${Object.keys(byCategory).length} categories`);
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`Announcements ingestion failed: ${msg}`);
  process.exit(1);
});
