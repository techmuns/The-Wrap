"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Heart, Newspaper } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { issues } from "@/content/issues";
import type { Issue } from "@/types/issue";

function Cover({ issue, className }: { issue: Issue; className?: string }) {
  if (issue.image) {
    return (
      <div className={"relative overflow-hidden bg-muted " + (className ?? "")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={issue.image} alt={issue.title} loading="lazy" className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className={
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-chart-1/30 via-chart-4/20 to-chart-3/20 " +
        (className ?? "")
      }
    >
      <Newspaper className="h-10 w-10 text-foreground/40" />
      <span className="absolute bottom-2 right-3 text-[11px] font-medium text-foreground/50">
        {issue.date}
      </span>
    </div>
  );
}

export function BlogList() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return issues;
    return issues.filter(
      (i) =>
        i.title.toLowerCase().includes(needle) ||
        i.dek.toLowerCase().includes(needle)
    );
  }, [q]);

  const [featured, ...rest] = filtered;

  return (
    <div className="space-y-6">
      <SearchInput value={q} onChange={setQ} placeholder="Search articles…" />

      {!featured && (
        <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          No articles match “{q}”.
        </p>
      )}

      {/* Featured */}
      {featured && (
        <Link href={`/blog/${featured.slug}`} className="group block">
          <div className="grid overflow-hidden rounded-2xl border bg-card transition-colors hover:border-primary/40 md:grid-cols-2">
            <Cover issue={featured} className="min-h-[200px]" />
            <div className="flex flex-col p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="featured">Featured</Badge>
                <Badge variant="free">Free</Badge>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {featured.date}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {featured.readingTime}
                </span>
              </div>
              <h2 className="mt-2 flex items-start gap-1 text-2xl font-bold leading-snug tracking-tight">
                {featured.title}
                <ArrowRight className="mt-1.5 h-5 w-5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
              </h2>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{featured.dek}</p>
              <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" /> Free to read
                </span>
                <span>By The Wrap</span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Recent grid */}
      {rest.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Recent articles</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((issue) => (
              <Link key={issue.slug} href={`/blog/${issue.slug}`} className="group block">
                <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary/40">
                  <Cover issue={issue} className="h-32" />
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <Badge variant="free">Free</Badge>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {issue.readingTime}
                      </span>
                    </div>
                    <h3 className="mt-2 flex items-start gap-1 font-semibold leading-snug tracking-tight">
                      {issue.title}
                      <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                    </h3>
                    <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">{issue.dek}</p>
                    <div className="mt-3 text-xs text-muted-foreground">{issue.date} · By The Wrap</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
