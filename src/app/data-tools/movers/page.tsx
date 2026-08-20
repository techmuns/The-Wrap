import { PageHeader } from "@/components/ui/PageHeader";
import { Explainer } from "@/components/ui/Explainer";
import { MoversView } from "@/components/data/MoversView";
import { getMovers } from "@/lib/movers-data";

export const metadata = {
  title: "Highs, Lows & Volume — The Wrap",
};

export default function MoversPage() {
  const data = getMovers();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Highs, Lows & Volume"
        subtitle="Stocks at new highs or lows, and where volume is spiking."
      />
      <Explainer
        what="Three momentum signals: stocks hitting a new 52-week (one-year) high, stocks hitting a new 52-week low, and 'volume gainers' — stocks trading far more than their usual volume today."
        matters="New highs show strength and new lows show weakness. A big jump in volume means unusual interest — often the first sign something is happening in a stock."
        row="Each row is one stock: its symbol, latest price, today's move, and (for volume) how many times its normal volume it traded."
      />
      <MoversView data={data} />
    </div>
  );
}
