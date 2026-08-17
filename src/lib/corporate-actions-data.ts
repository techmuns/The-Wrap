import raw from "@/data/corporate-actions.json";
import {
  EMPTY_CORPORATE_ACTIONS,
  type CorporateActionsDataset,
} from "@/types/corporate-actions";

export function getCorporateActions(): CorporateActionsDataset {
  const data = raw as CorporateActionsDataset;
  if (!data || !Array.isArray(data.items)) return EMPTY_CORPORATE_ACTIONS;
  return data;
}
