"use client";

import { useMemo, useState } from "react";
import { Play } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterPills } from "@/components/ui/FilterPills";
import { curated } from "@/content/curated";
import type { CuratedCategory, CuratedItem } from "@/types/library";

const CATEGORIES: CuratedCategory[] = [
  "Investing Skills",
  "Expert Views",
  "Industry Deep Dives",
  "Company Deep Dives",
];
const OPTIONS = ["All", ...CATEGORIES] as const;
type Option = (typeof OPTIONS)[number];

function VideoCard({ item }: { item: CuratedItem }) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${item.videoId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary/40"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white">
          {item.category}
        </span>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform group-hover:scale-110">
            <Play className="ml-0.5 h-6 w-6 fill-current" />
          </span>
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold leading-snug">{item.title}</h3>
        <div className="mt-1 text-sm text-muted-foreground">{item.by}</div>
        <p className="mt-2 flex-1 text-sm text-foreground/80">{item.note}</p>
        {item.tags && item.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.map((t) => (
              <span
                key={t}
                className="rounded-md border bg-muted/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}

export default function CuratedPage() {
  const [cat, setCat] = useState<Option>("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return curated.filter((c) => {
      if (cat !== "All" && c.category !== cat) return false;
      if (!needle) return true;
      return `${c.title} ${c.by} ${c.note} ${(c.tags ?? []).join(" ")}`
        .toLowerCase()
        .includes(needle);
    });
  }, [cat, q]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Curated"
        icon="📡"
        subtitle="Hand-picked videos and explainers worth your time."
      />

      <SearchInput value={q} onChange={setQ} placeholder="Search curated content…" />
      <FilterPills options={OPTIONS} value={cat} onChange={setCat} />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <VideoCard key={item.videoId} item={item} />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Our picks of publicly-available videos — thumbnails and links go straight
        to YouTube. We&apos;re not affiliated with any channel.
      </p>
    </div>
  );
}
