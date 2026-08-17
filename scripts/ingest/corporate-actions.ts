/**
 * Ingests corporate actions (bonus / buyback / split / rights / dividend) from
 * Screener's Daily Pulse into a static JSON file. Uses the shared Screener
 * login. DEBUG_SCRAPE=1 prints structure and writes nothing.
 *
 * Run: `npm run ingest:corporate-actions`
 */
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as cheerio from "cheerio";
import { screenerLogin, screenerGet, clean, sleep } from "./screener-auth";
import type { ActionType, CorporateAction, CorporateActionsDataset } from "../../src/types/corporate-actions";

const OUT = resolve(process.cwd(), "src/data/corporate-actions.json");
const DEBUG = process.env.DEBUG_SCRAPE === "1";
// Screener uses /actions/right/ for rights.
const SOURCES: { path: string; type: ActionType }[] = [
  { path: "/actions/bonus/?o=-1", type: "bonus" },
  { path: "/actions/buyback/?o=-1", type: "buyback" },
  { path: "/actions/split/?o=-1", type: "split" },
  { path: "/actions/right/?o=-1", type: "rights" },
  { path: "/actions/dividend/?o=-1", type: "dividend" },
];

const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];
const ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function parseDate(s: string | null): { display: string | null; iso: string | null } {
  const t = clean(s);
  if (!t) return { display: null, iso: null };
  const m = t.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (m) {
    const mi = MONTHS.indexOf(m[2].toLowerCase());
    if (mi >= 0)
      return {
        display: `${Number(m[1])} ${ABBR[mi]} ${m[3]}`,
        iso: `${m[3]}-${String(mi + 1).padStart(2, "0")}-${String(Number(m[1])).padStart(2, "0")}`,
      };
  }
  return { display: t, iso: null };
}

function parseActions(html: string, type: ActionType): CorporateAction[] {
  const $ = cheerio.load(html);
  const out: CorporateAction[] = [];
  $("table").first().find("tr").each((_, tr) => {
    const $tr = $(tr);
    const $link = $tr.find('a[href*="/company/"]').last();
    if (!$link.length) return;
    const company = clean($link.find(".ink-900").text()) || clean($link.text());
    if (!company) return;
    const symbol = ($link.attr("href")?.match(/\/company\/([^/]+)/)?.[1] || "").toUpperCase() || null;

    // Cells other than the company cell: first non-empty = detail, a date-looking one = date.
    const cells = $tr.find("td").map((_, td) => clean($(td).text())).get().filter(Boolean) as string[];
    let date: string | null = null;
    let isoDate: string | null = null;
    let detail: string | null = null;
    for (const c of cells) {
      const d = parseDate(c);
      if (d.iso && !date) {
        date = d.display;
        isoDate = d.iso;
      } else if (!detail) {
        detail = c;
      }
    }
    if (!detail && cells.length) detail = cells[0];

    out.push({ company, symbol, type, detail, date, isoDate });
  });
  return out;
}

function debugDump(html: string, label: string) {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();
  const $t = $("table").first();
  const $row = $t.find("tr").filter((_, tr) => $(tr).find('a[href*="/company/"]').length > 0).first();
  const headers = $t.find("th").slice(0, 10).map((_, th) => clean($(th).text())).get();
  console.log(`\n[debug:${label}] tables ${$("table").length} | /company/ ${$('a[href*="/company/"]').length} | gated ${/\/register\//.test(html)}`);
  console.log(`[debug:${label}] headers: ${JSON.stringify(headers)}`);
  console.log(`[debug:${label}] first row: ${clean($.html($row))?.slice(0, 900)}`);
}

function prevTotal(): number {
  if (!existsSync(OUT)) return 0;
  try {
    return (JSON.parse(readFileSync(OUT, "utf8")) as CorporateActionsDataset).total ?? 0;
  } catch {
    return 0;
  }
}

async function main() {
  const jar = await screenerLogin();
  if (DEBUG) console.log("[debug] login OK");
  const items: CorporateAction[] = [];

  for (const src of SOURCES) {
    const html = await screenerGet(jar, src.path);
    if (DEBUG) debugDump(html, src.type);
    const rows = parseActions(html, src.type);
    items.push(...rows);
    if (DEBUG) console.log(`[debug:${src.type}] parsed ${rows.length}`);
    await sleep(800);
  }

  if (DEBUG) {
    console.log(`[debug] total ${items.length}`);
    console.log(`[debug] sample: ${JSON.stringify(items.slice(0, 5), null, 2)}`);
    console.log("[debug] DEBUG_SCRAPE set — not writing.");
    return;
  }

  if (items.length === 0 && prevTotal() > 0)
    throw new Error(`Refusing to overwrite existing corporate actions with 0 rows`);

  const byType: Partial<Record<ActionType, number>> = {};
  for (const a of items) byType[a.type] = (byType[a.type] ?? 0) + 1;

  const dataset: CorporateActionsDataset = {
    fetchedAt: new Date().toISOString(),
    source: "Screener",
    total: items.length,
    byType,
    items,
  };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(dataset, null, 2) + "\n");
  console.log(`Wrote ${OUT}: ${items.length} actions ${JSON.stringify(byType)}`);
}

main().catch((err) => {
  console.error(`Corporate actions ingestion failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
