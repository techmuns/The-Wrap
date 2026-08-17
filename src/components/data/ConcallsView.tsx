"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ConcallKind, ConcallsDataset } from "@/types/concalls";

export function ConcallsView({ data }: { data: ConcallsDataset }) {
  const [tab, setTab] = useState<ConcallKind>("recent");
  const rows = useMemo(() => data.items.filter((i) => i.kind === tab), [data, tab]);
  const total = data.counts.recent + data.counts.upcoming;

  if (total === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card p-8 text-center">
        <p className="text-sm font-medium">No concalls loaded yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Data appears after the first successful refresh from Screener.
        </p>
      </div>
    );
  }

  const TABS: { key: ConcallKind; label: string }[] = [
    { key: "recent", label: "Recent" },
    { key: "upcoming", label: "Upcoming" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <div>{data.fetchedAt ? `Updated ${data.fetchedAt.slice(0, 10)}` : "Latest"}</div>
        <div>Source: Screener</div>
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
            <span className="ml-1.5 text-xs opacity-70">{data.counts[t.key]}</span>
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Nothing here right now.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {rows.map((c, i) => (
            <li
              key={`${c.symbol}-${i}`}
              className="flex flex-col gap-1.5 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="min-w-0">
                <div className="font-medium leading-tight">{c.company ?? c.symbol ?? "—"}</div>
                {c.symbol && <div className="text-xs text-muted-foreground">{c.symbol}</div>}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {c.date && <span>{c.date}</span>}
                {c.links.map((l, j) => (
                  <a
                    key={j}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    {l.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
