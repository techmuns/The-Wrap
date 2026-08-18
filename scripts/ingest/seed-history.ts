/**
 * One-off backfill: seed the daily archive from the current snapshots.
 *
 * The daily ingests archive a partition on every run going forward, but that
 * leaves the archive empty until each feed next runs. This seeds one partition
 * per feed from the snapshot already committed in src/data/<feed>.json, dated by
 * that snapshot's own fetchedAt, so the weekly generator has real history to
 * read immediately. Safe to re-run — it just overwrites that day's partition.
 *
 * Run: `npm run seed:history`
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { writeDailyPartition, utcDay } from "./history";
import type { DealsDataset, Deal } from "../../src/types/deals";
import type { InsiderTradesDataset, InsiderTrade } from "../../src/types/insider";
import type { AnnouncementsDataset, Announcement } from "../../src/types/announcements";
import type { ConcallsDataset, Concall } from "../../src/types/concalls";
import type { CorporateActionsDataset, CorporateAction } from "../../src/types/corporate-actions";

const DATA_DIR = resolve(process.cwd(), "src/data");

function read<T>(file: string): T | null {
  const p = join(DATA_DIR, file);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as T;
  } catch {
    return null;
  }
}

/** UTC day from an ISO timestamp, or today if absent. */
function dayOf(fetchedAt: string | null | undefined): string {
  if (fetchedAt) {
    const d = new Date(fetchedAt);
    if (!Number.isNaN(d.getTime())) return utcDay(d);
  }
  return utcDay();
}

function main() {
  const deals = read<DealsDataset>("bulk-block-deals.json");
  if (deals) {
    writeDailyPartition<Deal>("bulk-block-deals", [...deals.bulk, ...deals.block, ...deals.short], dayOf(deals.fetchedAt));
  }
  const insider = read<InsiderTradesDataset>("insider-trades.json");
  if (insider) writeDailyPartition<InsiderTrade>("insider-trades", insider.items, dayOf(insider.fetchedAt));

  const ann = read<AnnouncementsDataset>("announcements.json");
  if (ann) writeDailyPartition<Announcement>("announcements", ann.items, dayOf(ann.fetchedAt));

  const concalls = read<ConcallsDataset>("concalls.json");
  if (concalls) writeDailyPartition<Concall>("concalls", concalls.items, dayOf(concalls.fetchedAt));

  const corp = read<CorporateActionsDataset>("corporate-actions.json");
  if (corp) writeDailyPartition<CorporateAction>("corporate-actions", corp.items, dayOf(corp.fetchedAt));

  console.log("Seed complete.");
}

main();
