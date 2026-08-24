import type { Primer } from "@/types/primer";

const primer: Primer = {
  slug: "pharma",
  title: "Pharmaceuticals",
  category: "Pharma",
  dek: "Generics, branded medicines and the factories behind them — where India's pharma value sits.",
  readingTime: "7 min read",
  sections: [
    {
      heading: "India, the world's pharmacy",
      body: [
        "India is one of the largest suppliers of generic medicines globally — copies of drugs whose patents have expired, sold far cheaper than the originals.",
        "The listed companies play across several very different games: US generics, the Indian branded market, active ingredients (APIs), and contract manufacturing (CDMO).",
      ],
    },
    {
      heading: "The main business lines",
      body: [
        "US generics: large volumes, but prices erode over time as competitors pile in; the prize is 'complex' or hard-to-make generics that face less competition.",
        "Domestic branded formulations: doctors prescribe by brand, so these earn steadier, higher margins. APIs are the chemical building blocks; CDMO means making drugs for other companies under contract.",
      ],
    },
    {
      heading: "The economics",
      body: [
        "In US generics, profitability depends on the product mix (complex vs plain), price erosion, and manufacturing cost. A single big approval can move earnings.",
        "In the domestic market, brand strength, the sales force and new launches drive growth. R&D spend and regulatory approvals (like US FDA clearances) are the long-term engine and the main risk.",
      ],
    },
    {
      heading: "Regulation is everything",
      body: [
        "Plants that export to the US must pass FDA inspections. An adverse finding (a 'warning letter' or import alert) can halt sales from that site — a major, sudden risk.",
        "Pricing controls in India (the NLEM list) cap prices on essential medicines, and currency moves matter because exports are dollar-earning.",
      ],
    },
    {
      heading: "Competitive structure",
      body: [
        "The set spans diversified global generic majors, domestic-branded specialists, API makers and emerging CDMO players. Where a company earns its money determines how cyclical and how regulated it is.",
        "Watch US approval pipelines, plant inspection status, domestic growth and the shift toward complex/speciality products.",
      ],
    },
  ],
  players: [
    { name: "Sun Pharmaceutical", note: "India's largest drugmaker; growing speciality arm." },
    { name: "Dr. Reddy's Laboratories", note: "Generics major, strong in the US." },
    { name: "Cipla", note: "Balanced India + US; respiratory strength." },
    { name: "Divi's Laboratories", note: "Leading API / custom-synthesis maker." },
    { name: "Lupin", note: "Generics with a growing complex portfolio." },
    { name: "Aurobindo Pharma", note: "High-volume US generics and APIs." },
    { name: "Mankind Pharma", note: "Domestic-branded, mass-market focus." },
    { name: "Torrent Pharmaceuticals", note: "Branded-heavy, India and emerging markets." },
  ],
  risks: [
    "Regulatory/FDA plant inspection outcomes.",
    "US price erosion as competition rises.",
    "R&D and approval-pipeline execution.",
    "Domestic price controls and currency swings.",
  ],
};

export default primer;
