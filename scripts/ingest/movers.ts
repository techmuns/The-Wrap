/**
 * Ingests NSE momentum signals into a static JSON file:
 *   - stocks at new 52-week highs   (/api/live-analysis-data-52weekhighstock)
 *   - stocks at new 52-week lows    (/api/live-analysis-data-52weeklowstock)
 *   - volume gainers (unusual activity) (/api/live-analysis-volume-gainers)
 *
 * Field names differ across these endpoints, so the parser reads each value
 * from a list of candidate keys (resilient to NSE's naming). DEBUG_SCRAPE=1
 * prints the raw structure of each endpoint and writes nothing — run that first
 * to confirm the shape.
 *
 * Safety: all three empty while a previous snapshot has data => exit non-zero.
 *
 * Run: `npm run ingest:movers`
 */
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { nseGetJson, nseNum, sleep } from "./nse-auth";
import { writeDailyPartition } from "./history";
import type { MoverRow, VolumeRow, MoversDataset } from "../../src/types/movers";

const OUT = resolve(process.cwd(), "src/data/movers.json");
const DEBUG = process.env.DEBUG_SCRAPE === "1";

const HIGH_PATH = "/api/live-analysis-data-52weekhighstock";
const LOW_PATH = "/api/live-analysis-data-52weeklowstock";
const VOL_PATH = "/api/live-analysis-volume-gainers";
const REFERER = "https://www.nseindia.com/market-data/52-week-high-equity-market";

type Row = Record<string, unknown>;

function pick(o: Row, keys: string[]): unknown {
  for (const k of keys) {
    if (k.includes(".")) {
      const [a, b] = k.split(".");
      const nested = o[a];
      if (nested && typeof nested === "object" && (nested as Row)[b] != null) return (nested as Row)[b];
    } else if (o[k] != null) {
      return o[k];
    }
  }
  return null;
}

function str(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s || null;
}

function toMover(r: Row): MoverRow {
  return {
    symbol: str(pick(r, ["symbol", "Symbol"])),
    company: str(pick(r, ["companyName", "company", "meta.companyName", "symbol_info"])),
    last: nseNum(pick(r, ["ltp", "lastPrice", "last", "closePrice", "new52WHL", "value"])),
    pctChange: nseNum(pick(r, ["pChange", "perChange", "pchange", "changePercent", "netPrice"])),
  };
}

function toVolume(r: Row): VolumeRow {
  return {
    ...toMover(r),
    volume: nseNum(pick(r, ["volume", "totalTradedVolume", "trade_quantity", "qty", "tradedQuantity"])),
    timesAvg: nseNum(pick(r, ["volume_x_week_avg", "timesWeekAvg", "ratio", "volumeXWeekAvg"])),
  };
}

function rowsOf(payload: unknown): Row[] {
  if (Array.isArray(payload)) return payload as Row[];
  const p = payload as { data?: Row[] };
  return Array.isArray(p?.data) ? p.data : [];
}

function prevHasData(): boolean {
  if (!existsSync(OUT)) return false;
  try {
    const p = JSON.parse(readFileSync(OUT, "utf8")) as MoversDataset;
    return (p.highs?.length ?? 0) + (p.lows?.length ?? 0) + (p.volume?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

function dump(label: string, payload: unknown) {
  const rows = rowsOf(payload);
  console.log(`\n[debug:${label}] array=${Array.isArray(payload)} rows=${rows.length}`);
  if (rows[0]) {
    console.log(`[debug:${label}] first row keys: ${JSON.stringify(Object.keys(rows[0]))}`);
    console.log(`[debug:${label}] first row: ${JSON.stringify(rows[0]).slice(0, 600)}`);
  } else {
    console.log(`[debug:${label}] top-level keys: ${JSON.stringify(Object.keys((payload as Row) || {}))}`);
  }
}

async function main() {
  const high = await nseGetJson(HIGH_PATH, REFERER);
  await sleep(600);
  const low = await nseGetJson(LOW_PATH, "https://www.nseindia.com/market-data/52-week-low-equity-market");
  await sleep(600);
  const vol = await nseGetJson(VOL_PATH, "https://www.nseindia.com/market-data/volume-gainers-spurts");

  if (DEBUG) {
    dump("high", high);
    dump("low", low);
    dump("volume", vol);
    console.log("\n[debug] DEBUG_SCRAPE set — not writing.");
    return;
  }

  const highs = rowsOf(high).map(toMover).filter((r) => r.symbol);
  const lows = rowsOf(low).map(toMover).filter((r) => r.symbol);
  const volume = rowsOf(vol).map(toVolume).filter((r) => r.symbol);

  if (highs.length + lows.length + volume.length === 0 && prevHasData())
    throw new Error("Refusing to overwrite existing movers with 0 rows");

  const dataset: MoversDataset = {
    fetchedAt: new Date().toISOString(),
    source: "NSE",
    timestamp: str(pick((high as Row) || {}, ["timestamp"])),
    highs,
    lows,
    volume,
  };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(dataset, null, 2) + "\n");
  console.log(`Wrote ${OUT}: highs=${highs.length} lows=${lows.length} volume=${volume.length}`);

  writeDailyPartition<MoverRow & { kind: string }>("movers", [
    ...highs.map((r) => ({ ...r, kind: "high" })),
    ...lows.map((r) => ({ ...r, kind: "low" })),
  ]);
}

main().catch((err) => {
  console.error(`Movers ingestion failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
