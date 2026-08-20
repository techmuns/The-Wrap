import { cn } from "@/lib/cn";
import type { Stage2Dataset, Stage2Row } from "@/types/stage2";

function pctClass(n: number | null): string {
  if (n == null) return "text-muted-foreground";
  return n >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
}
function pct(n: number | null): string {
  return n == null ? "—" : `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
}
function price(n: number | null): string {
  return n == null ? "—" : `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function cap(n: number | null): string {
  return n == null ? "—" : `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })} cr`;
}

export function Stage2View({ data }: { data: Stage2Dataset }) {
  if (!data.items.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        The screen will populate after the first market-close run.
      </div>
    );
  }

  const rows: Stage2Row[] = data.items;

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">
        {data.count} stocks match · Source: {data.source}
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Stock</th>
              <th className="px-4 py-2.5 text-right font-medium">Price</th>
              <th className="px-4 py-2.5 text-right font-medium">Mkt Cap</th>
              <th className="px-4 py-2.5 text-right font-medium">1Y return</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.symbol}-${i}`} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5">
                  <div className="font-medium">{r.company ?? r.symbol}</div>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">{price(r.cmp)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{cap(r.marCap)}</td>
                <td className={cn("px-4 py-2.5 text-right font-medium tabular-nums", pctClass(r.ret1y))}>{pct(r.ret1y)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
