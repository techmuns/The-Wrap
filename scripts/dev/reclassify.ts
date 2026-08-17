/* Re-runs the classifier over the existing announcements JSON (no network).
   Useful after tuning classify.ts. Run: tsx scripts/dev/reclassify.ts */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { classifyAnnouncement } from "../../src/lib/announcements/classify";
import type {
  AnnouncementCategory,
  AnnouncementsDataset,
} from "../../src/types/announcements";

const OUT = resolve(process.cwd(), "src/data/announcements.json");
const data = JSON.parse(readFileSync(OUT, "utf8")) as AnnouncementsDataset;

let changed = 0;
for (const a of data.items) {
  const next = classifyAnnouncement(a.subject, a.headline);
  if (next !== a.category) {
    console.log(`  ${a.symbol}: ${a.category} -> ${next}  | ${(a.headline ?? "").slice(0, 70)}`);
    a.category = next;
    changed++;
  }
}

const byCategory: Partial<Record<AnnouncementCategory, number>> = {};
for (const a of data.items) byCategory[a.category] = (byCategory[a.category] ?? 0) + 1;
data.byCategory = byCategory;
data.total = data.items.length;

writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n");
console.log(`\nReclassified ${changed} of ${data.items.length} items.`);
console.log("byCategory:", JSON.stringify(byCategory));
