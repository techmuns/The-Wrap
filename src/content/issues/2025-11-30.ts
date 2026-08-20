import type { Issue } from "@/types/issue";

const issue: Issue = {
  slug: "2025-11-30",
  date: "30 Nov 2025",
  isoDate: "2025-11-30",
  title: "A tale of two markets",
  dek: "Nifty 50 prints a fresh all-time high while the broader market keeps sliding.",
  readingTime: "7 min read",
  sections: [
    {
      id: "summary",
      title: "The week in one line",
      body: [
        "The headline index and the market underneath it are telling opposite stories. Nifty 50 made a new all-time high this week even as the broader market continued to weaken — a narrow advance carried by a handful of heavyweights while breadth erodes beneath the surface.",
        "The macro backdrop is genuinely strong: India's Q2 GDP surprised to the upside at 8.2%, the fastest pace in several quarters, helped by resilient consumption and front-loaded exports. Attention now turns to the RBI, with the market pricing in a long-awaited rate cut that would be a tailwind for an already-firming BFSI sector.",
      ],
    },
    {
      id: "breadth",
      title: "Market breadth",
      body: [
        "Breadth continues to deteriorate. The share of stocks above their 40-week EMA sits in the low 40s for small- and mid-caps versus around 60 for large-caps — the classic signature of a top-heavy market. New 52-week lows are outpacing new highs.",
        "The message is a market that grinds sideways with a bearish bias until earnings growth resumes. Opportunities are narrow and the margin for error is thin: a bottoms-up stock-picker's market, unkind to short time horizons.",
      ],
    },
    {
      id: "sectors",
      title: "Sector rotation",
      body: [
        "On relative strength versus the Nifty 500, leadership stays concentrated. Exchanges, cement, defence and select financials look established or gaining, while pockets like jewellery, tyres and power are losing steam.",
      ],
      note: "A full Sector Rotation tool is planned under Data Tools.",
    },
    {
      id: "insider",
      title: "Insider trades",
      body: [
        "Promoter activity was two-sided — meaningful open-market selling in a few large names set against selective promoter buying elsewhere.",
      ],
      note: "The full week's insider and promoter trades will live in the Buying & Selling tracker.",
      link: { href: "/data-tools/insider-trades", label: "Buying & Selling" },
    },
    {
      id: "deals",
      title: "Bulk & block deals",
      body: [
        "A heavy week for block deals, including large institutional prints in healthcare and consumer-tech names.",
      ],
      note: "Live bulk, block and short deals are now tracked here.",
      link: { href: "/data-tools/bulk-block-deals", label: "Bulk & Block Deals" },
    },
    {
      id: "announcements",
      title: "Noteworthy announcements",
      body: ["Our pick of the week's more consequential filings — not exhaustive:"],
      groups: [
        {
          heading: "Capex & new ventures",
          items: [
            { text: "Vikram Solar commissioned a new 5 GW solar-module manufacturing facility.", starred: true },
            { text: "Solex Energy began commercial production at a 2.2 GW module plant." },
          ],
        },
        {
          heading: "Order wins",
          items: [
            { text: "Dilip Buildcon and NCC won large infrastructure orders." },
            { text: "ACME Solar signed a battery-storage PPA with SECI.", starred: true },
          ],
        },
        {
          heading: "Acquisitions & regulatory",
          items: [
            { text: "The Leela group acquired a UAE hotel; Pidilite took a strategic stake in MagicDecor.", starred: true },
            { text: "Dr Reddy's received European approval for a new biosimilar.", starred: true },
          ],
        },
      ],
      note: "Once our unified announcements pipeline is live, every one of these categories becomes a filtered view over a single dataset.",
    },
  ],
};

export default issue;
