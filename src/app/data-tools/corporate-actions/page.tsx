import { PageHeader } from "@/components/ui/PageHeader";
import { CorporateActionsView } from "@/components/data/CorporateActionsView";
import { getCorporateActions } from "@/lib/corporate-actions-data";

export const metadata = {
  title: "Corporate Actions — The Wrap",
};

export default function CorporateActionsPage() {
  const data = getCorporateActions();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Corporate Actions"
        subtitle="Bonus issues, buybacks, splits, rights and dividends."
      />
      <CorporateActionsView data={data} />
    </div>
  );
}
