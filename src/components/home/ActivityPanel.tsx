"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Flame, TrendingUp, BookOpenCheck, CalendarCheck } from "lucide-react";
import {
  recordVisit,
  subscribeActivity,
  getActivitySnapshot,
  getServerActivitySnapshot,
} from "@/lib/activity";

export function ActivityPanel() {
  const stats = useSyncExternalStore(
    subscribeActivity,
    getActivitySnapshot,
    getServerActivitySnapshot
  );

  // Record today's visit once on mount (updates the store, no setState here).
  useEffect(() => {
    recordVisit();
  }, []);

  const rows = [
    { icon: Flame, label: "Current streak", value: `${stats.currentStreak} ${stats.currentStreak === 1 ? "day" : "days"}` },
    { icon: TrendingUp, label: "Best streak", value: `${stats.bestStreak} ${stats.bestStreak === 1 ? "day" : "days"}` },
    { icon: BookOpenCheck, label: "Issues read", value: String(stats.issuesRead) },
    { icon: CalendarCheck, label: "Active days", value: String(stats.activeDays) },
  ];

  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="text-sm font-semibold tracking-tight">Your activity</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">Saved on this device.</p>
      <ul className="mt-4 space-y-3">
        {rows.map((r) => {
          const Icon = r.icon;
          return (
            <li key={r.label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2.5 text-muted-foreground">
                <Icon className="h-4 w-4 text-chart-3" />
                {r.label}
              </span>
              <span className="font-semibold tabular-nums">{r.value}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
