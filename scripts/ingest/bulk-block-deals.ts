/**
 * Ingests NSE bulk, block and short deals into a static JSON file the app
 * reads at build time.
 *
 * Flow (verified working without login):
 *   1. GET https://www.nseindia.com/  -> sets the anti-bot cookie (returns 403
 *      for the HTML body but still hands back a usable cookie).
 *   2. GET /api/snapshot-capital-market-largedeal with a browser User-Agent,
 *      a Referer, and that cookie -> returns BULK/BLOCK/SHORT deal arrays in
 *      one response.
 *
 * Safety: if the pull returns zero records while a previous snapshot has data,
 * the script exits non-zero WITHOUT writing, so a rate-limited/failed scrape
 * can never overwrite good live data.
 *
 * Run: `npm run ingest:bulk-block`
 */
import {
  writeFileSync,
  existsSync,
  readFileSync,
  mkdirSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import type { Deal, DealCategory, DealsDataset } from "../../src/types/deals";
import { writeDailyPartition } from "./history";

const HOME = "https://www.nseindia.com/";
const API =
  "https://www.nseindia.com/api/snapshot-capital-market-largedeal";
const REFERER = "https://www.nseindia.com/market-data/block-deal-watch";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const OUT = resolve(process.cwd(), "src/data/bulk-block-deals.json");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface RawDeal {
  buySell?: string | null;
  clientName?: string | null;
  date?: string | null;
  name?: string | null;
  qty?: string | null;
  remarks?: string | null;
  symbol?: string | null;
  watp?: string | null;
}

interface RawResponse {
  as_on_date?: string;
  BULK_DEALS_DATA?: RawDeal[];
  BLOCK_DEALS_DATA?: RawDeal[];
  SHORT_DEALS_DATA?: RawDeal[];
}

function toNumber(s: string | null | undefined): number | null {
  if (s == null) return null;
  const n = Number(String(s).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function normalize(category: DealCategory, rows: RawDeal[] | undefined): Deal[] {
  return (rows ?? []).map((r) => {
    const qty = toNumber(r.qty);
    const watp = toNumber(r.watp);
    const side =
      r.buySell === "BUY" || r.buySell === "SELL" ? r.buySell : null;
    const remarks = r.remarks && r.remarks !== "-" ? r.remarks : null;
    return {
      category,
      symbol: r.symbol ?? null,
      name: r.name ?? null,
      clientName: r.clientName ?? null,
      buySell: side,
      qty,
      watp,
      value: qty != null && watp != null ? qty * watp : null,
      date: r.date ?? null,
      remarks,
    };
  });
}

async function primeCookies(): Promise<string> {
  const res = await fetch(HOME, {
    headers: {
      "User-Agent": UA,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  const setCookies = res.headers.getSetCookie?.() ?? [];
  const cookie = setCookies.map((c) => c.split(";")[0]).join("; ");
  if (!cookie) {
    throw new Error(`No cookies returned from home page (status ${res.status})`);
  }
  return cookie;
}

async function fetchLargeDeals(): Promise<RawResponse> {
  const cookie = await primeCookies();
  const res = await fetch(API, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: REFERER,
      Cookie: cookie,
    },
  });
  if (!res.ok) {
    throw new Error(`largedeal API returned HTTP ${res.status}`);
  }
  const json = (await res.json()) as RawResponse;
  if (
    !json ||
    (!json.BULK_DEALS_DATA && !json.BLOCK_DEALS_DATA && !json.SHORT_DEALS_DATA)
  ) {
    throw new Error("largedeal API response missing expected data arrays");
  }
  return json;
}

async function fetchWithRetry(attempts = 3): Promise<RawResponse> {
  let lastErr: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fetchLargeDeals();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`  attempt ${i}/${attempts} failed: ${msg}`);
      if (i < attempts) await sleep(1500 * i);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

function previousTotal(): number {
  if (!existsSync(OUT)) return 0;
  try {
    const prev = JSON.parse(readFileSync(OUT, "utf8")) as DealsDataset;
    const c = prev.counts;
    return (c?.bulk ?? 0) + (c?.block ?? 0) + (c?.short ?? 0);
  } catch {
    return 0;
  }
}

async function main() {
  console.log("Fetching NSE bulk/block/short deals ...");
  const raw = await fetchWithRetry();

  const bulk = normalize("bulk", raw.BULK_DEALS_DATA);
  const block = normalize("block", raw.BLOCK_DEALS_DATA);
  const short = normalize("short", raw.SHORT_DEALS_DATA);
  const total = bulk.length + block.length + short.length;

  // Safety check: never overwrite good data with an empty pull.
  const prevTotal = previousTotal();
  if (total === 0 && prevTotal > 0) {
    throw new Error(
      `Refusing to overwrite ${prevTotal} existing records with 0 new records`
    );
  }

  const dataset: DealsDataset = {
    asOnDate: raw.as_on_date ?? null,
    fetchedAt: new Date().toISOString(),
    counts: { bulk: bulk.length, block: block.length, short: short.length },
    bulk,
    block,
    short,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(dataset, null, 2) + "\n");
  console.log(
    `Wrote ${OUT}\n  bulk=${bulk.length} block=${block.length} short=${short.length} (as on ${dataset.asOnDate})`
  );

  // Also append an immutable daily partition so the weekly generator can
  // assemble a full trading week (each Deal already carries its category).
  writeDailyPartition<Deal>("bulk-block-deals", [...bulk, ...block, ...short]);
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`Ingestion failed: ${msg}`);
  process.exit(1);
});
