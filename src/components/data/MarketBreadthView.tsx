import { cn } from "@/lib/cn";
import type { IndicesDataset, IndexQuote } from "@/types/indices";

function pct(n: number | null): string {
  if (n == null) return "—";
  return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
}

/** Advances / declines / unchanged as a stacked bar. */
function BreadthBar({ q }: { q: IndexQuote }) {
  const a = q.advances ?? 0;
  const d = q.declines ?? 0;
  const u = q.unchanged ?? 0;
  const total = a + d + u || 1;
  const seg = (n: number) => `${(n / total) * 100}%`;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{q.name}</span>
        <span
          className={cn(
            "font-semibold tabular-nums",
            (q.pctChange ?? 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          )}
        >
          {pct(q.pctChange)}
        </span>
      </div>
      <div className="mt-2 flex h-3 w-full overflow-hidden rounded bg-muted">
        <div className="h-full bg-emerald-500" style={{ width: seg(a) }} title={`${a} advancing`} />
        <div className="h-full bg-muted-foreground/30" style={{ width: seg(u) }} title={`${u} unchanged`} />
        <div className="h-full bg-rose-500" style={{ width: seg(d) }} title={`${d} declining`} />
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-muted-foreground tabular-nums">
        <span className="text-emerald-600 dark:text-emerald-400">{a} advancing</span>
        <span>{u} flat</span>
        <span className="text-rose-600 dark:text-rose-400">{d} declining</span>
      </div>
    </div>
  );
}

export function MarketBreadthView({ data }: { data: IndicesDataset }) {
  if (!data.broad.length && !data.sectoral.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Breadth data will appear after the first market-close update.
      </div>
    );
  }

  // Headline breadth from the widest available broad index.
  const headline =
    data.broad.find((b) => /TOTAL MARKET/i.test(b.name)) ||
    data.broad.find((b) => /NIFTY 500/i.test(b.name)) ||
    data.broad.find((b) => /NIFTY 50$/i.test(b.name)) ||
    data.broad.find((b) => (b.advances ?? 0) + (b.declines ?? 0) > 0) ||
    data.broad[0];

  const sectorsUp = data.sectoral.filter((s) => (s.pctChange ?? 0) > 0).length;
  const sectorsDown = data.sectoral.filter((s) => (s.pctChange ?? 0) < 0).length;
  const withBreadth = data.broad.filter((b) => (b.advances ?? 0) + (b.declines ?? 0) > 0);

  return (
    <div className="space-y-6">
      <div className="text-xs text-muted-foreground">
        {data.timestamp ? `As on ${data.timestamp} · ` : ""}Source: {data.source}
      </div>

      {headline && (
        <div className="rounded-xl border bg-card p-5">
          <BreadthBar q={headline} />
        </div>
      )}

      {data.sectoral.length > 0 && (
        <div className="rounded-xl border bg-card p-5 text-sm">
          <span className="font-medium">Sectors:</span>{" "}
          <span className="text-emerald-600 dark:text-emerald-400">{sectorsUp} up</span> ·{" "}
          <span className="text-rose-600 dark:text-rose-400">{sectorsDown} down</span>{" "}
          <span className="text-muted-foreground">of {data.sectoral.length}</span>
        </div>
      )}

      {withBreadth.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold tracking-tight">Breadth by index</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {withBreadth.map((b) => (
              <div key={b.name} className="rounded-xl border bg-card p-5">
                <BreadthBar q={b} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
