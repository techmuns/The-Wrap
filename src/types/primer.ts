export type PrimerCategory =
  | "Materials"
  | "Consumer"
  | "Energy"
  | "Engineering"
  | "Pharma"
  | "Financials"
  | "Technology";

export interface PrimerSection {
  heading: string;
  body: string[];
}

export interface PrimerPlayer {
  name: string;
  note: string;
}

export interface Primer {
  slug: string;
  title: string;
  category: PrimerCategory;
  /** One-line standfirst. */
  dek: string;
  readingTime: string;
  sections: PrimerSection[];
  /** Key listed Indian players. */
  players: PrimerPlayer[];
  risks: string[];
}
