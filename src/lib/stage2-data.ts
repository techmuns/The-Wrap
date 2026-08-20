import raw from "@/data/stage2.json";
import { EMPTY_STAGE2, type Stage2Dataset } from "@/types/stage2";

export function getStage2(): Stage2Dataset {
  const d = raw as Stage2Dataset;
  if (!d || !Array.isArray(d.items)) return EMPTY_STAGE2;
  return { ...EMPTY_STAGE2, ...d };
}
