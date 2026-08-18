import { PageHeader } from "@/components/ui/PageHeader";
import { Explainer } from "@/components/ui/Explainer";
import { DealsTable } from "@/components/data/DealsTable";
import { getBulkBlockDeals } from "@/lib/deals-data";

export const metadata = {
  title: "Bulk & Block Deals — The Wrap",
};

export default function BulkBlockDealsPage() {
  const data = getBulkBlockDeals();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Bulk & Block Deals"
        subtitle="Large bulk, block & short deals on the exchange."
      />
      <Explainer
        what="Unusually large share trades that the stock exchange (NSE) discloses the same day. 'Bulk' and 'block' deals are big transactions by large investors like funds and wealthy individuals."
        matters="It shows where big money is moving — which stocks large investors are buying into or getting out of."
        row="Each row is one large deal: the stock, who traded, whether they bought or sold, and the total value."
      />
      <DealsTable data={data} />
    </div>
  );
}
