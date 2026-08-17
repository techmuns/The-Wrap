export type ConcallKind = "recent" | "upcoming";

export interface Concall {
  company: string | null;
  symbol: string | null;
  kind: ConcallKind;
  /** Display date (call date for recent, scheduled date for upcoming). */
  date: string | null;
  isoDate: string | null;
  /** Links to materials — transcript / notes / PPT / recording. */
  links: { label: string; url: string }[];
}

export interface ConcallsDataset {
  fetchedAt: string | null;
  source: string;
  counts: { recent: number; upcoming: number };
  items: Concall[];
}

export const EMPTY_CONCALLS: ConcallsDataset = {
  fetchedAt: null,
  source: "",
  counts: { recent: 0, upcoming: 0 },
  items: [],
};
