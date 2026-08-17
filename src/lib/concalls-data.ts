import raw from "@/data/concalls.json";
import { EMPTY_CONCALLS, type ConcallsDataset } from "@/types/concalls";

export function getConcalls(): ConcallsDataset {
  const data = raw as ConcallsDataset;
  if (!data || !Array.isArray(data.items)) return EMPTY_CONCALLS;
  return data;
}
