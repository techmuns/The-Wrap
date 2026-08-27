export interface SectorEmaRow {
  sector: string;
  /** Number of stocks priced in this sector. */
  count: number;
  /** % of stocks above each EMA, aligned to `periods`. */
  pct: number[];
}

export interface SectorEmaDataset {
  fetchedAt: string | null;
  universe: string;
  /** e.g. ["4W","20W","30W","40W","52W"]. */
  periods: string[];
  /** Stocks successfully priced. */
  coverage: number;
  sectors: SectorEmaRow[];
}
