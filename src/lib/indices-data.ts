import raw from "@/data/indices.json";
import { EMPTY_INDICES, type IndicesDataset } from "@/types/indices";

export function getIndices(): IndicesDataset {
  const data = raw as IndicesDataset;
  if (!data || (!Array.isArray(data.broad) && !Array.isArray(data.sectoral))) {
    return EMPTY_INDICES;
  }
  return { ...EMPTY_INDICES, ...data };
}
