/**
 * Sector momentum grid — % of stocks trading above their 4W / 20W / 30W / 40W /
 * 52W EMA, per sector. This is the data behind the reference's "Market Action"
 * heatmap. Universe: the NSE Nifty 500 (with NSE's own industry classification);
 * weekly closes from Yahoo Finance. All public data — no mock values.
 *
 * Run: `npm run ingest:sector-ema`
 * Output: src/data/sector-ema.json
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const LIST_URL = "https://nsearchives.nseindia.com/content/indices/ind_nifty500list.csv";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const PERIODS = [4, 20, 30, 40, 52];
const CONCURRENCY = 8;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Row {
  symbol: string;
  sector: string;
}

/** Parse the Nifty 500 CSV. Industry/Symbol are read from the right so commas
 *  inside a company name can't shift them. Columns: Company, Industry, Symbol,
 *  Series, ISIN. */
function parseList(csv: string): Row[] {
  const out: Row[] = [];
  const lines = csv.trim().split(/\r?\n/).slice(1); // drop header
  for (const line of lines) {
    const f = line.split(",");
    if (f.length < 5) continue;
    const symbol = f[f.length - 3]?.trim();
    const sector = f[f.length - 4]?.trim();
    if (symbol && sector) out.push({ symbol, sector });
  }
  return out;
}

/** Weekly closes (ascending) for a symbol, or null on failure. */
async function weeklyCloses(symbol: string): Promise<number[] | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}.NS?range=2y&interval=1wk`;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) {
        await sleep(300);
        continue;
      }
      const data = (await res.json()) as {
        chart?: { result?: { indicators?: { quote?: { close?: (number | null)[] }[] } }[] };
      };
      const closes = data.chart?.result?.[0]?.indicators?.quote?.[0]?.close;
      if (!closes) return null;
      const clean = closes.filter((c): c is number => typeof c === "number" && c > 0);
      return clean.length >= 5 ? clean : null;
    } catch {
      await sleep(300);
    }
  }
  return null;
}

function ema(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const k = 2 / (period + 1);
  let e = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < values.length; i++) e = values[i] * k + e * (1 - k);
  return e;
}

/** For one stock: booleans for above each EMA period (null = not enough data). */
function aboveFlags(closes: number[]): (boolean | null)[] {
  const price = closes[closes.length - 1];
  return PERIODS.map((p) => {
    const e = ema(closes, p);
    return e == null ? null : price > e;
  });
}

async function pool<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
      await sleep(80);
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker));
  return out;
}

/** Load the Nifty 500 list: try live (with retries), else the bundled CSV. */
async function loadUniverse(): Promise<Row[]> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(LIST_URL, { headers: { "User-Agent": UA } });
      if (res.ok) {
        const rows = parseList(await res.text());
        if (rows.length > 100) return rows;
      }
    } catch {
      /* retry */
    }
    await sleep(500);
  }
  const bundled = resolve(process.cwd(), "scripts/ingest/nifty500.csv");
  if (existsSync(bundled)) {
    console.log("Live list unavailable — using bundled nifty500.csv.");
    return parseList(readFileSync(bundled, "utf8"));
  }
  return [];
}

async function main() {
  const rows = await loadUniverse();
  console.log(`Universe: ${rows.length} stocks across ${new Set(rows.map((r) => r.sector)).size} sectors.`);
  if (!rows.length) throw new Error("Empty universe — aborting so we don't overwrite good data.");

  // sector -> per-period [aboveCount, total]
  const agg = new Map<string, { above: number[]; total: number }>();
  let ok = 0;

  const results = await pool(rows, CONCURRENCY, async (r) => {
    const closes = await weeklyCloses(r.symbol);
    return { r, closes };
  });

  for (const { r, closes } of results) {
    if (!closes) continue;
    ok++;
    const flags = aboveFlags(closes);
    if (!agg.has(r.sector)) agg.set(r.sector, { above: PERIODS.map(() => 0), total: 0 });
    const a = agg.get(r.sector)!;
    a.total++;
    flags.forEach((f, i) => {
      if (f === true) a.above[i]++;
    });
  }

  const sectors = [...agg.entries()]
    .filter(([, v]) => v.total >= 3) // skip tiny sectors
    .map(([sector, v]) => ({
      sector,
      count: v.total,
      // % of stocks above each EMA, rounded
      pct: v.above.map((c) => Math.round((c / v.total) * 100)),
    }))
    // sort by the longest-term (52W) momentum, strongest first
    .sort((x, y) => y.pct[PERIODS.length - 1] - x.pct[PERIODS.length - 1]);

  const payload = {
    fetchedAt: new Date().toISOString(),
    universe: "NSE Nifty 500",
    periods: PERIODS.map((p) => `${p}W`),
    coverage: ok,
    sectors,
  };

  const path = resolve(process.cwd(), "src/data/sector-ema.json");
  writeFileSync(path, JSON.stringify(payload, null, 2) + "\n");
  console.log(`Priced ${ok}/${rows.length} stocks. Wrote ${sectors.length} sectors to ${path}`);
}

main();
