import type { Primer } from "@/types/primer";

const primer: Primer = {
  slug: "it-services",
  title: "IT Services",
  category: "Technology",
  dek: "Selling skilled hours at scale — how India's IT giants turn people into profit.",
  readingTime: "6 min read",
  sections: [
    {
      heading: "The business, simply",
      body: [
        "Indian IT firms build and run software and technology for large global companies — banks, retailers, airlines. In essence they sell skilled engineering hours, at huge scale.",
        "Profit comes from the gap between what a client pays for a person's time and what that person costs, multiplied across hundreds of thousands of employees.",
      ],
    },
    {
      heading: "What drives revenue",
      body: [
        "Growth depends on global clients' willingness to spend on technology. When economies are strong, discretionary projects flow; when they tighten, deals shrink to essential cost-cutting work.",
        "Large multi-year deals ('total contract value') and the order book give visibility. A big share of revenue comes from the US and from banking/financial-services clients.",
      ],
    },
    {
      heading: "The economics of margins",
      body: [
        "Key levers: utilisation (how billable people are), attrition (leavers you must replace and retrain), the onsite-vs-offshore mix, and pricing.",
        "Wage inflation and a rising rupee squeeze margins; automation, offshoring and higher-value work protect them. The dollar/rupee rate directly swings reported profits.",
      ],
    },
    {
      heading: "The next wave",
      body: [
        "Each cycle has a growth theme — earlier it was digital and cloud migration; now it is AI, which is both an opportunity (new projects) and a threat (automation of routine coding).",
        "Firms that reskill fast and move up to higher-value consulting and platforms tend to defend growth better than those stuck in commodity work.",
      ],
    },
    {
      heading: "Tier-1 vs mid-caps",
      body: [
        "The tier-1 giants offer scale, stability and dividends; mid-caps can grow faster but are more volatile and client-concentrated.",
        "Watch revenue growth (in constant currency), margins, attrition, deal wins and management's demand commentary.",
      ],
    },
  ],
  players: [
    { name: "Tata Consultancy Services", note: "The largest Indian IT firm." },
    { name: "Infosys", note: "Tier-1 leader; closely watched guidance." },
    { name: "HCLTech", note: "Strong in infrastructure and products." },
    { name: "Wipro", note: "Tier-1, turnaround-focused." },
    { name: "Tech Mahindra", note: "Telecom-heavy tier-1." },
    { name: "LTIMindtree", note: "Large-cap formed by an L&T merger." },
    { name: "Persistent Systems", note: "Fast-growing mid-cap." },
    { name: "Coforge", note: "Mid-cap with strong deal momentum." },
  ],
  risks: [
    "Global slowdowns cutting client tech budgets.",
    "Currency (rupee strength) hurting reported profit.",
    "Wage inflation and high attrition.",
    "AI-driven automation of routine work.",
  ],
};

export default primer;
