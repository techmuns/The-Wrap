import type { Issue } from "@/types/issue";
import nov2024 from "./2024-11-17";
import nov2025 from "./2025-11-30";

/** All issues, newest first. */
export const issues: Issue[] = [nov2025, nov2024].sort((a, b) =>
  b.isoDate.localeCompare(a.isoDate)
);

export function getIssue(slug: string): Issue | undefined {
  return issues.find((i) => i.slug === slug);
}

export function getIssueSlugs(): string[] {
  return issues.map((i) => i.slug);
}
