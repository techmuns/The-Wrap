import type { Issue } from "@/types/issue";

const issue: Issue = {
  slug: "2024-11-17",
  date: "17 Nov 2024",
  isoDate: "2024-11-17",
  title: "The correction arrives",
  dek: "Every major index closes below its 40-week EMA for the first time this bull cycle.",
  readingTime: "6 min read",
  sections: [
    {
      id: "summary",
      title: "The week in one line",
      body: [
        "For the first time since this bull market began in early 2023, India's major indices — Nifty 50, Nifty 500, Midcap 100 and Smallcap 100 — all ended the week below their 40-week exponential moving averages. That line had acted as a floor on every dip for eighteen months. This week it gave way.",
        "The proximate cause is earnings. Of the roughly 3,800 companies that had reported by the weekend, close to 42% posted negative earnings growth, and average operating-profit growth was a thin ~2.8%. A soft quarter, stretched valuations and a rally long in the tooth are a combination the market is now repricing.",
      ],
    },
    {
      id: "breadth",
      title: "Market breadth",
      body: [
        "Breadth has been thinning for weeks and is now clearly negative: only about 45% of stocks trade above their own 40-week EMA. The count of stocks closing down 3% or more on a given day has been rising, and those days are clustering more tightly than at any point in the last eighteen months. More big-down days is the market's way of telling you volatility is up and the trend is weakening.",
      ],
      note: "A Market Breadth tool (sector × EMA heatmap) is on the roadmap under Data Tools.",
    },
    {
      id: "outlook",
      title: "Outlook & action plan",
      body: [
        "We don't expect a disorderly crash so much as a grinding, volatile consolidation while earnings catch up to prices. Broad-based momentum will take its own time to return.",
        "That makes this a stock-picker's tape. The work now is unglamorous: build a watchlist of names showing genuine relative strength, understand their triggers, and set alerts for your buy zones. Most people wait until the market has already turned to start looking — the edge is in doing the homework during the drawdown.",
      ],
    },
    {
      id: "insider",
      title: "Insider trades",
      body: [
        "A quiet week for promoter activity, with a handful of preferential-allotment stake increases outweighing modest open-market selling.",
      ],
      note: "The full week's insider and promoter trades will live in the Buying & Selling tracker.",
      link: { href: "/data-tools/insider-trades", label: "Buying & Selling" },
    },
    {
      id: "deals",
      title: "Bulk & block deals",
      body: [
        "Institutional churn was moderate, with a few large blocks changing hands between funds.",
      ],
      note: "Live bulk, block and short deals are now tracked here.",
      link: { href: "/data-tools/bulk-block-deals", label: "Bulk & Block Deals" },
    },
    {
      id: "announcements",
      title: "Noteworthy announcements",
      body: ["A selection of the week's more consequential filings — our pick, not exhaustive:"],
      groups: [
        {
          heading: "New ventures & capacity",
          items: [
            { text: "L&T won a large NTPC contract to build thermal power capacity.", starred: true },
            { text: "ITI bagged a sizeable BharatNet order." },
          ],
        },
        {
          heading: "Deals & partnerships",
          items: [
            { text: "Reliance and Disney formed a joint venture to launch JioHotstar in India.", starred: true },
          ],
        },
        {
          heading: "New listings",
          items: [
            { text: "Swiggy, Sagility, Niva Bupa and ACME Solar debuted on the exchanges." },
          ],
        },
      ],
      note: "Once our unified announcements pipeline is live, these will be sliced by category — capex, order wins, acquisitions and more.",
    },
  ],
};

export default issue;
