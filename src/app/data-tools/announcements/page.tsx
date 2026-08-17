import { PageHeader } from "@/components/ui/PageHeader";
import { AnnouncementsView } from "@/components/data/AnnouncementsView";
import { getAnnouncements } from "@/lib/announcements/data";

export const metadata = {
  title: "Announcements — The Wrap",
};

export default function AnnouncementsPage() {
  const data = getAnnouncements();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Announcements"
        subtitle="Market-wide corporate filings, tagged by category."
      />
      <AnnouncementsView data={data} />
    </div>
  );
}
