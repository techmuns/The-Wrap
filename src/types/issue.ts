export interface SectionItem {
  text: string;
  /** Marks a "must-read" item (rendered with a star). */
  starred?: boolean;
}

export interface SectionGroup {
  heading?: string;
  items: SectionItem[];
}

export interface IssueSection {
  id: string;
  title: string;
  /** Narrative paragraphs. */
  body?: string[];
  /** Grouped lists (e.g. deal categories). */
  groups?: SectionGroup[];
  /** A small muted note, e.g. pointing at a live tracker. */
  note?: string;
  /** Optional link to a live Data Tool. */
  link?: { href: string; label: string };
}

export interface Issue {
  /** URL slug, e.g. "2025-11-30". */
  slug: string;
  /** Display date, e.g. "30 Nov 2025". */
  date: string;
  /** ISO date for sorting, e.g. "2025-11-30". */
  isoDate: string;
  /** Our headline for the week. */
  title: string;
  /** One-line thesis / standfirst. */
  dek: string;
  readingTime: string;
  /** Optional hero image URL (drop in your own artwork); falls back to a banner. */
  image?: string;
  sections: IssueSection[];
}
