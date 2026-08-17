import { PageHeader } from "@/components/ui/PageHeader";
import { InsiderTable } from "@/components/data/InsiderTable";
import { getInsiderTrades } from "@/lib/insider-data";

export const metadata = {
  title: "Buying & Selling — The Wrap",
};

export default function InsiderTradesPage() {
  const data = getInsiderTrades();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Buying & Selling"
        subtitle="Promoter & insider trades reported this week, ranked by value."
      />
      <InsiderTable data={data} />
    </div>
  );
}
