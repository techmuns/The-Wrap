"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordVisit } from "@/lib/activity";
import { recordSectionVisit } from "@/lib/progress";

/**
 * Invisible: records that the app was opened today (for streaks) and which
 * section the current route belongs to (for the Getting Started checklist).
 * Runs on every navigation. Writes localStorage only — no rendering, no setState.
 */
export function ProgressTracker() {
  const pathname = usePathname();
  useEffect(() => {
    recordVisit();
    recordSectionVisit(pathname);
  }, [pathname]);
  return null;
}
