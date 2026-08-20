import { PageHeader } from "@/components/ui/PageHeader";
import { Explainer } from "@/components/ui/Explainer";
import { SectorRotationView } from "@/components/data/SectorRotationView";
import { getIndices } from "@/lib/indices-data";

export const metadata = {
  title: "Sector Rotation — The Wrap",
};

export default function SectorRotationPage() {
  const data = getIndices();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Sector Rotation"
        subtitle="Which sectors are leading and lagging today."
      />
      <Explainer
        what="Each of the market's sectors (banks, IT, autos, pharma…) has its own index. This ranks them by how much they moved today — strongest at the top."
        matters="Money rotates between sectors. Seeing which are strong vs weak shows where interest is flowing right now."
        row="Each row is one sector: its name, today's % move (green up / red down), and its index level."
      />
      <SectorRotationView data={data} />
    </div>
  );
}
