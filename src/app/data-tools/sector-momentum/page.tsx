import { PageHeader } from "@/components/ui/PageHeader";
import { Explainer } from "@/components/ui/Explainer";
import { SectorEmaView } from "@/components/data/SectorEmaView";
import { sectorEma } from "@/lib/sector-ema-data";

export const metadata = {
  title: "Sector Momentum — The Wrap",
};

export default function SectorMomentumPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Sector Momentum"
        icon="🔥"
        subtitle="How much of each sector is trending up — across timeframes."
      />

      <Explainer
        what="For each sector, the share of Nifty 500 stocks trading above their 4, 20, 30, 40 and 52-week moving average (EMA). Green = most stocks are in an uptrend; red = most are below."
        matters="It shows where momentum is strong or fading across the market, from the short term (4W) to the long term (52W) — the classic sector-rotation read the pros use."
        row="Each cell is the % of that sector's stocks above the given weekly EMA."
      />

      <SectorEmaView data={sectorEma} />
    </div>
  );
}
