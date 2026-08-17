export type TradeSide = "BUY" | "SELL";

export interface InsiderTrade {
  company: string | null;
  symbol: string | null;
  /** Name of the acquirer/disposer. */
  person: string | null;
  /** e.g. "Promoter", "Promoter Group", "Director", "Management". */
  role: string | null;
  buySell: TradeSide | null;
  /** Number of shares. */
  shares: number | null;
  /** Percentage of the company (e.g. 0.22 = 0.22%). Nullable. */
  pct: number | null;
  /** Deal value in rupees. Nullable. */
  value: number | null;
  /** e.g. "Market", "Off-market", "Preferential". Nullable. */
  mode: string | null;
  /** Display date, e.g. "14 Aug 2026". */
  date: string | null;
  /** ISO date/time for sorting. */
  isoDate: string | null;
}

export interface InsiderTradesDataset {
  fetchedAt: string | null;
  source: string;
  total: number;
  items: InsiderTrade[];
}

export const EMPTY_INSIDER: InsiderTradesDataset = {
  fetchedAt: null,
  source: "",
  total: 0,
  items: [],
};
