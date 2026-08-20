export interface Stage2Row {
  symbol: string | null;
  company: string | null;
  /** Current market price (₹). */
  cmp: number | null;
  /** Market capitalisation (₹ crore). */
  marCap: number | null;
  /** Return over 1 year (%). */
  ret1y: number | null;
}

export interface Stage2Dataset {
  fetchedAt: string | null;
  source: string;
  /** Plain-English description of the screen criteria. */
  description: string;
  count: number;
  items: Stage2Row[];
}

export const EMPTY_STAGE2: Stage2Dataset = {
  fetchedAt: null,
  source: "",
  description: "",
  count: 0,
  items: [],
};
