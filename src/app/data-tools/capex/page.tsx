import { PageHeader } from "@/components/ui/PageHeader";
import { Explainer } from "@/components/ui/Explainer";
import { AnnouncementsView } from "@/components/data/AnnouncementsView";
import { getAnnouncements } from "@/lib/announcements/data";

export const metadata = {
  title: "Capex & New Ventures — The Wrap",
};

export default function CapexPage() {
  const data = getAnnouncements();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Capex & New Ventures"
        subtitle="Capacity expansion and new-venture filings."
      />
      <Explainer
        what="Announcements filtered to just one type: companies expanding — new factories, plants, capacity or new business lines. ('Capex' means capital expenditure, i.e. spending to grow.)"
        matters="A company investing to expand is betting on future growth. It's an early signal of where growth may come from."
        row="Each row is one company's expansion filing, with a short summary."
      />
      <AnnouncementsView data={data} fixedCategory="capex" />
    </div>
  );
}
