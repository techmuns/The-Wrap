import { PageHeader } from "@/components/ui/PageHeader";
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
      <AnnouncementsView data={data} fixedCategory="acquisitions" />
    </div>
  );
}
