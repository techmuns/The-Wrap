"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";
import { primers } from "@/content/primers";
import type { PrimerCategory } from "@/types/primer";

export default function PrimersPage() {
  const categories = useMemo(
    () => Array.from(new Set(primers.map((p) => p.category))).sort() as PrimerCategory[],
    []
  );
  const [cat, setCat] = useState<PrimerCategory | "All">("All");
  const filtered = cat === "All" ? primers : primers.filter((p) => p.category === cat);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Industry Primers"
        subtitle="How industries work — from first principles to the listed players."
      />

      <div className="flex flex-wrap gap-2">
        {(["All", ...categories] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              cat === c ? "border-foreground/30 bg-accent font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((p) => (
          <Link key={p.slug} href={`/primers/${p.slug}`} className="group">
            <div className="flex h-full flex-col rounded-xl border bg-card p-5 transition-colors hover:border-foreground/30">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-foreground">
                  <Building2 className="h-4 w-4" />
                </span>
                <span className="rounded-full border bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {p.category}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-lg font-semibold tracking-tight">
                {p.title}
                <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{p.dek}</p>
              <div className="mt-3 text-xs text-muted-foreground">
                {p.readingTime} · {p.players.length} listed players
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
