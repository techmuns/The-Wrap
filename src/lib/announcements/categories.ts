import type { AnnouncementCategory } from "../../types/announcements";

export interface CategoryMeta {
  slug: AnnouncementCategory;
  label: string;
  /** Short description for filter UIs. */
  blurb: string;
}

/**
 * Display order + labels for the announcement taxonomy. Mirrors the reference
 * newsletter's "Noteworthy Announcements" mega-section categories.
 */
export const CATEGORY_ORDER: CategoryMeta[] = [
  { slug: "capex", label: "Capex & New Ventures", blurb: "Capacity expansion, new plants and forays." },
  { slug: "order-wins", label: "Order Wins", blurb: "New orders and contract wins." },
  { slug: "acquisitions", label: "Acquisitions", blurb: "M&A and stake purchases." },
  { slug: "jv", label: "Joint Ventures", blurb: "JVs, collaborations and partnerships." },
  { slug: "regulatory", label: "USFDA / Regulatory", blurb: "Approvals, inspections and regulatory news." },
  { slug: "merger", label: "Mergers & Spin-offs", blurb: "Mergers, demergers and schemes of arrangement." },
  { slug: "open-offer", label: "Open Offers", blurb: "Open offers and takeovers." },
  { slug: "fund-raising", label: "Fund Raising", blurb: "QIPs, NCDs, warrants and preferential issues." },
  { slug: "buyback", label: "Buyback", blurb: "Share buybacks." },
  { slug: "bonus", label: "Bonus", blurb: "Bonus issues." },
  { slug: "split", label: "Stock Split", blurb: "Stock splits and sub-divisions." },
  { slug: "rights", label: "Rights Issue", blurb: "Rights issues." },
  { slug: "name-change", label: "Name Change", blurb: "Company name changes." },
  { slug: "concall", label: "Concalls & Presentations", blurb: "Earnings calls and investor presentations." },
  { slug: "other", label: "Other", blurb: "Other noteworthy filings." },
];

export const CATEGORY_LABELS: Record<AnnouncementCategory, string> =
  Object.fromEntries(CATEGORY_ORDER.map((c) => [c.slug, c.label])) as Record<
    AnnouncementCategory,
    string
  >;

/** Categories that have their own Data Tools route (a filtered view). */
export const ROUTED_CATEGORIES: Record<string, AnnouncementCategory> = {
  capex: "capex",
  "order-wins": "order-wins",
  acquisitions: "acquisitions",
};
