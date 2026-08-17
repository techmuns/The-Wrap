/* Local sanity check for the announcement classifier. Run: tsx scripts/dev/test-classify.ts */
import { classifyAnnouncement } from "../../src/lib/announcements/classify";
import type { AnnouncementCategory } from "../../src/types/announcements";

const cases: { subject: string; headline?: string; expect: AnnouncementCategory }[] = [
  // Real NSE announcement subjects
  { subject: "Commencement of commercial production/operations", expect: "capex" },
  { subject: "Analysts/Institutional Investor Meet/Con. Call Updates", expect: "concall" },
  { subject: "Investor Presentation", expect: "concall" },
  { subject: "Credit Rating- Revision", expect: "other" },
  { subject: "General Updates", expect: "other" },
  { subject: "Copy of Newspaper Publication", expect: "other" },
  // Reference-style items
  { subject: "Order", headline: "Ceigall India receives a new order worth 1089cr", expect: "order-wins" },
  { subject: "Agreement", headline: "ACME Solar signs a 200 MW PPA with SECI for Battery Storage", expect: "order-wins" },
  { subject: "Capacity", headline: "Vikram Solar commissions its new 5GW solar module manufacturing facility", expect: "capex" },
  { subject: "Expansion", headline: "Asian Paints to set up a new manufacturing facility in UAE", expect: "capex" },
  { subject: "Acquisition", headline: "Adani Enterprises acquires Trade Castle Tech Park Ltd for 231cr", expect: "acquisitions" },
  { subject: "Acquisition", headline: "Pidilite acquires a strategic stake in MagicDecor", expect: "acquisitions" },
  { subject: "JV", headline: "Neogen Chemicals enters into a joint venture with Morita Group", expect: "jv" },
  { subject: "Collaboration", headline: "Cyient and CNH to collaborate on autonomous solutions", expect: "jv" },
  { subject: "Regulatory", headline: "Dr Reddys receives European Commission approval for its new biosimilar", expect: "regulatory" },
  { subject: "USFDA", headline: "Shilpa Medicare receives eight observations in a USFDA audit", expect: "regulatory" },
  { subject: "Regulatory", headline: "Biocon receives a VAI report for its Bengaluru biologics facility", expect: "regulatory" },
  { subject: "Merger", headline: "Presentation: Kwality Walls to spin off from Hindustan Unilever", expect: "merger" },
  { subject: "Fund Raising", headline: "Aditya Birla Capital raises 200cr via NCDs", expect: "fund-raising" },
  { subject: "Fund Raising", headline: "Swaraj Suiting raises 263cr via preference issue of shares and warrants", expect: "fund-raising" },
  { subject: "Buyback", headline: "Company announces a buyback of shares", expect: "buyback" },
  { subject: "Bonus", headline: "KPI Green Energy bonus issue record date", expect: "bonus" },
  { subject: "Open Offer", headline: "Octaware Technologies Letter of Offer - Open Offer", expect: "open-offer" },
];

let pass = 0;
const fails: string[] = [];
for (const c of cases) {
  const got = classifyAnnouncement(c.subject, c.headline ?? null);
  if (got === c.expect) pass++;
  else fails.push(`  FAIL: [${c.expect} != ${got}]  "${c.headline ?? c.subject}"`);
}
console.log(`Classifier: ${pass}/${cases.length} passed`);
if (fails.length) {
  console.log(fails.join("\n"));
  process.exit(1);
}
