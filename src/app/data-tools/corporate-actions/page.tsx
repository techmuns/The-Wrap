import { PageHeader } from "@/components/ui/PageHeader";
import { Explainer } from "@/components/ui/Explainer";
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
      <Explainer
        what="Actions a company takes that affect your shares directly — dividends (cash paid to shareholders), buybacks, bonus shares, stock splits and rights issues."
        matters="These put cash in your pocket or change how many shares you hold. The 'ex-date' is the cut-off — you must own the share before it to be eligible."
        row="Each row is one action: the company, the type, and the key detail (a ratio, price or date)."
      />
      <CorporateActionsView data={data} />
    </div>
  );
}
