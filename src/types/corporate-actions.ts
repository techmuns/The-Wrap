export type ActionType = "bonus" | "buyback" | "split" | "rights" | "dividend";

export interface CorporateAction {
  company: string | null;
  symbol: string | null;
  type: ActionType;
  /** The action specifics, e.g. "1:1", "₹5 / share", "Buyback ₹500". */
  detail: string | null;
  /** Record / ex date as displayed. */
  date: string | null;
  isoDate: string | null;
}

export interface CorporateActionsDataset {
  fetchedAt: string | null;
  source: string;
  total: number;
  byType: Partial<Record<ActionType, number>>;
  items: CorporateAction[];
}

export const EMPTY_CORPORATE_ACTIONS: CorporateActionsDataset = {
  fetchedAt: null,
  source: "",
  total: 0,
  byType: {},
  items: [],
};

export const ACTION_LABELS: Record<ActionType, string> = {
  bonus: "Bonus",
  buyback: "Buyback",
  split: "Stock Split",
  rights: "Rights Issue",
  dividend: "Dividend",
};
