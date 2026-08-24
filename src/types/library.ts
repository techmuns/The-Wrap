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
  /** The video title. */
  title: string;
  /** The channel / creator. */
  by: string;
  category: CuratedCategory;
  note: string;
  /** YouTube video ID — drives the real thumbnail and the watch link. */
  videoId: string;
  /** Small topic tags shown on the card. */
  tags?: string[];
}
