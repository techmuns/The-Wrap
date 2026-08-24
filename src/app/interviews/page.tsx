"use client";

import { useState } from "react";
import { ExternalLink, Mic, Radio, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Explainer } from "@/components/ui/Explainer";
import { cn } from "@/lib/cn";
import { interviews } from "@/content/interviews";
import type { InterviewCategory } from "@/types/interview";

const CATEGORIES: InterviewCategory[] = ["Business TV", "Long-Form & Founders", "Earnings Calls"];

const ICON: Record<InterviewCategory, typeof Mic> = {
  "Business TV": Radio,
  "Long-Form & Founders": Mic,
  "Earnings Calls": FileText,
};

export default function InterviewsPage() {
  const [cat, setCat] = useState<InterviewCategory | "All">("All");
  const filtered = cat === "All" ? interviews : interviews.filter((i) => i.category === cat);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Management Interviews"
        subtitle="Hear listed-company management in their own words."
      />

      <Explainer
        what="Free, public places to watch or read what company management actually says — TV interviews, long-form founder podcasts, and the earnings calls where they answer analysts directly."
        matters="Management's own words — on strategy, guidance and tough questions — tell you more than any headline. The earnings-call transcripts are the most unfiltered source of all."
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

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((item) => {
          const Icon = ICON[item.category];
          return (
            <a
              key={`${item.title}-${item.by}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/30"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1 font-medium leading-snug">
                  {item.by}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{item.title}</div>
                <p className="mt-2 text-sm text-foreground/80">{item.note}</p>
              </div>
            </a>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        All sources are free and publicly available. TV and podcast links open a
        YouTube search so they always resolve; earnings-call links point to the
        official primary sources. We&apos;re not affiliated with any outlet.
      </p>
    </div>
  );
}
