import { PageHeader } from "@/components/ui/PageHeader";
import { Explainer } from "@/components/ui/Explainer";
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
      <Explainer
        what="'Concall' is short for conference call — the meeting where a company's management discusses its results and answers analysts' questions. We list recent and upcoming calls."
        matters="Calls are where management explains the story behind the numbers and hints at the outlook — often more telling than the results themselves."
        row="Each row is one company's call, with links to its transcript, notes or recording where available."
      />
      <ConcallsView data={data} />
    </div>
  );
}
