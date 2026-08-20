import raw from "@/data/movers.json";
import { EMPTY_MOVERS, type MoversDataset } from "@/types/movers";

export function getMovers(): MoversDataset {
  const data = raw as MoversDataset;
  if (!data) return EMPTY_MOVERS;
  return { ...EMPTY_MOVERS, ...data };
}
