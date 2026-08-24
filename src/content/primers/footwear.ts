import type { Primer } from "@/types/primer";

const primer: Primer = {
  slug: "footwear",
  title: "Footwear",
  category: "Consumer",
  dek: "A huge, largely unbranded market slowly formalising — where the money sits between factory and shelf.",
  readingTime: "6 min read",
  sections: [
    {
      heading: "The market",
      body: [
        "India is one of the world's largest footwear markets by volume, but most of it is still unbranded and informal. The investable story is the steady shift from unorganised to organised, and from mass to premium.",
        "Roughly, the market splits into open (chappals/sandals), closed (shoes), and sports/athleisure — the last growing fastest as lifestyles change.",
      ],
    },
    {
      heading: "The value chain",
      body: [
        "Inputs range from leather to rubber and EVA/PU foam. Products are made in-house or (increasingly) by contract manufacturers, then sold through own stores, multi-brand outlets, distributors and online.",
        "The economics differ sharply by stage: brands and retailers capture the fat margins; pure manufacturers earn thinner, more cyclical ones.",
      ],
    },
    {
      heading: "The economics",
      body: [
        "For branded players, gross margins can be high, but rent, staff and advertising eat into it — so store productivity (sales per square foot) and inventory turns matter a lot.",
        "For manufacturers, the game is scale, utilisation and input-cost management (rubber, EVA, leather). Currency matters for exporters.",
      ],
    },
    {
      heading: "What's driving change",
      body: [
        "Premiumisation (consumers trading up), the rise of athleisure, and formalisation — GST plus Quality Control Orders (QCO) that set mandatory standards — are all nudging demand toward organised, compliant players.",
        "It remains a discretionary category, so demand softens when household budgets are squeezed.",
      ],
    },
    {
      heading: "Competitive structure",
      body: [
        "The listed space spans mass-market brands, premium/retail-led brands, and contract manufacturers/exporters. Distribution reach and brand strength are the durable moats.",
        "Watch store-expansion plans, same-store sales growth, and gross-margin trends as input costs move.",
      ],
    },
  ],
  players: [
    { name: "Bata India", note: "The best-known mass-to-mid brand with wide reach." },
    { name: "Relaxo Footwears", note: "Leader in value/mass slippers and shoes." },
    { name: "Metro Brands", note: "Premium, retail-led multi-brand model." },
    { name: "Campus Activewear", note: "Focused on the fast-growing sports/athleisure segment." },
    { name: "Mirza International", note: "Redtape brand plus leather exports." },
    { name: "Khadim India", note: "Value-focused, east-India strong." },
  ],
  risks: [
    "Input-cost swings (rubber, EVA, leather).",
    "Discretionary demand sensitive to the consumer cycle.",
    "Competition from imports and unorganised players.",
    "Execution risk in store expansion.",
  ],
};

export default primer;
