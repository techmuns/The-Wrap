import type { Primer } from "@/types/primer";

const primer: Primer = {
  slug: "solar-energy",
  title: "Solar & Renewable Energy",
  category: "Energy",
  dek: "From polysilicon to power plants — where value sits in India's solar build-out.",
  readingTime: "7 min read",
  sections: [
    {
      heading: "Why solar is booming",
      body: [
        "Solar module costs have fallen dramatically over the past decade, making solar the cheapest source of new electricity in many places. Combined with ambitious national renewable-energy targets, that has set off a large capacity build-out in India.",
        "The opportunity spans two very different businesses: making the equipment (manufacturing) and owning the power plants (generation).",
      ],
    },
    {
      heading: "The value chain",
      body: [
        "Upstream to downstream: polysilicon → ingots/wafers → cells → modules → engineering & construction (EPC) → independent power producers (IPPs) who own and operate plants. Solar glass and inverters are key components alongside.",
        "India has historically imported cells and wafers (largely from China) while assembling modules domestically — so where a company sits in the chain determines how exposed it is to import competition and policy.",
      ],
    },
    {
      heading: "The economics",
      body: [
        "For manufacturers, profitability swings with global module/cell prices and utilisation. Backward integration (making cells, not just modules) improves margins and qualifies for local-content rules.",
        "For IPPs, returns come from long-term power-purchase agreements (PPAs): stable, annuity-like cash flows, but sensitive to tariffs won in auctions, plant load factor (how much sun/output), and the cost of capital.",
      ],
    },
    {
      heading: "Policy is the swing factor",
      body: [
        "Government levers dominate this sector: production-linked incentives (PLI) for manufacturing, the Approved List of Models & Manufacturers (ALMM), and import duties (like the basic customs duty on cells/modules) that protect domestic makers.",
        "Because so much depends on policy and auctions, a rule change can reshape economics quickly — a key risk to weigh.",
      ],
    },
    {
      heading: "Competitive structure",
      body: [
        "The listed set divides into manufacturers (modules/cells, glass), and developers/IPPs that own generation. A few utilities and conglomerates play across both.",
        "Watch order books and capacity plans for manufacturers, and auction wins, executed capacity and PPA tariffs for developers.",
      ],
    },
  ],
  players: [
    { name: "Waaree Energies", note: "One of India's largest solar-module makers." },
    { name: "Premier Energies", note: "Integrated cell-and-module manufacturer." },
    { name: "Adani Green Energy", note: "Large renewable IPP (generation)." },
    { name: "Tata Power", note: "Utility with a growing renewables + solar EPC arm." },
    { name: "NTPC Green Energy", note: "The renewables arm of NTPC." },
    { name: "JSW Energy", note: "Utility scaling up renewable capacity." },
    { name: "Borosil Renewables", note: "Leading domestic solar-glass maker." },
    { name: "KPI Green Energy", note: "Smaller developer/EPC player." },
  ],
  risks: [
    "Heavy dependence on policy, duties and auction outcomes.",
    "Global module/cell price volatility.",
    "Execution, land and grid-connectivity delays.",
    "Financing cost — IPPs are capital-intensive.",
  ],
};

export default primer;
