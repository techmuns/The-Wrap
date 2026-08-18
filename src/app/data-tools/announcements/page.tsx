import { PageHeader } from "@/components/ui/PageHeader";
import { Explainer } from "@/components/ui/Explainer";
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
      <Explainer
        what="Official news companies file with the stock exchange — new factories, big orders, acquisitions, fund-raising and more. We tag every filing by type."
        matters="This is company news straight from the source, before it becomes a headline. Use the category chips to jump to just the kind you care about."
        row="Each row is one filing: the company, a plain-English summary, and its category tag."
      />
      <AnnouncementsView data={data} />
    </div>
  );
}
