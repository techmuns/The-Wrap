"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCrore, formatQty } from "@/lib/format";
import type { InsiderTrade, InsiderTradesDataset, TradeSide } from "@/types/insider";

type Tab = "all" | "buy" | "sell";
type SortKey = "company" | "shares" | "value";
type SortDir = "asc" | "desc";

function compare(a: InsiderTrade, b: InsiderTrade, key: SortKey, dir: SortDir) {
  const mul = dir === "asc" ? 1 : -1;
  const av = key === "company" ? a.company : a[key];
  const bv = key === "company" ? b.company : b[key];
  if (av == null && bv == null) return 0;
  if (av == null) return 1;
  if (bv == null) return -1;
  if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * mul;
  return ((av as number) - (bv as number)) * mul;
}

function SideBadge({ side }: { side: TradeSide | null }) {
  if (!side) return <span className="text-muted-foreground">—</span>;
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
        side === "BUY" ? "text-positive" : "text-negative"
      )}
    >
      {side}
    </span>
  );
}

function Th({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = activeKey === sortKey;
  return (
    <th className={cn("px-3 py-2 font-medium", align === "right" && "text-right")}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-foreground",
          align === "right" && "flex-row-reverse",
          active && "text-foreground"
        )}
      >
        <span>{label}</span>
        {active ? (
          dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    </th>
  );
}

export function InsiderTable({ data }: { data: InsiderTradesDataset }) {
  const [tab, setTab] = useState<Tab>("all");
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const counts = useMemo(() => {
    let buy = 0;
    let sell = 0;
    for (const t of data.items) {
      if (t.buySell === "BUY") buy++;
      else if (t.buySell === "SELL") sell++;
    }
    return { all: data.items.length, buy, sell };
  }, [data]);

  const rows = useMemo(() => {
    let items = data.items;
    if (tab === "buy") items = items.filter((t) => t.buySell === "BUY");
    else if (tab === "sell") items = items.filter((t) => t.buySell === "SELL");
    return [...items].sort((a, b) => compare(a, b, sortKey, sortDir));
  }, [data, tab, sortKey, sortDir]);

  function onSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "company" ? "asc" : "desc");
    }
  }

  if (data.total === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card p-8 text-center">
        <p className="text-sm font-medium">No insider trades loaded yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Data appears here after the first successful refresh. See
          docs/DATA-CONTRACTS.md for the JSON the ingestion should write.
        </p>
      </div>
    );
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "buy", label: "Buying" },
    { key: "sell", label: "Selling" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <div>
          {data.total} trades
          {data.fetchedAt ? ` · updated ${data.fetchedAt.slice(0, 10)}` : ""}
        </div>
        {data.source && <div>Source: {data.source}</div>}
      </div>

      <div className="inline-flex rounded-lg border bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              tab === t.key
                ? "bg-accent font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
            <span className="ml-1.5 text-xs opacity-70">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <Th label="Company" sortKey="company" activeKey={sortKey} dir={sortDir} onSort={onSort} />
              <th className="px-3 py-2 font-medium">Person</th>
              <th className="px-3 py-2 font-medium">Side</th>
              <Th label="Shares" sortKey="shares" activeKey={sortKey} dir={sortDir} onSort={onSort} align="right" />
              <th className="px-3 py-2 text-right font-medium">%</th>
              <Th label="Value" sortKey="value" activeKey={sortKey} dir={sortDir} onSort={onSort} align="right" />
              <th className="px-3 py-2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t, i) => (
              <tr key={`${t.symbol}-${i}`} className="border-b last:border-0 hover:bg-accent/50">
                <td className="px-3 py-2">
                  <div className="font-medium leading-tight">{t.company ?? t.symbol ?? "—"}</div>
                  {t.symbol && <div className="text-xs text-muted-foreground">{t.symbol}</div>}
                </td>
                <td className="max-w-[220px] px-3 py-2">
                  <div className="truncate">{t.person ?? "—"}</div>
                  {t.role && <div className="text-xs text-muted-foreground">{t.role}</div>}
                </td>
                <td className="px-3 py-2"><SideBadge side={t.buySell} /></td>
                <td className="tabular px-3 py-2 text-right">{formatQty(t.shares)}</td>
                <td className="tabular px-3 py-2 text-right text-muted-foreground">
                  {t.pct == null ? "—" : `${t.pct}%`}
                </td>
                <td className="tabular px-3 py-2 text-right font-medium">{formatCrore(t.value)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{t.date ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
