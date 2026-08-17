"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCrore, formatPrice, formatQty } from "@/lib/format";
import type {
  Deal,
  DealCategory,
  DealSide,
  DealsDataset,
} from "@/types/deals";

type SortKey = "name" | "qty" | "watp" | "value";
type SortDir = "asc" | "desc";

const TABS: { key: DealCategory; label: string }[] = [
  { key: "bulk", label: "Bulk" },
  { key: "block", label: "Block" },
  { key: "short", label: "Short" },
];

function compare(a: Deal, b: Deal, key: SortKey, dir: SortDir): number {
  const mul = dir === "asc" ? 1 : -1;
  const av = a[key];
  const bv = b[key];
  if (av == null && bv == null) return 0;
  if (av == null) return 1; // nulls always sort last
  if (bv == null) return -1;
  if (typeof av === "string" && typeof bv === "string") {
    return av.localeCompare(bv) * mul;
  }
  return ((av as number) - (bv as number)) * mul;
}

function SideBadge({ side }: { side: DealSide | null }) {
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

function SortableTh({
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
    <th
      className={cn("px-3 py-2 font-medium", align === "right" && "text-right")}
    >
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
          dir === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    </th>
  );
}

export function DealsTable({ data }: { data: DealsDataset }) {
  const [tab, setTab] = useState<DealCategory>("bulk");
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(
    () => [...data[tab]].sort((a, b) => compare(a, b, sortKey, sortDir)),
    [data, tab, sortKey, sortDir]
  );

  function onSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  const totalRecords =
    data.counts.bulk + data.counts.block + data.counts.short;

  if (totalRecords === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card p-8 text-center">
        <p className="text-sm font-medium">No deals loaded yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Data appears here after the first successful refresh from NSE. The
          scheduled job fetches bulk, block and short deals and writes them to
          the site.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <div>
          {data.asOnDate ? (
            <>
              As on{" "}
              <span className="font-medium text-foreground">
                {data.asOnDate}
              </span>
            </>
          ) : (
            "Latest snapshot"
          )}
        </div>
        <div>Source: NSE</div>
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
            <span className="ml-1.5 text-xs opacity-70">
              {data.counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <SortableTh
                label="Company"
                sortKey="name"
                activeKey={sortKey}
                dir={sortDir}
                onSort={onSort}
              />
              <th className="px-3 py-2 font-medium">Client</th>
              <th className="px-3 py-2 font-medium">Side</th>
              <SortableTh
                label="Qty"
                sortKey="qty"
                activeKey={sortKey}
                dir={sortDir}
                onSort={onSort}
                align="right"
              />
              <SortableTh
                label="Price"
                sortKey="watp"
                activeKey={sortKey}
                dir={sortDir}
                onSort={onSort}
                align="right"
              />
              <SortableTh
                label="Value"
                sortKey="value"
                activeKey={sortKey}
                dir={sortDir}
                onSort={onSort}
                align="right"
              />
              <th className="px-3 py-2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d, i) => (
              <tr
                key={`${d.symbol}-${d.clientName}-${i}`}
                className="border-b last:border-0 hover:bg-accent/50"
              >
                <td className="px-3 py-2">
                  <div className="font-medium leading-tight">
                    {d.name ?? d.symbol ?? "—"}
                  </div>
                  {d.symbol && (
                    <div className="text-xs text-muted-foreground">
                      {d.symbol}
                    </div>
                  )}
                </td>
                <td className="max-w-[260px] px-3 py-2 text-muted-foreground">
                  {d.clientName ?? "—"}
                </td>
                <td className="px-3 py-2">
                  <SideBadge side={d.buySell} />
                </td>
                <td className="tabular px-3 py-2 text-right">
                  {formatQty(d.qty)}
                </td>
                <td className="tabular px-3 py-2 text-right">
                  {formatPrice(d.watp)}
                </td>
                <td className="tabular px-3 py-2 text-right font-medium">
                  {formatCrore(d.value)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                  {d.date ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Deal value = quantity × weighted-average trade price. Short-deal records
        may omit client, side and price as reported by NSE.
      </p>
    </div>
  );
}
