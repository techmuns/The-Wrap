import type { SectorEmaDataset } from "@/types/sector-ema";

/** Green (strong) / red (weak) background for a 0–100 "% above EMA" value. */
function heat(pct: number): React.CSSProperties {
  const v = pct - 50; // centre at 50
  const t = Math.min(Math.abs(v) / 50, 1);
  const alpha = (0.12 + t * 0.55).toFixed(2);
  const rgb = v >= 0 ? "34,197,94" : "239,68,68";
  return { backgroundColor: `rgba(${rgb},${alpha})` };
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function SectorEmaView({ data }: { data: SectorEmaDataset }) {
  if (!data.sectors.length) {
    return (
      <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        Sector-momentum data will appear here after the next refresh.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="bg-muted/60">
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sector
              </th>
              {data.periods.map((p) => (
                <th
                  key={p}
                  className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {p} EMA
                </th>
              ))}
              <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Stocks
              </th>
            </tr>
          </thead>
          <tbody>
            {data.sectors.map((s) => (
              <tr key={s.sector} className="border-t">
                <td className="px-3 py-2 font-medium">{s.sector}</td>
                {s.pct.map((p, i) => (
                  <td
                    key={i}
                    className="report-color tabular px-3 py-2 text-right font-medium"
                    style={heat(p)}
                  >
                    {p}%
                  </td>
                ))}
                <td className="tabular px-3 py-2 text-right text-muted-foreground">{s.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        % of {data.universe} stocks in each sector trading above their weekly EMA.
        Green = strength, red = weakness. Coverage: {data.coverage} stocks · as of{" "}
        {fmtDate(data.fetchedAt)}.
      </p>
    </div>
  );
}
