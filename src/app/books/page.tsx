"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterPills } from "@/components/ui/FilterPills";
import { books } from "@/content/books";
import covers from "@/data/book-covers.json";
import type { Book, BookCategory } from "@/types/library";

const CATEGORIES: BookCategory[] = [
  "Fundamentals",
  "Technical Analysis",
  "Industry",
  "Knowledge Base",
];
const OPTIONS = ["All", ...CATEGORIES] as const;
type Option = (typeof OPTIONS)[number];

const coverMap = covers as Record<string, string>;

function BookPoster({ book }: { book: Book }) {
  const cover = coverMap[book.title];
  return (
    <div className="group" title={book.note}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg border bg-muted shadow-sm transition-transform group-hover:-translate-y-1">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={`${book.title} cover`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-chart-1/30 to-chart-4/20 p-3 text-center text-xs font-medium text-foreground/70">
            {book.title}
          </div>
        )}
        {book.mustRead && (
          <span
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-chart-3 text-background shadow"
            title="Must read"
          >
            <Star className="h-3.5 w-3.5 fill-current" />
          </span>
        )}
      </div>
      <div className="mt-2">
        <div className="line-clamp-2 text-sm font-medium leading-snug">{book.title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{book.author}</div>
      </div>
    </div>
  );
}

function Grid({ items }: { items: Book[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((b) => (
        <BookPoster key={b.title} book={b} />
      ))}
    </div>
  );
}

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

  // Group into category sections only on the unfiltered "All" view.
  const grouped = cat === "All" && !q.trim();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Book Recommendations"
        icon="📚"
        subtitle="Curated investment & trading books to level up your knowledge."
      />

      <SearchInput value={q} onChange={setQ} placeholder="Search books by title, author, or topic…" />
      <FilterPills options={OPTIONS} value={cat} onChange={setCat} />

      {grouped ? (
        <div className="space-y-8">
          {CATEGORIES.map((c) => {
            const items = books.filter((b) => b.category === c);
            if (!items.length) return null;
            return (
              <div key={c}>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold tracking-tight">
                  {c}
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                    {items.length}
                  </span>
                </h2>
                <Grid items={items} />
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div className="text-xs text-muted-foreground">{filtered.length} books</div>
          <Grid items={filtered} />
        </>
      )}

      <p className="text-xs text-muted-foreground">
        Our own selection of widely-available books. Cover images via Open
        Library. Not affiliated with any publisher or seller.
      </p>
    </div>
  );
}
