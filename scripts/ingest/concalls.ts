/**
 * Ingests recent + upcoming concalls from Screener's Daily Pulse into a static
 * JSON file. Uses the shared Screener login. DEBUG_SCRAPE=1 prints structure
 * (column classes + first row) and writes nothing.
 *
 * Run: `npm run ingest:concalls`
 */
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as cheerio from "cheerio";
import { screenerLogin, screenerGet, clean, sleep, SCREENER_BASE } from "./screener-auth";
import { writeDailyPartition } from "./history";
import type { Concall, ConcallKind, ConcallsDataset } from "../../src/types/concalls";

const OUT = resolve(process.cwd(), "src/data/concalls.json");
const DEBUG = process.env.DEBUG_SCRAPE === "1";
const SOURCES: { path: string; kind: ConcallKind }[] = [
  { path: "/concalls/", kind: "recent" },
  { path: "/concalls/upcoming/", kind: "upcoming" },
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

function abs(url: string): string {
  return url.startsWith("http") ? url : `${SCREENER_BASE}${url}`;
}

function parseConcalls(html: string, kind: ConcallKind): Concall[] {
  const $ = cheerio.load(html);
  const out: Concall[] = [];
  $("table").first().find("tr").each((_, tr) => {
    const $tr = $(tr);
    const $co = $tr.find("th.field-company_display, th").filter((_, th) => $(th).find('a[href*="/company/"]').length > 0).first();
    const $link = ($co.length ? $co : $tr).find('a[href*="/company/"]').last();
    if (!$link.length) return;
    const company = clean($link.find(".ink-900").text()) || clean($link.text());
    if (!company) return;
    const symbol = ($link.attr("href")?.match(/\/company\/([^/]+)/)?.[1] || "").toUpperCase() || null;

    const dateText = clean($tr.find('td.field-pub_date, td[class*="date"], td.field-_get_reporting_date, time').first().text());
    const { display: date, iso: isoDate } = parseDate(dateText);

    // Material links (transcript / notes / PPT / recording), deduped by URL.
    // Only look inside <td> cells (the field-action_display anchor carries the
    // nice label) — the company <th> holds an unlabelled duplicate link.
    const links: { label: string; url: string }[] = [];
    const seenLinks = new Set<string>();
    $tr.find('td.field-action_display a[href], td a[href*=".pdf"], td a[href*="bseindia"], td a[href*="nseindia"], td a[href*="nsearchives"], td a[href*="/documents/"], td a[href*="youtu"]').each((_, a) => {
      const href = $(a).attr("href");
      if (!href) return;
      const url = abs(href);
      if (seenLinks.has(url)) return;
      seenLinks.add(url);
      let label = clean($(a).text()) || clean($(a).attr("title"));
      if (!label) label = /youtu/.test(url) ? "Recording" : /\.pdf|documents/.test(url) ? "Document" : "Link";
      links.push({ label, url });
    });

    out.push({ company, symbol, kind, date, isoDate, links });
  });
  return out;
}

function debugDump(html: string, label: string) {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();
  const $t = $("table").first();
  const $row = $t.find("tr").filter((_, tr) => $(tr).find('a[href*="/company/"]').length > 0).first();
  const cellClasses = $row.find("th, td").map((_, c) => $(c).attr("class") || "").get();
  console.log(`\n[debug:${label}] tables ${$("table").length} | /company/ ${$('a[href*="/company/"]').length} | gated ${/\/register\//.test(html)}`);
  console.log(`[debug:${label}] cell classes: ${JSON.stringify(cellClasses)}`);
  console.log(`[debug:${label}] first row: ${clean($.html($row))?.slice(0, 1100)}`);
}

function prevTotal(): number {
  if (!existsSync(OUT)) return 0;
  try {
    const p = JSON.parse(readFileSync(OUT, "utf8")) as ConcallsDataset;
    return (p.counts?.recent ?? 0) + (p.counts?.upcoming ?? 0);
  } catch {
    return 0;
  }
}

async function main() {
  const jar = await screenerLogin();
  if (DEBUG) console.log("[debug] login OK");
  const items: Concall[] = [];
  const counts = { recent: 0, upcoming: 0 };

  for (const src of SOURCES) {
    const html = await screenerGet(jar, src.path);
    if (DEBUG) debugDump(html, src.kind);
    const rows = parseConcalls(html, src.kind);
    counts[src.kind] = rows.length;
    items.push(...rows);
    if (DEBUG) console.log(`[debug:${src.kind}] parsed ${rows.length}`);
    await sleep(800);
  }

  if (DEBUG) {
    console.log(`[debug] sample: ${JSON.stringify(items.slice(0, 4), null, 2)}`);
    console.log("[debug] DEBUG_SCRAPE set — not writing.");
    return;
  }

  const total = items.length;
  if (total === 0 && prevTotal() > 0)
    throw new Error(`Refusing to overwrite existing concalls with 0 rows`);

  const dataset: ConcallsDataset = {
    fetchedAt: new Date().toISOString(),
    source: "Screener",
    counts,
    items,
  };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(dataset, null, 2) + "\n");
  console.log(`Wrote ${OUT}: recent=${counts.recent} upcoming=${counts.upcoming}`);

  // Each Concall carries its kind (recent/upcoming), so one flat partition is enough.
  writeDailyPartition<Concall>("concalls", items);
}

main().catch((err) => {
  console.error(`Concalls ingestion failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
