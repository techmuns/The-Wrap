/**
 * Ingests NSE's FII/DII trading activity (foreign vs domestic institutional
 * buy / sell / net for the latest trading day) into a static JSON file.
 *
 * Source: GET /api/fiidiiTradeReact — returns one row for FII/FPI and one for
 * DII with buyValue / sellValue / netValue in ₹ crore.
 *
 * Safety: no FII/DII rows while a previous snapshot has data => exit non-zero
 * without writing. DEBUG_SCRAPE=1 prints the raw payload and writes nothing.
 *
 * Run: `npm run ingest:fii-dii`
 */
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { nseGetJson, nseNum } from "./nse-auth";
import { writeDailyPartition } from "./history";
import type { FlowRow, FlowsDataset } from "../../src/types/flows";

const OUT = resolve(process.cwd(), "src/data/flows.json");
const DEBUG = process.env.DEBUG_SCRAPE === "1";
const REFERER = "https://www.nseindia.com/reports-indices-fii-dii-trading-activity";

interface RawFlow {
  category?: string;
  date?: string;
  buyValue?: string | number;
  sellValue?: string | number;
  netValue?: string | number;
}

function classify(category: string | undefined): string {
  const c = (category || "").toUpperCase();
  if (c.includes("FII") || c.includes("FPI")) return "FII";
  if (c.includes("DII")) return "DII";
  return (category || "").trim();
}

function prevHasData(): boolean {
  if (!existsSync(OUT)) return false;
  try {
    const p = JSON.parse(readFileSync(OUT, "utf8")) as FlowsDataset;
    return Boolean(p.fii || p.dii);
  } catch {
    return false;
  }
}

async function main() {
  const raw = await nseGetJson<RawFlow[]>("/api/fiidiiTradeReact", REFERER);

  if (DEBUG) {
    console.log(`[debug] rows: ${Array.isArray(raw) ? raw.length : "not-array"}`);
    console.log(`[debug] raw: ${JSON.stringify(raw)}`);
    console.log("[debug] DEBUG_SCRAPE set — not writing.");
    return;
  }

  const rows: FlowRow[] = (raw ?? []).map((r) => ({
    category: classify(r.category),
    date: r.date ?? null,
    buy: nseNum(r.buyValue),
    sell: nseNum(r.sellValue),
    net: nseNum(r.netValue),
  }));

  const fii = rows.find((r) => r.category === "FII") ?? null;
  const dii = rows.find((r) => r.category === "DII") ?? null;

  if (!fii && !dii) {
    if (prevHasData()) throw new Error("Refusing to overwrite existing flows with 0 rows");
  }

  const dataset: FlowsDataset = {
    fetchedAt: new Date().toISOString(),
    source: "NSE",
    date: fii?.date ?? dii?.date ?? null,
    fii,
    dii,
  };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(dataset, null, 2) + "\n");
  console.log(`Wrote ${OUT}: date=${dataset.date} FII net=${fii?.net ?? "?"} DII net=${dii?.net ?? "?"}`);

  if (rows.length) writeDailyPartition<FlowRow>("fii-dii", rows);
}

main().catch((err) => {
  console.error(`FII/DII ingestion failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
