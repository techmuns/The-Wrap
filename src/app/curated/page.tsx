"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterPills } from "@/components/ui/FilterPills";
import { curated } from "@/content/curated";
import type { CuratedCategory } from "@/types/library";

const CATEGORIES: CuratedCategory[] = [
  "Investing Skills",
  "Expert Views",
  "Industry Deep Dives",
  "Company Deep Dives",
];
const OPTIONS = ["All", ...CATEGORIES] as const;
type Option = (typeof OPTIONS)[number];

export default function CuratedPage() {
  const [cat, setCat] = useState<Option>("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return curated.filter((c) => {
      if (cat !== "All" && c.category !== cat) return false;
      if (!needle) return true;
      return `${c.title} ${c.by} ${c.note}`.toLowerCase().includes(needle);
    });
  }, [cat, q]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Curated"
        icon="📡"
        subtitle="Hand-picked videos and explainers worth your time."
      />

      <SearchInput value={q} onChange={setQ} placeholder="Search curated content…" />
      <FilterPills options={OPTIONS} value={cat} onChange={setCat} />

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((item) => (
          <a
            key={`${item.title}-${item.by}`}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
              <Play className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1 font-medium leading-snug">
                {item.title}
                <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">{item.by}</div>
              <p className="mt-2 text-sm text-foreground/80">{item.note}</p>
            </div>
          </a>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Our picks of publicly-available creators. Links open a YouTube search so
        they always resolve; we&apos;re not affiliated with any channel.
      </p>
    </div>
  );
}
