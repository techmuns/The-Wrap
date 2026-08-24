export type BookCategory = "Fundamentals" | "Technical Analysis" | "Industry" | "Knowledge Base";

export interface Book {
  title: string;
  author: string;
  category: BookCategory;
  /** Our one-line take on why it's worth reading. */
  note: string;
  mustRead?: boolean;
}

export type CuratedCategory =
  | "Investing Skills"
  | "Expert Views"
  | "Industry Deep Dives"
  | "Company Deep Dives";

export interface CuratedItem {
  /** What to watch — a channel, series or creator. */
  title: string;
  by: string;
  category: CuratedCategory;
  note: string;
  /** A YouTube link that always resolves (channel or search). */
  url: string;
}
