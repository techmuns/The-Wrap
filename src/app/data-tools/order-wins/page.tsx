import { PageHeader } from "@/components/ui/PageHeader";
import { Explainer } from "@/components/ui/Explainer";
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
      <Explainer
        what="Announcements filtered to just one type: companies that have won new orders or contracts."
        matters="New orders are future revenue. A large win — especially versus a company's size — can point to growth ahead."
        row="Each row is one order-win filing, usually with the company and the order value."
      />
      <AnnouncementsView data={data} fixedCategory="order-wins" />
    </div>
  );
}
