export interface IndexQuote {
  /** Index name, e.g. "NIFTY BANK". */
  name: string;
  symbol: string | null;
  last: number | null;
  /** Point change on the day. */
  change: number | null;
  /** Percent change on the day. */
  pctChange: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  previousClose: number | null;
  yearHigh: number | null;
  yearLow: number | null;
  /** Constituent advances / declines / unchanged (breadth). */
  advances: number | null;
  declines: number | null;
  unchanged: number | null;
}

export interface IndicesDataset {
  fetchedAt: string | null;
  source: string;
  /** "As on" timestamp reported by NSE. */
  timestamp: string | null;
  /** Broad-market indices (Nifty 50, 500, Midcap, Smallcap, Total Market…). */
  broad: IndexQuote[];
  /** Sectoral indices (Bank, IT, Auto, Pharma…). */
  sectoral: IndexQuote[];
}

export const EMPTY_INDICES: IndicesDataset = {
  fetchedAt: null,
  source: "",
  timestamp: null,
  broad: [],
  sectoral: [],
};
