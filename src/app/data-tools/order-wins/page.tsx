import { PageHeader } from "@/components/ui/PageHeader";
import { AnnouncementsView } from "@/components/data/AnnouncementsView";
import { getAnnouncements } from "@/lib/announcements/data";

export const metadata = {
  title: "Order Wins — The Wrap",
};

export default function OrderWinsPage() {
  const data = getAnnouncements();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Order Wins"
        subtitle="New orders and contract wins disclosed to the exchanges."
      />
      <AnnouncementsView data={data} fixedCategory="order-wins" />
    </div>
  );
}
