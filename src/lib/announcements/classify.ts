import type { AnnouncementCategory } from "../../types/announcements";

/**
 * Rule-based classifier that maps a corporate-announcement subject + headline
 * onto our taxonomy. Rules are evaluated in order; the first match wins, so
 * more specific categories come before broad ones ("order" is broad, so
 * order-wins is near the end). Best-effort tagging — items can be reviewed.
 */
const RULES: { category: AnnouncementCategory; pattern: RegExp }[] = [
  {
    category: "regulatory",
    pattern:
      /\bus\s?fda\b|\bfda\b|form\s?483|483\s?observ|establishment inspection|\beir\b|\bvai\b|\bnai\b|\boai\b|\banda\b|biosimilar|\bema\b|european (medicines|commission) (approval|agency)|who[- ]?gmp|gmp certificat|drug approval|marketing authoriz|import alert|\bcdsco\b|observations in a.*audit|inspection.*(plant|facility|unit)/,
  },
  {
    category: "merger",
    pattern:
      /\bmerger\b|amalgamation|de-?merger|demerger|spin-?off|scheme of arrangement|composite scheme|slump sale/,
  },
  {
    category: "open-offer",
    pattern: /open offer|takeover|\bsast\b|substantial acquisition of shares/,
  },
  { category: "buyback", pattern: /buy-?back/ },
  { category: "bonus", pattern: /bonus (issue|share|of)|issue of bonus/ },
  {
    category: "split",
    pattern: /stock split|sub-?division of|face value split|split of shares/,
  },
  { category: "rights", pattern: /rights issue|rights entitlement/ },
  {
    category: "fund-raising",
    pattern:
      /\bqip\b|qualified institutional|preferential (issue|allotment)|\bncd\b|non-?convertible deb|debentures?|fund rais|raise.*(fund|capital)|commercial paper|\bfpo\b|private placement|issue of warrants|allotment of (equity|shares|warrants|securities|ncd)/,
  },
  {
    category: "name-change",
    pattern: /change (of|in) name|name change|renamed|new name/,
  },
  {
    category: "concall",
    pattern:
      /concall|conference call|con\.\s?call|earnings call|analysts?\/?.*(meet|call)|investor.*(meet|presentation|call)|first presentation|transcript|audio recording|schedule of.*(call|conference)/,
  },
  {
    category: "jv",
    pattern:
      /joint venture|\bjv\b|collaborat|partnership|\bmou\b|memorandum of understanding|tie-?up|strategic alliance|licens(e|ing) (agreement|and commercial)/,
  },
  {
    // Acquisitions: require company/stake context so "acquires land/plot"
    // falls through to capex instead.
    category: "acquisitions",
    pattern:
      /acqui\w*.*(stake|shareholding|equity|company|limited|\bltd\b|business|unit|subsidiary|controlling)|controlling (stake|interest)|majority stake|strategic stake|stake in|purchase of.*(stake|shareholding)/,
  },
  {
    category: "capex",
    pattern:
      /capacity|expansion|commission|new plant|greenfield|brownfield|commercial production|commencement of.*(production|operations)|new (facility|unit|factory)|manufacturing (facility|plant|unit)|foray|to set up|sets up|new venture|capex|capital expenditure|inaugurat|debottleneck|acquire.*(land|plot)/,
  },
  {
    category: "order-wins",
    pattern:
      /\border\b|\bcontract\b|awarded|\bawards?\b|\bbags\b|\bwins?\b|\bwon\b|work order|letter of (award|intent)|\bloa\b|\bloi\b|purchase order|secures|receipt of order|\bppa\b|power purchase agreement|supply (agreement|contract)/,
  },
];

export function classifyAnnouncement(
  subject: string | null | undefined,
  headline: string | null | undefined
): AnnouncementCategory {
  const text = `${subject ?? ""} ${headline ?? ""}`.toLowerCase();
  if (!text.trim()) return "other";
  for (const { category, pattern } of RULES) {
    if (pattern.test(text)) return category;
  }
  return "other";
}
