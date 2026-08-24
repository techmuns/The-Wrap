"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import {
  subscribeActivity,
  getActivitySnapshot,
  getServerActivitySnapshot,
} from "@/lib/activity";
import {
  subscribeProgress,
  getProgressSnapshot,
  getServerProgressSnapshot,
  markFlag,
} from "@/lib/progress";
import { issues } from "@/content/issues";

export function GettingStarted() {
  const act = useSyncExternalStore(
    subscribeActivity,
    getActivitySnapshot,
    getServerActivitySnapshot
  );
  const prog = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    getServerProgressSnapshot
  );

  if (prog.flags.includes("gs-dismissed")) return null;

  const latest = issues[0];
  const steps: { label: string; done: boolean; href?: string }[] = [
    { label: "Read your first weekly wrap", done: act.issuesRead > 0, href: latest ? `/blog/${latest.slug}` : "/blog" },
    { label: "Explore a data tool", done: prog.visited.includes("data-tools"), href: "/data-tools" },
    { label: "Ask the AI a question", done: prog.visited.includes("ask"), href: "/ask" },
    { label: "Read an industry primer", done: prog.visited.includes("primers"), href: "/primers" },
    { label: "Watch a curated video", done: prog.visited.includes("curated"), href: "/curated" },
    { label: "Browse the book list", done: prog.visited.includes("books"), href: "/books" },
    { label: "Get the TradingView indicator", done: prog.visited.includes("indicators"), href: "/indicators" },
    { label: "Switch up the theme (bottom-left)", done: prog.flags.includes("theme") },
    { label: "Build a 3-day visit streak", done: act.currentStreak >= 3 || act.bestStreak >= 3 },
  ];

  const done = steps.filter((s) => s.done).length;
  const total = steps.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card">
      <div className="h-1 w-full bg-gradient-to-r from-primary via-chart-4 to-chart-3" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <span aria-hidden>🚀</span> Getting Started
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {done} of {total} completed
            </p>
          </div>
          <button
            type="button"
            onClick={() => markFlag("gs-dismissed")}
            aria-label="Dismiss"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground">{pct}%</span>
        </div>

        {/* Steps */}
        <ul className="mt-4 space-y-1">
          {steps.map((s) => {
            const inner = (
              <div className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors">
                <span
                  className={
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border " +
                    (s.done
                      ? "border-positive bg-positive text-background"
                      : "border-muted-foreground/40 text-transparent")
                  }
                >
                  <Check className="h-3 w-3" />
                </span>
                <span
                  className={
                    "text-sm " +
                    (s.done ? "text-muted-foreground line-through" : "text-foreground")
                  }
                >
                  {s.label}
                </span>
              </div>
            );
            return (
              <li key={s.label}>
                {s.href && !s.done ? (
                  <Link href={s.href} className="block hover:bg-accent/60 rounded-lg">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
