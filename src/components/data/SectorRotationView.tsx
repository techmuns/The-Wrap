import { cn } from "@/lib/cn";
import type { IndicesDataset, IndexQuote } from "@/types/indices";

function pct(n: number | null): string {
  if (n == null) return "—";
  return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function num(n: number | null): string {
  return n == null ? "—" : n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function SectorRotationView({ data }: { data: IndicesDataset }) {
  const rows: IndexQuote[] = [...data.sectoral].sort(
    (a, b) => (b.pctChange ?? -Infinity) - (a.pctChange ?? -Infinity)
  );

  if (!rows.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Sector data will appear after the first market-close update.
      </div>
    );
  }

  const max = Math.max(...rows.map((r) => Math.abs(r.pctChange ?? 0)), 0.01);

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">
        {data.timestamp ? `As on ${data.timestamp} · ` : ""}Source: {data.source}. Sectoral indices, strongest first.
      </div>
      <ul className="space-y-1.5">
        {rows.map((r) => {
          const p = r.pctChange ?? 0;
          const up = p >= 0;
          const w = Math.min(100, (Math.abs(p) / max) * 100);
          return (
            <li key={r.name} className="grid grid-cols-[1fr_5rem] items-center gap-3 rounded-md border px-3 py-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{r.name}</div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded bg-muted">
                  <div
                    className={cn("h-full rounded", up ? "bg-emerald-500" : "bg-rose-500")}
                    style={{ width: `${w}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <div
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  )}
                >
                  {pct(r.pctChange)}
                </div>
                <div className="text-[11px] tabular-nums text-muted-foreground">{num(r.last)}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
