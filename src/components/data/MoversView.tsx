"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { MoversDataset, MoverRow, VolumeRow } from "@/types/movers";

type Tab = "highs" | "lows" | "volume";

function pctClass(n: number | null): string {
  if (n == null) return "text-muted-foreground";
  return n >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
}
function pct(n: number | null): string {
  if (n == null) return "—";
  return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
}
function price(n: number | null): string {
  return n == null ? "—" : `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function qty(n: number | null): string {
  return n == null ? "—" : n.toLocaleString("en-IN");
}

export function MoversView({ data }: { data: MoversDataset }) {
  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "highs", label: "52-Week Highs", count: data.highs.length },
    { key: "lows", label: "52-Week Lows", count: data.lows.length },
    { key: "volume", label: "Volume Gainers", count: data.volume.length },
  ];
  const [tab, setTab] = useState<Tab>("highs");

  if (!data.highs.length && !data.lows.length && !data.volume.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Momentum data will appear after the first market-close update.
      </div>
    );
  }

  const rows: (MoverRow | VolumeRow)[] = data[tab];
  const showVol = tab === "volume";

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">
        {data.timestamp ? `As on ${data.timestamp} · ` : ""}Source: {data.source}
      </div>

      <div className="inline-flex flex-wrap gap-1 rounded-lg border bg-muted/40 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              tab === t.key ? "bg-background font-medium text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label} <span className="tabular-nums opacity-70">{t.count}</span>
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          None today.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Stock</th>
                <th className="px-4 py-2.5 text-right font-medium">Last</th>
                <th className="px-4 py-2.5 text-right font-medium">Change</th>
                {showVol && <th className="px-4 py-2.5 text-right font-medium">Volume</th>}
                {showVol && <th className="px-4 py-2.5 text-right font-medium">× avg</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.symbol}-${i}`} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{r.symbol}</div>
                    {r.company && <div className="text-xs text-muted-foreground">{r.company}</div>}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{price(r.last)}</td>
                  <td className={cn("px-4 py-2.5 text-right font-medium tabular-nums", pctClass(r.pctChange))}>
                    {pct(r.pctChange)}
                  </td>
                  {showVol && <td className="px-4 py-2.5 text-right tabular-nums">{qty((r as VolumeRow).volume)}</td>}
                  {showVol && (
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {(r as VolumeRow).timesAvg == null ? "—" : `${(r as VolumeRow).timesAvg!.toFixed(1)}×`}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
