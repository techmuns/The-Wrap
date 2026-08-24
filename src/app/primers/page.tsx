"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterPills } from "@/components/ui/FilterPills";
import { Badge } from "@/components/ui/Badge";
import { primers } from "@/content/primers";
import { pickGradient } from "@/lib/cover";
import type { PrimerCategory } from "@/types/primer";

/** A representative emoji per industry, for the card cover. */
const PRIMER_EMOJI: Record<string, string> = {
  cement: "🏗️",
  footwear: "👟",
  "solar-energy": "☀️",
  banks: "🏦",
  pharma: "💊",
  "it-services": "💻",
  automobiles: "🚗",
  fmcg: "🛒",
};

export default function PrimersPage() {
  const categories = useMemo(
    () => Array.from(new Set(primers.map((p) => p.category))).sort() as PrimerCategory[],
    []
  );
  const options = useMemo(() => ["All", ...categories] as const, [categories]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { All: primers.length };
    for (const p of primers) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, []);

  const [cat, setCat] = useState<PrimerCategory | "All">("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return primers.filter((p) => {
      if (cat !== "All" && p.category !== cat) return false;
      if (!needle) return true;
      return (
        `${p.title} ${p.dek}`.toLowerCase().includes(needle) ||
        p.players.some((pl) => pl.name.toLowerCase().includes(needle))
      );
    });
  }, [cat, q]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Industry Primers"
        icon="📖"
        subtitle="In-depth explorations of how industries work — from first principles to listed players."
      />

      <SearchInput value={q} onChange={setQ} placeholder="Search by industry or company name…" />
      <FilterPills options={options} value={cat} onChange={setCat} counts={counts} />

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((p) => (
          <Link key={p.slug} href={`/primers/${p.slug}`} className="group">
            <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary/40">
              {/* Illustrated cover */}
              <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${pickGradient(p.slug)}`}>
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={p.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <span className="text-5xl leading-none" aria-hidden>
                    {PRIMER_EMOJI[p.slug] ?? "🏭"}
                  </span>
                )}
                <span className="absolute left-2.5 top-2.5 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                  {p.category}
                </span>
                <span className="absolute right-2.5 top-2.5">
                  <Badge variant="free">Free</Badge>
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start gap-1 text-lg font-semibold tracking-tight">
                  {p.title}
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{p.dek}</p>
                <div className="mt-3 text-xs text-muted-foreground">
                  {p.readingTime} · {p.sections.length} sections · {p.players.length} companies
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.players.slice(0, 3).map((pl) => (
                    <span
                      key={pl.name}
                      className="rounded-md border bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {pl.name}
                    </span>
                  ))}
                  {p.players.length > 3 && (
                    <span className="rounded-md border bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                      +{p.players.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Original explainers written from publicly-available industry knowledge —
        informational only, not investment advice. More industries on the way.
      </p>
    </div>
  );
}
