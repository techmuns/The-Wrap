import raw from "@/data/insider-trades.json";
import { EMPTY_INSIDER, type InsiderTradesDataset } from "@/types/insider";

/**
 * Insider / promoter trades dataset, read from the static JSON written by the
 * insider-trades ingestion (see docs/DATA-CONTRACTS.md). Returns an empty
 * dataset if the file is missing/malformed so the page renders a graceful
 * empty state.
 */
export function getInsiderTrades(): InsiderTradesDataset {
  const data = raw as InsiderTradesDataset;
  if (!data || !Array.isArray(data.items)) return EMPTY_INSIDER;
  return data;
}
