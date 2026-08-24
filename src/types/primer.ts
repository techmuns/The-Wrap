export type PrimerCategory =
  | "Materials"
  | "Consumer"
  | "Energy"
  | "Engineering"
  | "Pharma"
  | "Financials"
  | "Technology"
  | "Automobiles";

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
  /** Optional cover illustration URL; falls back to a branded emoji banner. */
  image?: string;
  sections: PrimerSection[];
  /** Key listed Indian players. */
  players: PrimerPlayer[];
  risks: string[];
}
