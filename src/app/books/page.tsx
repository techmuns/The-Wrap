"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterPills } from "@/components/ui/FilterPills";
import { Badge } from "@/components/ui/Badge";
import { books } from "@/content/books";
import type { BookCategory } from "@/types/library";

const CATEGORIES: BookCategory[] = [
  "Fundamentals",
  "Technical Analysis",
  "Industry",
  "Knowledge Base",
];
const OPTIONS = ["All", ...CATEGORIES] as const;
type Option = (typeof OPTIONS)[number];

export default function BooksPage() {
  const [cat, setCat] = useState<Option>("All");
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
      <PageHeader
        title="Book Recommendations"
        icon="📚"
        subtitle="Curated investment & trading books to level up your knowledge."
      />

      <SearchInput value={q} onChange={setQ} placeholder="Search books by title, author, or topic…" />
      <FilterPills options={OPTIONS} value={cat} onChange={setCat} />

      <div className="text-xs text-muted-foreground">{filtered.length} books</div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((b) => (
          <div
            key={b.title}
            className="rounded-xl border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-semibold leading-snug">
                  {b.title}
                  {b.mustRead && (
                    <Star
                      className="h-3.5 w-3.5 shrink-0 fill-current text-chart-3"
                      aria-label="must read"
                    />
                  )}
                </div>
                <div className="mt-0.5 text-sm text-muted-foreground">{b.author}</div>
              </div>
              <Badge variant="category">{b.category}</Badge>
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
