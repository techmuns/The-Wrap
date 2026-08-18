import { PageHeader } from "@/components/ui/PageHeader";
import { Explainer } from "@/components/ui/Explainer";
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
      <Explainer
        what="Company insiders — founders, promoters, directors and senior management — buying or selling shares of their own company. By law, they must report these trades."
        matters="Insiders know their business best. Heavy buying can signal confidence; heavy selling can be a caution flag (though people sell for many reasons)."
        row="Each row is one trade: the company, who traded, whether they bought or sold, and the rupee value."
      />
      <InsiderTable data={data} />
    </div>
  );
}
