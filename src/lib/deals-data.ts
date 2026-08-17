import raw from "@/data/bulk-block-deals.json";
import { EMPTY_DEALS, type DealsDataset } from "@/types/deals";

/**
 * Bulk & Block deals dataset, read from the static JSON produced by
 * `scripts/ingest/bulk-block-deals.ts` (refreshed on a schedule by GitHub
 * Actions). Returns an empty dataset if the file is somehow malformed so the
 * page renders a graceful empty state rather than crashing.
 */
export function getBulkBlockDeals(): DealsDataset {
  const data = raw as DealsDataset;
  if (!data || !data.counts) return EMPTY_DEALS;
  return data;
}
