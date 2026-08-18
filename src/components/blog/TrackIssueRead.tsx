"use client";

import { useEffect } from "react";
import { recordIssueRead } from "@/lib/activity";

/**
 * Renders nothing — records (once per mount) that a weekly issue was opened, so
 * the home page's "Issues read" and streak counters reflect real reading.
 */
export function TrackIssueRead({ slug }: { slug: string }) {
  useEffect(() => {
    recordIssueRead();
    // slug in deps so navigating between issues counts each one.
  }, [slug]);
  return null;
}
