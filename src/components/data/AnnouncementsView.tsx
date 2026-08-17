"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import { CATEGORY_ORDER, CATEGORY_LABELS } from "@/lib/announcements/categories";
import type {
  AnnouncementCategory,
  AnnouncementsDataset,
} from "@/types/announcements";

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

export function AnnouncementsView({
  data,
  fixedCategory,
}: {
  data: AnnouncementsDataset;
  fixedCategory?: AnnouncementCategory;
}) {
  const [cat, setCat] = useState<AnnouncementCategory | "all">(
    fixedCategory ?? "all"
  );
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    let items = data.items;
    if (fixedCategory) items = items.filter((i) => i.category === fixedCategory);
    else if (cat !== "all") items = items.filter((i) => i.category === cat);
    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter((i) =>
        `${i.company ?? ""} ${i.symbol ?? ""} ${i.headline ?? ""} ${i.subject ?? ""}`
          .toLowerCase()
          .includes(q)
      );
    }
    return [...items].sort((a, b) =>
      (b.isoDate ?? "").localeCompare(a.isoDate ?? "")
    );
  }, [data, fixedCategory, cat, query]);

  if (data.total === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card p-8 text-center">
        <p className="text-sm font-medium">No announcements loaded yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Data appears here after the first successful refresh. The scheduled
          job pulls corporate announcements and tags each one by category.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <div>
          {fixedCategory
            ? `${rows.length} in ${CATEGORY_LABELS[fixedCategory]}`
            : `${data.total} announcements`}
          {data.fetchedAt ? ` · updated ${data.fetchedAt.slice(0, 10)}` : ""}
        </div>
        <div>Source: {data.source}</div>
      </div>

      {!fixedCategory && (
        <div className="flex flex-wrap gap-1.5">
          <Chip active={cat === "all"} onClick={() => setCat("all")}>
            All <span className="opacity-70">{data.total}</span>
          </Chip>
          {CATEGORY_ORDER.filter(
            (c) => (data.byCategory[c.slug] ?? 0) > 0
          ).map((c) => (
            <Chip
              key={c.slug}
              active={cat === c.slug}
              onClick={() => setCat(c.slug)}
            >
              {c.label} <span className="opacity-70">{data.byCategory[c.slug]}</span>
            </Chip>
          ))}
        </div>
      )}

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search company or headline…"
        className="w-full max-w-sm rounded-md border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
      />

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No matching announcements.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {rows.map((a, i) => (
            <li
              key={`${a.symbol}-${i}`}
              className="flex flex-col gap-1 p-3 sm:flex-row sm:items-start sm:gap-4"
            >
              <div className="sm:w-56 sm:shrink-0">
                <div className="font-medium leading-tight">
                  {a.company ?? a.symbol ?? "—"}
                </div>
                {a.symbol && (
                  <div className="text-xs text-muted-foreground">{a.symbol}</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm">{a.headline ?? a.subject ?? "—"}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {!fixedCategory && (
                    <span className="rounded-full border px-2 py-0.5">
                      {CATEGORY_LABELS[a.category]}
                    </span>
                  )}
                  {a.date && <span>{a.date}</span>}
                  {a.url && (
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      Filing <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
