import { cn } from "@/lib/cn";
import type { FlowsDataset, FlowRow } from "@/types/flows";

/** ₹ crore (values already come from NSE in crore). */
function cr(n: number | null): string {
  if (n == null) return "—";
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} cr`;
}

function FlowCard({ title, subtitle, row }: { title: string; subtitle: string; row: FlowRow | null }) {
  const net = row?.net ?? null;
  const positive = (net ?? 0) >= 0;
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>
      <div
        className={cn(
          "mt-3 text-2xl font-semibold tabular-nums",
          net == null ? "text-foreground" : positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
        )}
      >
        {net == null ? "—" : `${positive ? "+" : ""}${cr(net)}`}
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">
        {net == null ? "No data" : positive ? "Net buying" : "Net selling"}
      </div>
      <dl className="mt-4 space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Bought</dt>
          <dd className="tabular-nums">{cr(row?.buy ?? null)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Sold</dt>
          <dd className="tabular-nums">{cr(row?.sell ?? null)}</dd>
        </div>
      </dl>
    </div>
  );
}

export function FlowsView({ data }: { data: FlowsDataset }) {
  if (!data.fii && !data.dii) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        FII/DII flow data will appear after the first post-market update.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">
        {data.date ? `For ${data.date} · ` : ""}Source: {data.source}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FlowCard title="FII / FPI" subtitle="Foreign investors" row={data.fii} />
        <FlowCard title="DII" subtitle="Domestic institutions" row={data.dii} />
      </div>
    </div>
  );
}
