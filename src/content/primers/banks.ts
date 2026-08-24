import type { Primer } from "@/types/primer";

const primer: Primer = {
  slug: "banks",
  title: "Banks",
  category: "Financials",
  dek: "How lenders make money on the gap between what they pay and what they charge — and where the risk hides.",
  readingTime: "7 min read",
  sections: [
    {
      heading: "The basic business",
      body: [
        "A bank takes deposits (paying a low rate) and lends that money out (charging a higher rate). The gap between the two is its core profit, measured as Net Interest Margin (NIM).",
        "So two things matter above all: how cheaply it can gather deposits, and how well it lends without losing money to defaults.",
      ],
    },
    {
      heading: "Deposits are the raw material",
      body: [
        "The cheapest deposits are CASA — current and savings accounts — because they pay little or no interest. A high CASA ratio means a lower cost of funds and a structural edge.",
        "Banks with strong brands, wide branch networks and good apps gather CASA more easily. That's why deposit franchise quality is prized more than loan growth alone.",
      ],
    },
    {
      heading: "Lending is where the risk lives",
      body: [
        "Loans that stop being repaid become Non-Performing Assets (NPAs). The key health metrics are gross and net NPA ratios, plus the provision coverage ratio (money set aside against bad loans).",
        "Credit cost — provisions as a share of loans — swings profits sharply. Good underwriting in the good years is what protects a bank in the bad ones.",
      ],
    },
    {
      heading: "What drives the cycle",
      body: [
        "Interest rates set by the RBI move both what banks earn on loans and pay on deposits. Rising rates can lift margins first, then raise defaults later; falling rates do the reverse.",
        "Loan growth tracks the economy — capex, housing, and consumption. Regulation (capital rules, priority-sector lending) shapes what banks can and must do.",
      ],
    },
    {
      heading: "Private vs public sector",
      body: [
        "Private banks generally grow faster, run leaner and earn higher returns on equity. Public-sector banks (PSUs) are larger in reach, often cheaper on valuation, and more tied to government priorities.",
        "Watch NIM, CASA ratio, NPA trend, credit cost and return on assets (ROA) — that handful tells most of the story.",
      ],
    },
  ],
  players: [
    { name: "HDFC Bank", note: "Largest private bank; prized deposit franchise." },
    { name: "ICICI Bank", note: "Private lender with strong retail and returns." },
    { name: "State Bank of India", note: "The largest bank; PSU leader by reach." },
    { name: "Axis Bank", note: "Large private bank, retail-focused." },
    { name: "Kotak Mahindra Bank", note: "Conservative, high-quality private bank." },
    { name: "IndusInd Bank", note: "Mid-sized private bank, vehicle & MFI lending." },
    { name: "Bank of Baroda", note: "Large public-sector bank." },
    { name: "Punjab National Bank", note: "Big PSU lender, north-India strong." },
  ],
  risks: [
    "Credit cycle — defaults rise when the economy weakens.",
    "Interest-rate swings compressing margins.",
    "Concentration in a few large or risky borrowers.",
    "Regulatory and capital-adequacy requirements.",
  ],
};

export default primer;
