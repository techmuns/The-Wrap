import { PageHeader } from "@/components/ui/PageHeader";
import { ConcallsView } from "@/components/data/ConcallsView";
import { getConcalls } from "@/lib/concalls-data";

export const metadata = {
  title: "Concalls — The Wrap",
};

export default function ConcallsPage() {
  const data = getConcalls();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Concalls"
        subtitle="Recent and upcoming earnings / investor conference calls."
      />
      <ConcallsView data={data} />
    </div>
  );
}
