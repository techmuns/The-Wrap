import { PageHeader } from "@/components/ui/PageHeader";
import { Explainer } from "@/components/ui/Explainer";
import { MarketBreadthView } from "@/components/data/MarketBreadthView";
import { getIndices } from "@/lib/indices-data";

export const metadata = {
  title: "Market Breadth — The Wrap",
};

export default function MarketBreadthPage() {
  const data = getIndices();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Market Breadth"
        subtitle="How many stocks are rising vs falling beneath the index."
      />
      <Explainer
        what="An index can rise while most of its stocks fall (a few big names carry it). Breadth counts how many stocks in an index went up vs down today."
        matters="Strong breadth (many stocks up) is a healthy, broad rally. Weak breadth (index up but most stocks down) warns the move is narrow and fragile."
        row="Each bar shows one index: green = stocks advancing, red = declining. More green is healthier."
      />
      <MarketBreadthView data={data} />
    </div>
  );
}
