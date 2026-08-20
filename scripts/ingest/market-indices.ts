/**
 * Ingests NSE's all-indices snapshot into a static JSON file powering the
 * Sector Rotation and Market Breadth pages.
 *
 * Source: GET /api/allIndices — every index with last / % change and, crucially,
 * per-index advances / declines / unchanged (market breadth). Indices are split
 * into broad-market and sectoral buckets using NSE's own "key" grouping, with a
 * name-list fallback.
 *
 * Safety: zero indices while a previous snapshot has data => exit non-zero
 * without writing. DEBUG_SCRAPE=1 prints the raw structure and writes nothing.
 *
 * Run: `npm run ingest:indices`
 */
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { nseGetJson, nseNum } from "./nse-auth";
import { writeDailyPartition } from "./history";
import type { IndexQuote, IndicesDataset } from "../../src/types/indices";

const OUT = resolve(process.cwd(), "src/data/indices.json");
const DEBUG = process.env.DEBUG_SCRAPE === "1";
const REFERER = "https://www.nseindia.com/market-data/live-market-indices";

interface RawIndex {
  key?: string;
  index?: string;
  indexSymbol?: string;
  last?: string | number;
  variation?: string | number;
  percentChange?: string | number;
  open?: string | number;
  high?: string | number;
  low?: string | number;
  previousClose?: string | number;
  yearHigh?: string | number;
  yearLow?: string | number;
  advances?: string | number;
  declines?: string | number;
  unchanged?: string | number;
}

// NSE's allIndices mixes ~139 indices (broad, sectoral, F&O, strategy, thematic,
// G-Sec). We curate an exact-name whitelist so the pages show a clean, familiar
// set rather than the full firehose. (NSE files Nifty 50/Bank under "INDICES
// ELIGIBLE IN DERIVATIVES", so its "key" grouping can't separate them cleanly.)
const BROAD_NAMES = new Set([
  "NIFTY 50", "NIFTY NEXT 50", "NIFTY 100", "NIFTY 200", "NIFTY 500",
  "NIFTY MIDCAP 100", "NIFTY MIDCAP 150", "NIFTY SMALLCAP 100",
  "NIFTY SMALLCAP 250", "NIFTY TOTAL MARKET", "NIFTY MICROCAP 250",
]);
const SECTORAL_NAMES = new Set([
  "NIFTY BANK", "NIFTY IT", "NIFTY AUTO", "NIFTY FMCG", "NIFTY PHARMA",
  "NIFTY METAL", "NIFTY REALTY", "NIFTY MEDIA", "NIFTY PSU BANK",
  "NIFTY PRIVATE BANK", "NIFTY FINANCIAL SERVICES", "NIFTY HEALTHCARE INDEX",
  "NIFTY CONSUMER DURABLES", "NIFTY OIL & GAS", "NIFTY CHEMICALS",
  "NIFTY ENERGY", "NIFTY INFRASTRUCTURE", "NIFTY COMMODITIES", "NIFTY CEMENT",
  "NIFTY CAPITAL MARKETS",
]);

function bucketOf(r: RawIndex): "broad" | "sectoral" | null {
  const name = (r.index || "").toUpperCase().trim();
  if (SECTORAL_NAMES.has(name)) return "sectoral";
  if (BROAD_NAMES.has(name)) return "broad";
  return null;
}

function toQuote(r: RawIndex): IndexQuote {
  return {
    name: r.index || "",
    symbol: r.indexSymbol || null,
    last: nseNum(r.last),
    change: nseNum(r.variation),
    pctChange: nseNum(r.percentChange),
    open: nseNum(r.open),
    high: nseNum(r.high),
    low: nseNum(r.low),
    previousClose: nseNum(r.previousClose),
    yearHigh: nseNum(r.yearHigh),
    yearLow: nseNum(r.yearLow),
    advances: nseNum(r.advances),
    declines: nseNum(r.declines),
    unchanged: nseNum(r.unchanged),
  };
}

function prevTotal(): number {
  if (!existsSync(OUT)) return 0;
  try {
    const p = JSON.parse(readFileSync(OUT, "utf8")) as IndicesDataset;
    return (p.broad?.length ?? 0) + (p.sectoral?.length ?? 0);
  } catch {
    return 0;
  }
}

async function main() {
  const raw = await nseGetJson<{ data?: RawIndex[]; timestamp?: string }>("/api/allIndices", REFERER);
  const rows = raw.data ?? [];

  if (DEBUG) {
    console.log(`[debug] total indices: ${rows.length} | timestamp: ${raw.timestamp}`);
    console.log(`[debug] distinct keys: ${JSON.stringify([...new Set(rows.map((r) => r.key))])}`);
    console.log(`[debug] first row keys: ${JSON.stringify(Object.keys(rows[0] || {}))}`);
    console.log(`[debug] first row: ${JSON.stringify(rows[0])}`);
    console.log(`[debug] all names: ${JSON.stringify(rows.map((r) => r.index))}`);
    console.log("[debug] DEBUG_SCRAPE set — not writing.");
    return;
  }

  const broad: IndexQuote[] = [];
  const sectoral: IndexQuote[] = [];
  for (const r of rows) {
    const bucket = bucketOf(r);
    if (bucket === "sectoral") sectoral.push(toQuote(r));
    else if (bucket === "broad") broad.push(toQuote(r));
  }

  const total = broad.length + sectoral.length;
  if (total === 0 && prevTotal() > 0)
    throw new Error("Refusing to overwrite existing indices with 0 rows");

  const dataset: IndicesDataset = {
    fetchedAt: new Date().toISOString(),
    source: "NSE",
    timestamp: raw.timestamp ?? null,
    broad,
    sectoral,
  };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(dataset, null, 2) + "\n");
  console.log(`Wrote ${OUT}: broad=${broad.length} sectoral=${sectoral.length}`);

  writeDailyPartition<IndexQuote & { bucket: string }>("market-indices", [
    ...broad.map((b) => ({ ...b, bucket: "broad" })),
    ...sectoral.map((s) => ({ ...s, bucket: "sectoral" })),
  ]);
}

main().catch((err) => {
  console.error(`Market indices ingestion failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
