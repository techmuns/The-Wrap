import { PageHeader } from "@/components/ui/PageHeader";
import { Explainer } from "@/components/ui/Explainer";
import { AnnouncementsView } from "@/components/data/AnnouncementsView";
import { getAnnouncements } from "@/lib/announcements/data";

export const metadata = {
  title: "Acquisitions — The Wrap",
};

export default function AcquisitionsPage() {
  const data = getAnnouncements();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Acquisitions"
        subtitle="Mergers, acquisitions and stake purchases."
      />
      <Explainer
        what="Announcements filtered to just one type: one company buying another, or buying a meaningful stake in it (mergers and acquisitions)."
        matters="Acquisitions reshape a company — adding new business or scale, but sometimes new debt. They can be a big deal for its future."
        row="Each row is one deal: who is buying what, and for how much."
      />
      <AnnouncementsView data={data} fixedCategory="acquisitions" />
    </div>
  );
}
