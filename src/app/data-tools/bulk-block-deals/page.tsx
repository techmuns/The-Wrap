import { PageHeader } from "@/components/ui/PageHeader";
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
      <DealsTable data={data} />
    </div>
  );
}
