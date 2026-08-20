export interface MoverRow {
  symbol: string | null;
  company: string | null;
  last: number | null;
  pctChange: number | null;
}

export interface VolumeRow extends MoverRow {
  /** Today's traded volume (shares). */
  volume: number | null;
  /** How many times the recent average volume today's volume is. */
  timesAvg: number | null;
}

export interface MoversDataset {
  fetchedAt: string | null;
  source: string;
  timestamp: string | null;
  highs: MoverRow[];
  lows: MoverRow[];
  volume: VolumeRow[];
}

export const EMPTY_MOVERS: MoversDataset = {
  fetchedAt: null,
  source: "",
  timestamp: null,
  highs: [],
  lows: [],
  volume: [],
};
