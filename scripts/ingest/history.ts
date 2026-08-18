/**
 * Daily-partition archive for the data feeds.
 *
 * Each daily ingest overwrites its snapshot (src/data/<feed>.json) with the
 * latest rows — that's what the live Data Tools read. But a single overwritten
 * snapshot never holds a full trading week, so the weekly issue generator would
 * only ever see the latest day or two. To fix that, every ingest ALSO appends
 * an immutable daily partition here:
 *
 *   src/data/history/<feed>/<YYYY-MM-DD>.json
 *     = { capturedOn, capturedAt, count, rows }
 *
 * Consecutive days' snapshots overlap, so the weekly generator reads a window
 * of partitions and dedupes by a feed-specific key (see build-weekly-issue.ts).
 * Partitions older than RETENTION_DAYS are pruned on write to bound repo growth.
 *
 * These files are committed by the daily refresh workflows — that's how the
 * archive survives the ephemeral CI runners.
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";

export const HISTORY_ROOT = resolve(process.cwd(), "src/data/history");
export const RETENTION_DAYS = 60;

export interface DailyPartition<T> {
  /** UTC calendar day this snapshot was captured, YYYY-MM-DD. */
  capturedOn: string;
  /** Full ISO timestamp of the capture. */
  capturedAt: string;
  count: number;
  rows: T[];
}

/** UTC calendar day (YYYY-MM-DD) for a date, defaulting to now. */
export function utcDay(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function feedDir(feed: string): string {
  return join(HISTORY_ROOT, feed);
}

/**
 * Write today's partition for a feed, then prune partitions past retention.
 * No-op on empty rows so a failed/empty pull never records a hollow day.
 */
export function writeDailyPartition<T>(feed: string, rows: T[], day: string = utcDay()): void {
  if (!rows.length) return;
  const dir = feedDir(feed);
  mkdirSync(dir, { recursive: true });
  const partition: DailyPartition<T> = {
    capturedOn: day,
    capturedAt: new Date().toISOString(),
    count: rows.length,
    rows,
  };
  writeFileSync(join(dir, `${day}.json`), JSON.stringify(partition, null, 2) + "\n");
  pruneOld(feed);
  console.log(`  archived ${rows.length} rows -> src/data/history/${feed}/${day}.json`);
}

function pruneOld(feed: string): void {
  const dir = feedDir(feed);
  if (!existsSync(dir)) return;
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - RETENTION_DAYS);
  const cutoffDay = utcDay(cutoff);
  for (const f of readdirSync(dir)) {
    const m = f.match(/^(\d{4}-\d{2}-\d{2})\.json$/);
    if (m && m[1] < cutoffDay) rmSync(join(dir, f));
  }
}

/** Read all partitions for a feed whose capturedOn is in [startDay, endDay] inclusive, oldest first. */
export function readWindow<T>(feed: string, startDay: string, endDay: string): DailyPartition<T>[] {
  const dir = feedDir(feed);
  if (!existsSync(dir)) return [];
  const out: DailyPartition<T>[] = [];
  for (const f of readdirSync(dir)) {
    const m = f.match(/^(\d{4}-\d{2}-\d{2})\.json$/);
    if (!m || m[1] < startDay || m[1] > endDay) continue;
    try {
      out.push(JSON.parse(readFileSync(join(dir, f), "utf8")) as DailyPartition<T>);
    } catch {
      /* skip a corrupt partition rather than fail the whole run */
    }
  }
  return out.sort((a, b) => a.capturedOn.localeCompare(b.capturedOn));
}

/** Merge a window of partitions into a deduped row list (first occurrence wins). */
export function mergeWindow<T>(parts: DailyPartition<T>[], key: (row: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const p of parts) {
    for (const row of p.rows) {
      const k = key(row);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(row);
    }
  }
  return out;
}
