"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";
import { books } from "@/content/books";
import type { BookCategory } from "@/types/library";

const CATEGORIES: BookCategory[] = ["Fundamentals", "Technical Analysis", "Industry", "Knowledge Base"];

export default function BooksPage() {
  const [cat, setCat] = useState<BookCategory | "All">("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return books.filter((b) => {
      if (cat !== "All" && b.category !== cat) return false;
      if (!needle) return true;
      return `${b.title} ${b.author}`.toLowerCase().includes(needle);
    });
  }, [cat, q]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Books" subtitle="A curated reading list for investors — our picks." />

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by title or author…"
        className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-foreground/30"
      />

      <div className="flex flex-wrap gap-2">
        {(["All", ...CATEGORIES] as const).map((c) => (
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

      <div className="text-xs text-muted-foreground">{filtered.length} books</div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((b) => (
          <div key={b.title} className="rounded-xl border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-semibold leading-snug">
                  {b.title}
                  {b.mustRead && <Star className="h-3.5 w-3.5 shrink-0 fill-current text-chart-3" aria-label="must read" />}
                </div>
                <div className="mt-0.5 text-sm text-muted-foreground">{b.author}</div>
              </div>
              <span className="shrink-0 rounded-full border bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                {b.category}
              </span>
            </div>
            <p className="mt-3 text-sm text-foreground/80">{b.note}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Our own selection of widely-available books. Not affiliated with any
        publisher or seller.
      </p>
    </div>
  );
}
