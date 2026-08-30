import type { Issue } from "@/types/issue";

import i0 from "./2026-08-30";
import i1 from "./2026-08-27";
import i2 from "./2025-11-30";
import i3 from "./2024-11-17";

// AUTO-GENERATED index by scripts/build-weekly-issue.ts — includes hand-written
// issues and the auto-generated weekly wraps, newest first.
export const issues: Issue[] = [i0, i1, i2, i3].sort((a, b) => b.isoDate.localeCompare(a.isoDate));

export function getIssue(slug: string): Issue | undefined {
  return issues.find((i) => i.slug === slug);
}

export function getIssueSlugs(): string[] {
  return issues.map((i) => i.slug);
}
