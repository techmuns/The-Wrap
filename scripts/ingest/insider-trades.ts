/**
 * Ingests insider + SAST (promoter) trades from Screener.in's logged-in Daily
 * Pulse into a static JSON file the Buying & Selling page reads.
 *
 * Auth: reuses the Screener form login (SCREENER_USERNAME / SCREENER_PASSWORD
 * GitHub Actions secrets; never logged). The script logs in fresh each run, so
 * there is no token to expire.
 *
 * Sources: /trades/insiders (PIT insider trades) + /trades/sast (substantial
 * acquisitions). Both are market-wide "latest" lists.
 *
 * Safety: zero rows while a previous snapshot has data => exit non-zero without
 * writing. DEBUG_SCRAPE=1 prints structure and writes nothing.
 *
 * Run: `npm run ingest:insider`
 */
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as cheerio from "cheerio";
import type { InsiderTrade, InsiderTradesDataset, TradeSide } from "../../src/types/insider";

const BASE = "https://www.screener.in";
const LOGIN_URL = `${BASE}/login/`;
const SOURCES: { path: string; label: string; role: string }[] = [
  { path: "/trades/insiders/?o=-2", label: "insiders", role: "Insider" },
  { path: "/trades/sast/?o=-2", label: "sast", role: "Promoter (SAST)" },
];
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const OUT = resolve(process.cwd(), "src/data/insider-trades.json");
const DEBUG = process.env.DEBUG_SCRAPE === "1";

type Jar = Record<string, string>;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var ${name}`);
  return v;
}
function clean(s: string | null | undefined): string | null {
  if (!s) return null;
  const t = s.replace(/\s+/g, " ").trim();
  return t || null;
}
function absorbCookies(res: Response, jar: Jar) {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const pair = c.split(";")[0];
    const i = pair.indexOf("=");
    if (i > 0) jar[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
  }
}
const cookieHeader = (jar: Jar) =>
  Object.entries(jar).map(([k, v]) => `${k}=${v}`).join("; ");

/** Plain number (strip commas/₹). */
function num(s: string | null): number | null {
  if (!s) return null;
  const n = Number(s.replace(/[₹,\s]/g, "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}
/** Rupee value that may be suffixed with Cr / Lakh. Returns rupees. */
function parseValue(s: string | null): number | null {
  if (!s) return null;
  const m = s.replace(/[₹,]/g, "").match(/([\d.]+)\s*(cr|crore|lakh|lac|l)?/i);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  const unit = (m[2] || "").toLowerCase();
  if (unit.startsWith("cr")) return n * 1e7;
  if (unit.startsWith("l")) return n * 1e5;
  return n;
}

async function login(): Promise<Jar> {
  const jar: Jar = {};
  const getRes = await fetch(LOGIN_URL, { headers: { "User-Agent": UA } });
  absorbCookies(getRes, jar);
  const $ = cheerio.load(await getRes.text());
  const token = $('input[name="csrfmiddlewaretoken"]').attr("value") || jar["csrftoken"];
  if (!token) throw new Error("Could not find CSRF token on login page");
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
      `Login failed: no sessionid (HTTP ${postRes.status}). Check SCREENER_USERNAME / SCREENER_PASSWORD.`
    );
  }
  if (DEBUG) console.log(`[debug] login OK (HTTP ${postRes.status})`);
  return jar;
}

async function fetchPage(jar: Jar, path: string): Promise<string> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml",
      Cookie: cookieHeader(jar),
      Referer: `${BASE}/filings/`,
    },
    redirect: "manual",
  });
  if (res.status >= 300 && res.status < 400)
    throw new Error(`${path} redirected (HTTP ${res.status}) — not authenticated`);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.text();
}

const pick = (...idx: number[]) => idx.find((i) => i >= 0) ?? -1;

/** Best-effort table parser. Refined against DEBUG output from the first run. */
function parseTrades(html: string, role: string): InsiderTrade[] {
  const $ = cheerio.load(html);
  const out: InsiderTrade[] = [];
  const $t = $("table").first();
  if (!$t.length) return out;

  const headers = $t
    .find("thead th, tr").first().find("th")
    .map((_, th) => clean($(th).text())?.toLowerCase() ?? "")
    .get();
  const col = (...names: string[]) =>
    headers.findIndex((h) => names.some((n) => h.includes(n)));

  const iCompany = pick(col("company"), col("symbol"), col("stock"));
  const iPerson = pick(col("acquirer"), col("disposer"), col("client"), col("shareholder"), col("name"));
  const iType = pick(col("type"), col("buy"), col("acqui"), col("transaction"), col("action"), col("mode"));
  const iQty = pick(col("quantity"), col("qty"), col("shares"), col("volume"));
  const iValue = pick(col("value"), col("amount"));
  const iPct = pick(col("%"), col("stake"), col("holding"));
  const iDate = pick(col("date"));

  $t.find("tbody tr").each((_, tr) => {
    const tds = $(tr).find("td");
    if (!tds.length) return;
    const cell = (i: number) => (i >= 0 && tds[i] ? clean($(tds[i]).text()) : null);

    const $co = (iCompany >= 0 ? $(tds[iCompany]) : $(tr)).find('a[href*="/company/"]').first();
    const company = clean($co.text()) || cell(iCompany);
    const symbol = ($co.attr("href")?.match(/\/company\/([^/]+)/)?.[1] || "").toUpperCase() || null;

    const typeText = (cell(iType) || "").toLowerCase();
    const buySell: TradeSide | null = /buy|acqui|purchase|invest|creation/.test(typeText)
      ? "BUY"
      : /sell|dispos|sale|revok|encumber/.test(typeText)
        ? "SELL"
        : null;

    if (!company) return;
    out.push({
      company,
      symbol,
      person: cell(iPerson),
      role,
      buySell,
      shares: num(cell(iQty)),
      pct: num(cell(iPct)),
      value: parseValue(cell(iValue)),
      mode: cell(iType),
      date: cell(iDate),
      isoDate: null,
    });
  });
  return out;
}

function debugDump(html: string, label: string) {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();
  console.log(`\n[debug:${label}] HTML ${html.length} | tables ${$("table").length} | /company/ ${$('a[href*="/company/"]').length} | gated ${/\/register\//.test(html)}`);
  const $t = $("table").first();
  if ($t.length) {
    const headers = $t.find("th").slice(0, 14).map((_, th) => clean($(th).text())).get();
    console.log(`[debug:${label}] headers: ${JSON.stringify(headers)}`);
    const $row = $t.find("tbody tr").first();
    console.log(`[debug:${label}] first row: ${clean($.html($row))?.slice(0, 1000)}`);
  } else {
    const $c = $('a[href*="/company/"]').first();
    if ($c.length) {
      const anc = $c.closest("tr, li, .flex, div");
      console.log(`[debug:${label}] company-row HTML: ${clean($.html(anc.parent()) || $.html(anc))?.slice(0, 1200)}`);
    }
  }
}

