import { PageHeader } from "@/components/ui/PageHeader";
import { Explainer } from "@/components/ui/Explainer";
import { FlowsView } from "@/components/data/FlowsView";
import { getFlows } from "@/lib/flows-data";

export const metadata = {
  title: "FII/DII Flows — The Wrap",
};

export default function FiiDiiPage() {
  const data = getFlows();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="FII/DII Flows"
        subtitle="What big foreign and domestic investors bought and sold today."
      />
      <Explainer
        what="Two groups move the Indian market: FIIs (foreign investors) and DIIs (domestic institutions like mutual funds & insurers). This shows how much each bought and sold today, and the net."
        matters="They're the biggest players. Net buying supports prices; net selling pressures them — and FIIs and DIIs often pull in opposite directions."
        row="Each card shows one group: the net figure (green = net buying, red = net selling), with the bought and sold amounts below."
      />
      <FlowsView data={data} />
    </div>
  );
}
