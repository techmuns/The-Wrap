export type AnnouncementCategory =
  | "capex"
  | "order-wins"
  | "acquisitions"
  | "jv"
  | "regulatory"
  | "merger"
  | "open-offer"
  | "fund-raising"
  | "buyback"
  | "bonus"
  | "split"
  | "rights"
  | "name-change"
  | "concall"
  | "other";

export interface Announcement {
  company: string | null;
  symbol: string | null;
  category: AnnouncementCategory;
  /** Source announcement subject / type. */
  subject: string | null;
  /** Headline / short description. */
  headline: string | null;
  /** Display date, e.g. "14 Aug 2026". */
  date: string | null;
  /** ISO date/time for sorting, e.g. "2026-08-14T10:30:00". */
  isoDate: string | null;
  /** Link to the source filing / attachment. */
  url: string | null;
}

export interface AnnouncementsDataset {
  fetchedAt: string | null;
  /** Where the data came from, e.g. "Screener". */
  source: string;
  total: number;
  /** Count per category. */
  byCategory: Partial<Record<AnnouncementCategory, number>>;
  items: Announcement[];
}

export const EMPTY_ANNOUNCEMENTS: AnnouncementsDataset = {
  fetchedAt: null,
  source: "Screener",
  total: 0,
  byCategory: {},
  items: [],
};
