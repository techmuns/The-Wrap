import raw from "@/data/flows.json";
import { EMPTY_FLOWS, type FlowsDataset } from "@/types/flows";

export function getFlows(): FlowsDataset {
  const data = raw as FlowsDataset;
  if (!data) return EMPTY_FLOWS;
  return { ...EMPTY_FLOWS, ...data };
}
