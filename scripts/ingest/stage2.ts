/**
 * Ingests a momentum / "Stage-2" style screen from Screener.in into a static
 * JSON file. Runs a custom screen (price above rising 50/200-DMA + strong 6M/1Y
 * returns) via the logged-in raw-screen endpoint and parses the results table.
 *
 * DEBUG_SCRAPE=1 prints the response structure and writes nothing — run that
 * first to confirm the table shape.
 *
 * Run: `npm run ingest:stage2`
 */
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as cheerio from "cheerio";
import { screenerLogin, screenerGet, clean } from "./screener-auth";
import type { Stage2Row, Stage2Dataset } from "../../src/types/stage2";

const OUT = resolve(process.cwd(), "src/data/stage2.json");
const DEBUG = process.env.DEBUG_SCRAPE === "1";

// Momentum / Stage-2: uptrend confirmed by moving averages + strong returns.
const QUERY = [
  "Current price > DMA 50",
  "Current price > DMA 200",
  "DMA 50 > DMA 200",
  "Return over 6months > 20",
  "Return over 1year > 30",
  "Market Capitalization > 500",
].join(" AND ");
const DESCRIPTION =
  "Price above its rising 50- and 200-day averages, with 6-month return over 20% and 1-year over 30% (market cap above ₹500 cr).";

function num(s: string | null): number | null {
  if (!s) return null;
  const n = Number(s.replace(/[₹,%\s]/g, "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parseRows(html: string): { rows: Stage2Row[]; headers: string[] } {
  const $ = cheerio.load(html);
  const $table = $("table.data-table").first().length ? $("table.data-table").first() : $("table").first();
  const headers = $table.find("thead th, tr").first().find("th").map((_, th) => clean($(th).text()) || "").get();

  // Locate columns by header keyword (order varies with the query).
  const colIdx = (re: RegExp) => headers.findIndex((h) => re.test(h));
  const cmpCol = colIdx(/cmp|current price|price/i);
  const r6Col = colIdx(/6\s*mth|6month|6m/i);
  const r1Col = colIdx(/1\s*yr|1year|1y/i);

  const rows: Stage2Row[] = [];
  $table.find("tbody tr, tr").each((_, tr) => {
    const $tr = $(tr);
    const $link = $tr.find('a[href*="/company/"]').first();
    if (!$link.length) return;
    const symbol = ($link.attr("href")?.match(/\/company\/([^/]+)/)?.[1] || "").toUpperCase() || null;
    const company = clean($link.text());
    if (!company) return;
    const cells = $tr.find("td").map((_, td) => clean($(td).text())).get();
    rows.push({
      symbol,
      company,
      cmp: cmpCol >= 0 ? num(cells[cmpCol]) : null,
      ret6m: r6Col >= 0 ? num(cells[r6Col]) : null,
      ret1y: r1Col >= 0 ? num(cells[r1Col]) : null,
    });
  });
  return { rows, headers };
}

function prevCount(): number {
  if (!existsSync(OUT)) return 0;
  try {
    return (JSON.parse(readFileSync(OUT, "utf8")) as Stage2Dataset).count ?? 0;
  } catch {
    return 0;
  }
}

async function main() {
  const jar = await screenerLogin();
  // Screener runs a raw screen via GET with the query in the URL.
  const params = new URLSearchParams({ query: QUERY, sort: "Return over 1year", order: "desc", page: "1" });
  const html = await screenerGet(jar, `/screen/raw/?${params.toString()}`);

  if (DEBUG) {
    const $ = cheerio.load(html);
    const { rows, headers } = parseRows(html);
    console.log(`[debug] length ${html.length} | gated ${/\/register\//.test(html) || /login/i.test($("title").text())}`);
    console.log(`[debug] tables ${$("table").length} | /company/ links ${$('a[href*="/company/"]').length}`);
    console.log(`[debug] markers: data-table=${/data-table/.test(html)} textarea=${/<textarea/.test(html)} error=${/error|invalid|not a valid/i.test(html)} results=${/result/i.test(html)}`);
    console.log(`[debug] error text: ${clean($(".error, .alert, [class*=error]").first().text())?.slice(0, 200)}`);
    console.log(`[debug] headers: ${JSON.stringify(headers)}`);
    console.log(`[debug] parsed rows ${rows.length} | sample: ${JSON.stringify(rows.slice(0, 4))}`);
    console.log(`[debug] body[0..1200]: ${clean($("body").text())?.slice(0, 1200)}`);
    console.log("[debug] DEBUG_SCRAPE set — not writing.");
    return;
  }

  const { rows } = parseRows(html);
  if (rows.length === 0 && prevCount() > 0)
    throw new Error("Refusing to overwrite existing stage-2 screen with 0 rows");

  const dataset: Stage2Dataset = {
    fetchedAt: new Date().toISOString(),
    source: "Screener",
    description: DESCRIPTION,
    count: rows.length,
    items: rows,
  };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(dataset, null, 2) + "\n");
  console.log(`Wrote ${OUT}: ${rows.length} momentum stocks`);
}

main().catch((err) => {
  console.error(`Stage-2 ingestion failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
