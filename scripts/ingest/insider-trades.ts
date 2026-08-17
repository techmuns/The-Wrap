/**
 * Ingests insider + SAST (promoter) trades from Screener.in's logged-in Daily
 * Pulse into a static JSON file the Buying & Selling page reads.
 *
 * Auth: reuses the Screener form login (SCREENER_USERNAME / SCREENER_PASSWORD
 * GitHub Actions secrets; never logged). Logs in fresh each run — no token to
 * expire.
 *
 * Sources (market-wide latest lists), parsed via Screener's stable field-*
 * column classes:
 *   /trades/insiders — th.field-company_display, td.field-_get_insider_person_name
 *     (name + small.sub role), td.field-_get_reporting_date,
 *     td.field-_get_insider_transaction_type (type + "N Equity" qty),
 *     td.field-_get_insider_value (₹ value; up/down colour = buy/sell)
 *   /trades/sast — td.field-person_name, td.field-_get_sast_type (Buy/Sell),
 *     td.field-_get_sast_percent ("--%"/"N%" + "qty N")
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
const SOURCES: { path: string; label: string; kind: "insider" | "sast" }[] = [
  { path: "/trades/insiders/?o=-2", label: "insiders", kind: "insider" },
  { path: "/trades/sast/?o=-2", label: "sast", kind: "sast" },
];
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const OUT = resolve(process.cwd(), "src/data/insider-trades.json");
const DEBUG = process.env.DEBUG_SCRAPE === "1";

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];
const ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

/** Quantity from "… 86,603 Equity" (insider) or "qty 1,01,000" (SAST). */
function parseShares(s: string | null): number | null {
  if (!s) return null;
  const m =
    s.match(/qty\s*([\d,]+)/i) ||
    s.match(/([\d,]+)\s*(equity|warrant|share|unit|debenture|ncd)/i);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}
/** Percentage from "1.23%" (returns 1.23); "--%" => null. */
function parsePct(s: string | null): number | null {
  if (!s) return null;
  const m = s.match(/(-?\d[\d.]*)\s*%/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}
/** Rupee value from "1.38 crore" / "16.68 lacs" => rupees. */
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
function parseDate(s: string | null): { display: string | null; iso: string | null } {
  const t = clean(s);
  if (!t) return { display: null, iso: null };
  const m = t.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (m) {
    const mi = MONTHS.indexOf(m[2].toLowerCase());
    if (mi >= 0) {
      const dd = String(Number(m[1])).padStart(2, "0");
      const mm = String(mi + 1).padStart(2, "0");
      return { display: `${Number(m[1])} ${ABBR[mi]} ${m[3]}`, iso: `${m[3]}-${mm}-${dd}` };
    }
  }
  return { display: t, iso: null }; // relative labels like "yesterday"
}
function detectSide(typeText: string | null, valClass: string): TradeSide | null {
  const t = (typeText || "").toLowerCase();
  if (/buy|bought|acqui|purchase|creation|allot/.test(t)) return "BUY";
  if (/sell|sold|dispos|sale|revoc|invoke|encumber/.test(t)) return "SELL";
  if (valClass.includes("up")) return "BUY";
  if (valClass.includes("down")) return "SELL";
  return null;
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

function parseTrades(html: string, kind: "insider" | "sast"): InsiderTrade[] {
  const $ = cheerio.load(html);
  const out: InsiderTrade[] = [];

  $("table").first().find("tr").each((_, tr) => {
    const $tr = $(tr);
    const $co = $tr.find("th.field-company_display");
    if (!$co.length) return; // header row has no company cell

    const $link = $co.find('a[href*="/company/"]').last();
    const company = clean($link.find(".ink-900").text()) || clean($link.text());
    if (!company) return;
    const symbol =
      ($link.attr("href")?.match(/\/company\/([^/]+)/)?.[1] || "").toUpperCase() || null;

    const { display: date, iso: isoDate } = parseDate(
      clean($tr.find("td.field-_get_reporting_date").text())
    );

    let person: string | null = null;
    let role: string | null = null;
    let buySell: TradeSide | null = null;
    let shares: number | null = null;
    let pct: number | null = null;
    let value: number | null = null;
    let mode: string | null = null;

    if (kind === "insider") {
      const $person = $tr.find("td.field-_get_insider_person_name").clone();
      role = clean($person.find("small").text());
      $person.find("small").remove();
      person = clean($person.text());

      const $type = $tr.find("td.field-_get_insider_transaction_type");
      mode = clean($type.find(".font-weight-500").first().text());
      shares = parseShares(clean($type.text()));

      const $val = $tr.find("td.field-_get_insider_value");
      value = parseValue(clean($val.text()));
      const valClass = $val.find("span").first().attr("class") || "";
      buySell = detectSide(mode, valClass);
    } else {
      person = clean($tr.find("td.field-person_name").text());
      role = "Promoter (SAST)";
      mode =
        clean($tr.find("td.field-_get_sast_type .font-weight-500").text()) ||
        clean($tr.find("td.field-_get_sast_type").text());
      buySell = detectSide(mode, "");
      const pctText = clean($tr.find("td.field-_get_sast_percent").text());
      pct = parsePct(pctText);
      shares = parseShares(pctText);
    }

    out.push({ company, symbol, person, role, buySell, shares, pct, value, mode, date, isoDate });
  });

  return out;
}

function debugDump(html: string, label: string) {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();
  const $t = $("table").first();
  console.log(`\n[debug:${label}] HTML ${html.length} | tables ${$("table").length} | rows ${$t.find("tr").length} | gated ${/\/register\//.test(html)}`);
  const $row = $t.find("tr").filter((_, tr) => $(tr).find("th.field-company_display").length > 0).first();
  console.log(`[debug:${label}] first data row: ${clean($.html($row))?.slice(0, 900)}`);
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
    const rows = parseTrades(html, src.kind);
    for (const r of rows) {
      const key = `${r.symbol}|${r.person}|${r.shares}|${r.date}|${src.kind}`;
      if (seen.has(key)) continue;
      seen.add(key);
      all.push(r);
    }
    if (DEBUG) console.log(`[debug:${src.label}] parsed ${rows.length}`);
    await sleep(800);
  }

  if (DEBUG) {
    console.log(`[debug] total parsed: ${all.length}`);
    console.log(`[debug] sample: ${JSON.stringify(all.slice(0, 4), null, 2)}`);
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
