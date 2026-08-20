export interface FlowRow {
  /** "FII" or "DII". */
  category: string;
  /** Trading day, e.g. "19-Aug-2026". */
  date: string | null;
  /** Gross buy value in ₹ crore. */
  buy: number | null;
  /** Gross sell value in ₹ crore. */
  sell: number | null;
  /** Net (buy − sell) in ₹ crore; positive = net buying. */
  net: number | null;
}

export interface FlowsDataset {
  fetchedAt: string | null;
  source: string;
  /** The trading day these flows are for. */
  date: string | null;
  fii: FlowRow | null;
  dii: FlowRow | null;
}

export const EMPTY_FLOWS: FlowsDataset = {
  fetchedAt: null,
  source: "",
  date: null,
  fii: null,
  dii: null,
};
