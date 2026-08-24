import type { Primer } from "@/types/primer";

const primer: Primer = {
  slug: "cement",
  title: "Cement",
  category: "Materials",
  dek: "A commodity that can't travel far — why cement is a regional, cyclical business.",
  readingTime: "6 min read",
  sections: [
    {
      heading: "What it is, and why it's regional",
      body: [
        "Cement is the binder in concrete — the single most-used building material on earth. It is cheap per tonne but heavy, so it doesn't pay to transport it far: beyond roughly 300 km by road, freight can cost more than the product itself.",
        "That simple fact shapes the whole industry. Cement is really a collection of regional markets, and a company's fortunes depend on the supply-demand balance and pricing in the specific regions where its plants sit.",
      ],
    },
    {
      heading: "How it's made",
      body: [
        "Limestone is quarried and heated with clay in a kiln at ~1,450°C to form 'clinker'. Clinker is then ground with gypsum (and often fly ash or slag) into the grey powder sold as cement.",
        "The kiln step is energy-hungry, so power and fuel (coal, pet-coke) are the biggest variable costs. Blending in fly ash or slag lowers cost and clinker use, which is why 'blended' cement dominates in India.",
      ],
    },
    {
      heading: "The economics",
      body: [
        "The three levers are realisation (price per tonne/bag), cost per tonne (fuel, power, freight), and capacity utilisation. Because plants are capital-heavy, running them full is what drives profitability.",
        "When demand is strong and regional utilisation is high, prices firm up and margins expand quickly. When new capacity floods a region, price wars can crush margins even if volumes grow.",
      ],
    },
    {
      heading: "What drives demand",
      body: [
        "Housing (individual and affordable) is the largest end-use, followed by infrastructure (roads, metros, airports) and commercial/industrial building. Government capex and rural housing schemes are big swing factors.",
        "Demand is seasonal — it slows during the monsoon — and closely tracks the broader construction and real-estate cycle.",
      ],
    },
    {
      heading: "Competitive structure",
      body: [
        "India's industry has been consolidating: the largest players keep acquiring smaller regional ones to gain scale and pricing discipline. Scale brings cost advantages in fuel procurement, logistics and captive power.",
        "Watch for capacity-addition announcements across a region — they signal whether pricing will hold or come under pressure over the next couple of years.",
      ],
    },
  ],
  players: [
    { name: "UltraTech Cement", note: "The clear market leader by capacity." },
    { name: "Ambuja Cements / ACC", note: "Adani-owned; the second-largest group." },
    { name: "Shree Cement", note: "Known for low-cost operations, north-focused." },
    { name: "Dalmia Bharat", note: "Strong in the south and east." },
    { name: "JK Cement", note: "Grey plus a leading white-cement/putty franchise." },
    { name: "Ramco Cements", note: "South-India focused." },
    { name: "Nuvoco Vistas", note: "East-India focused." },
  ],
  risks: [
    "Fuel and power cost spikes (coal / pet-coke).",
    "Regional overcapacity triggering price wars.",
    "Slow housing or infrastructure spending.",
    "Monsoon-driven seasonal weakness.",
  ],
};

export default primer;