function previousTotal(): number {
  if (!existsSync(OUT)) return 0;
  try {
    return (JSON.parse(readFileSync(OUT, "utf8")) as InsiderTradesDataset).total ?? 0;
  } catch {
    return 0;
  }
}

async function main() {
  const jar = await login();
  const all: InsiderTrade[] = [];
  const seen = new Set<string>();

  for (const src of SOURCES) {
    const html = await fetchPage(jar, src.path);
    if (DEBUG) debugDump(html, src.label);
    const rows = parseTrades(html, src.role);
    for (const r of rows) {
      const key = `${r.symbol}|${r.person}|${r.shares}|${r.date}`;
      if (seen.has(key)) continue;
      seen.add(key);
      all.push(r);
    }
    if (DEBUG) console.log(`[debug:${src.label}] parsed ${rows.length}`);
    await sleep(800);
  }

  if (DEBUG) {
    console.log(`[debug] total parsed: ${all.length}`);
    console.log(`[debug] sample: ${JSON.stringify(all.slice(0, 3), null, 2)}`);
    console.log("[debug] DEBUG_SCRAPE set — not writing.");
    return;
  }

  const prevTotal = previousTotal();
  if (all.length === 0 && prevTotal > 0)
    throw new Error(`Refusing to overwrite ${prevTotal} existing trades with 0 new rows`);

  const dataset: InsiderTradesDataset = {
    fetchedAt: new Date().toISOString(),
    source: "Screener",
    total: all.length,
    items: all,
  };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(dataset, null, 2) + "\n");
  console.log(`Wrote ${OUT}: ${all.length} insider/SAST trades`);
}

main().catch((err) => {
  console.error(`Insider ingestion failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
