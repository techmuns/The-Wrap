import { PageHeader } from "@/components/ui/PageHeader";
import { Explainer } from "@/components/ui/Explainer";
import { Stage2View } from "@/components/data/Stage2View";
import { getStage2 } from "@/lib/stage2-data";

export const metadata = {
  title: "Momentum Screen — The Wrap",
};

export default function Stage2Page() {
  const data = getStage2();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Momentum Screen"
        subtitle="Stocks in a confirmed uptrend, ranked by 1-year return."
      />
      <Explainer
        what={`A screen for stocks in a strong, confirmed uptrend${data.description ? `: ${data.description}` : "."}`}
        matters="Stocks already trending up with strong momentum tend to keep leading — this is a shortlist of where strength is concentrated, not a buy list."
        row="Each row is one stock: symbol, current price, and its 6-month and 1-year returns."
      />
      <Stage2View data={data} />
    </div>
  );
}
