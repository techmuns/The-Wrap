export type DealCategory = "bulk" | "block" | "short";

export type DealSide = "BUY" | "SELL";

export interface Deal {
  category: DealCategory;
  /** NSE trading symbol, e.g. "AGIIL". */
  symbol: string | null;
  /** Company name as reported by NSE. */
  name: string | null;
  /** Buyer/seller client name (often null for short deals). */
  clientName: string | null;
  buySell: DealSide | null;
  /** Quantity of shares. */
  qty: number | null;
  /** Weighted average trade price (rupees). */
  watp: number | null;
  /** Deal value in rupees = qty x watp (null when either is missing). */
  value: number | null;
  /** Trade date as reported, e.g. "14-Aug-2026". */
  date: string | null;
  remarks: string | null;
}

export interface DealsDataset {
  /** "As on" date reported by NSE for this snapshot. */
  asOnDate: string | null;
  /** ISO timestamp of when the ingestion ran. */
  fetchedAt: string | null;
  counts: { bulk: number; block: number; short: number };
  bulk: Deal[];
  block: Deal[];
  short: Deal[];
}

export const EMPTY_DEALS: DealsDataset = {
  asOnDate: null,
  fetchedAt: null,
  counts: { bulk: 0, block: 0, short: 0 },
  bulk: [],
  block: [],
  short: [],
};
