"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import {
  ACTION_LABELS,
  type ActionType,
  type CorporateActionsDataset,
} from "@/types/corporate-actions";

const ORDER: ActionType[] = ["bonus", "buyback", "split", "rights", "dividend"];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? "border-foreground/30 bg-accent font-medium text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function CorporateActionsView({ data }: { data: CorporateActionsDataset }) {
  const [type, setType] = useState<ActionType | "all">("all");
  const rows = useMemo(
    () => (type === "all" ? data.items : data.items.filter((i) => i.type === type)),
    [data, type]
  );

  if (data.total === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card p-8 text-center">
        <p className="text-sm font-medium">No corporate actions loaded yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Data appears after the first successful refresh from Screener.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <div>
          {data.total} actions
          {data.fetchedAt ? ` · updated ${data.fetchedAt.slice(0, 10)}` : ""}
        </div>
        <div>Source: Screener</div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Chip active={type === "all"} onClick={() => setType("all")}>
          All <span className="opacity-70">{data.total}</span>
        </Chip>
        {ORDER.filter((t) => (data.byType[t] ?? 0) > 0).map((t) => (
          <Chip key={t} active={type === t} onClick={() => setType(t)}>
            {ACTION_LABELS[t]} <span className="opacity-70">{data.byType[t]}</span>
          </Chip>
        ))}
      </div>

      <ul className="divide-y rounded-lg border">
        {rows.map((a, i) => (
          <li
            key={`${a.symbol}-${i}`}
            className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="sm:w-56 sm:shrink-0">
              <div className="font-medium leading-tight">{a.company ?? a.symbol ?? "—"}</div>
              {a.symbol && <div className="text-xs text-muted-foreground">{a.symbol}</div>}
            </div>
            <div className="min-w-0 flex-1">
              <span className="mr-2 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                {ACTION_LABELS[a.type]}
              </span>
              <span className="text-sm">{a.detail ?? "—"}</span>
            </div>
            <div className="whitespace-nowrap text-xs text-muted-foreground">{a.date ?? ""}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
