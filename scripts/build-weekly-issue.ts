/**
 * Weekly issue generator — the product's core loop.
 *
 * Reads the five live data feeds (bulk/block deals, insider trades,
 * announcements, concalls, corporate actions) and assembles a *draft* weekly
 * Blog issue: every data-driven section is filled from the real, independently
 * sourced feeds, while the editorial fields (headline, thesis, per-section
 * commentary) are left as clearly-marked "[DRAFT]" placeholders for a human to
 * write before publishing. Nothing here is fabricated — empty feeds produce
 * honest "no notable activity" notes, never invented items.
 *
 * Output: a TypeScript draft at src/content/drafts/<slug>.ts (default-exporting
 * an Issue) plus a regenerated src/content/drafts/index.ts. Drafts render at
 * /blog/drafts/<slug> for review; they are NOT part of the published /blog
 * archive until a human promotes the file into src/content/issues/.
 *
 * Run: `npm run build:weekly-issue`  (optional: `--date=YYYY-MM-DD`)
 * See docs/WEEKLY-ISSUE.md for the full generate -> review -> publish workflow.
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { formatCrore, formatQty } from "../src/lib/format";
import { CATEGORY_ORDER } from "../src/lib/announcements/categories";
import { ACTION_LABELS } from "../src/types/corporate-actions";
import type { Issue, IssueSection, SectionGroup, SectionItem } from "../src/types/issue";
import type { DealsDataset, Deal } from "../src/types/deals";
import type { InsiderTradesDataset, InsiderTrade } from "../src/types/insider";
import type { AnnouncementsDataset } from "../src/types/announcements";
import type { ConcallsDataset } from "../src/types/concalls";
import type { CorporateActionsDataset, ActionType } from "../src/types/corporate-actions";

const DATA_DIR = resolve(process.cwd(), "src/data");
const DRAFTS_DIR = resolve(process.cwd(), "src/content/drafts");

// How many items each section surfaces. Tuned to keep a draft digestible; the
// full firehose always lives behind the linked Data Tool.
const LIMITS = {
  insiderPerSide: 5,
  blockDeals: 4,
  bulkDeals: 4,
  annPerCategory: 3,
  annMaxCategories: 8,
  recentConcalls: 6,
  corpActionsPerType: 4,
};

// Editorial fields a human must write before publishing are prefixed with this
// so they're easy to spot (and grep) in the rendered draft and the source.
const TODO = "[DRAFT — write this]";

// ---- small date helpers (no external deps) --------------------------------
const ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function displayOf(d: Date): string {
  return `${d.getDate()} ${ABBR[d.getMonth()]} ${d.getFullYear()}`;
}

function argDate(): Date {
  const arg = process.argv.find((a) => a.startsWith("--date="))?.split("=")[1];
  if (arg) {
    const m = arg.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) throw new Error(`--date must be YYYY-MM-DD, got "${arg}"`);
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  return new Date();
}

// ---- data loading ---------------------------------------------------------
function load<T>(file: string, fallback: T): T {
  const p = join(DATA_DIR, file);
  if (!existsSync(p)) return fallback;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as T;
  } catch {
    return fallback;
  }
}

/** Sort a copy of `arr` by a numeric key, descending, with nulls/undefined last. */
function byDesc<T>(arr: T[], key: (x: T) => number | null | undefined): T[] {
  return [...arr].sort((a, b) => (key(b) ?? -Infinity) - (key(a) ?? -Infinity));
}

/** Sort a copy by an ISO-ish date string, most recent first (nulls last). */
function byRecent<T>(arr: T[], key: (x: T) => string | null | undefined): T[] {
  return [...arr].sort((a, b) => (key(b) ?? "").localeCompare(key(a) ?? ""));
}

function star(items: SectionItem[]): SectionItem[] {
  return items.map((it, i) => (i === 0 ? { ...it, starred: true } : it));
}

// ---- section builders -----------------------------------------------------

function insiderSection(ds: InsiderTradesDataset): IssueSection {
  const withValue = (t: InsiderTrade) => t.value;
  const buys = byDesc(ds.items.filter((t) => t.buySell === "BUY"), withValue).slice(0, LIMITS.insiderPerSide);
  const sells = byDesc(ds.items.filter((t) => t.buySell === "SELL"), withValue).slice(0, LIMITS.insiderPerSide);

  const fmt = (t: InsiderTrade): SectionItem => {
    const who = [t.person, t.role ? `(${t.role})` : ""].filter(Boolean).join(" ");
    const size = t.value != null ? formatCrore(t.value) : t.shares != null ? `${formatQty(t.shares)} sh` : "size n/a";
    return { text: `${t.company ?? t.symbol ?? "—"} — ${who || "insider"}, ${size}` };
  };

  const groups: SectionGroup[] = [];
  if (buys.length) groups.push({ heading: "Notable buying", items: star(buys.map(fmt)) });
  if (sells.length) groups.push({ heading: "Notable selling", items: star(sells.map(fmt)) });

  return {
    id: "insider",
    title: "Insider & promoter trades",
    body: [`${TODO}: one line on the week's promoter/insider tone — accumulation, distribution, or two-sided.`],
    groups: groups.length ? groups : undefined,
    note: groups.length
      ? "Ranked by disclosed value from the latest snapshot. The full week's trades live in the Buying & Selling tracker."
      : "No insider or promoter trades in the latest snapshot.",
    link: { href: "/data-tools/insider-trades", label: "Buying & Selling" },
  };
}

function dealsSection(deals: DealsDataset): IssueSection {
  const fmt = (d: Deal): SectionItem => {
    const verb = d.buySell === "BUY" ? "bought" : d.buySell === "SELL" ? "sold" : "traded";
    const who = d.clientName ? `${d.clientName} ${verb} ` : "";
    return { text: `${d.name ?? d.symbol ?? "—"} — ${who}${formatCrore(d.value)}` };
  };
  const block = byDesc(deals.block ?? [], (d) => d.value).slice(0, LIMITS.blockDeals);
  const bulk = byDesc(deals.bulk ?? [], (d) => d.value).slice(0, LIMITS.bulkDeals);

  const groups: SectionGroup[] = [];
  if (block.length) groups.push({ heading: "Block deals", items: star(block.map(fmt)) });
  if (bulk.length) groups.push({ heading: "Bulk deals", items: bulk.map(fmt) });

  return {
    id: "deals",
    title: "Bulk & block deals",
    body: [`${TODO}: a line on the week's institutional churn — who's building or trimming positions.`],
    groups: groups.length ? groups : undefined,
    note: groups.length
      ? "Largest by deal value from the latest session. Live bulk, block and short deals are tracked here."
      : "No bulk or block deals in the latest snapshot.",
    link: { href: "/data-tools/bulk-block-deals", label: "Bulk & Block Deals" },
  };
}

function announcementsSection(ds: AnnouncementsDataset): IssueSection {
  const groups: SectionGroup[] = [];
  for (const cat of CATEGORY_ORDER) {
    // "other" is noise for a curated wrap; concalls have their own section.
    if (cat.slug === "other" || cat.slug === "concall") continue;
    if (groups.length >= LIMITS.annMaxCategories) break;
    const inCat = byRecent(ds.items.filter((a) => a.category === cat.slug), (a) => a.isoDate).slice(
      0,
      LIMITS.annPerCategory
    );
    if (!inCat.length) continue;
    // Suggest a "must-read" star on the highest-signal categories.
    const emphasise = cat.slug === "capex" || cat.slug === "order-wins" || cat.slug === "acquisitions";
    const items = inCat.map((a) => ({ text: `${a.company ?? a.symbol ?? "—"} — ${a.headline ?? a.subject ?? ""}`.trim() }));
    groups.push({ heading: cat.label, items: emphasise ? star(items) : items });
  }

  return {
    id: "announcements",
    title: "Noteworthy announcements",
    body: [
      groups.length
        ? "Our pick of the week's more consequential filings, by category — not exhaustive:"
        : `${TODO}: no notable filings surfaced this week — write a line or remove this section.`,
    ],
    groups: groups.length ? groups : undefined,
    note: "Every category here is a filtered view over the unified announcements feed.",
    link: { href: "/data-tools/announcements", label: "Announcements" },
  };
}

function concallsSection(ds: ConcallsDataset): IssueSection {
  const recent = byRecent(ds.items.filter((c) => c.kind === "recent"), (c) => c.isoDate).slice(
    0,
    LIMITS.recentConcalls
  );
  const upcomingCount = ds.items.filter((c) => c.kind === "upcoming").length;

  const items: SectionItem[] = recent.map((c) => {
    const labels = [...new Set(c.links.map((l) => l.label))].filter(Boolean);
    return { text: `${c.company ?? c.symbol ?? "—"}${labels.length ? ` — ${labels.join(", ")}` : ""}` };
  });

  const notes: string[] = [];
  if (upcomingCount > 0) notes.push(`${upcomingCount} call${upcomingCount === 1 ? "" : "s"} scheduled ahead.`);
  notes.push("Transcripts, notes and recordings are collected here.");

  return {
    id: "concalls",
    title: "Earnings calls",
    body: [`${TODO}: which calls are worth your time and why.`],
    groups: items.length ? [{ heading: "Recent calls with materials", items }] : undefined,
    note: items.length ? notes.join(" ") : "No recent concall materials in the latest snapshot.",
    link: { href: "/data-tools/concalls", label: "Concalls" },
  };
}

function corpActionsSection(ds: CorporateActionsDataset): IssueSection {
  const order: ActionType[] = ["buyback", "bonus", "split", "rights", "dividend"];
  const groups: SectionGroup[] = [];
  for (const type of order) {
    const inType = byRecent(ds.items.filter((a) => a.type === type), (a) => a.isoDate).slice(
      0,
      LIMITS.corpActionsPerType
    );
    if (!inType.length) continue;
    groups.push({
      heading: ACTION_LABELS[type],
      items: inType.map((a) => ({ text: `${a.company ?? a.symbol ?? "—"}${a.detail ? ` — ${a.detail}` : ""}` })),
    });
  }

  return {
    id: "corporate-actions",
    title: "Corporate actions",
    body: [`${TODO}: any buyback or bonus worth flagging.`],
    groups: groups.length ? groups : undefined,
    note: groups.length
      ? "Bonuses, buybacks, splits, rights and dividends — full list in the tracker."
      : "No corporate actions in the latest snapshot.",
    link: { href: "/data-tools/corporate-actions", label: "Corporate Actions" },
  };
}

// ---- assembly -------------------------------------------------------------

function buildIssue(now: Date): Issue {
  const deals = load<DealsDataset>("bulk-block-deals.json", {
    asOnDate: null, fetchedAt: null, counts: { bulk: 0, block: 0, short: 0 }, bulk: [], block: [], short: [],
  });
  const insider = load<InsiderTradesDataset>("insider-trades.json", { fetchedAt: null, source: "", total: 0, items: [] });
  const announcements = load<AnnouncementsDataset>("announcements.json", {
    fetchedAt: null, source: "Screener", total: 0, byCategory: {}, items: [],
  });
  const concalls = load<ConcallsDataset>("concalls.json", { fetchedAt: null, source: "", counts: { recent: 0, upcoming: 0 }, items: [] });
  const corpActions = load<CorporateActionsDataset>("corporate-actions.json", { fetchedAt: null, source: "", total: 0, byType: {}, items: [] });

  const buys = insider.items.filter((t) => t.buySell === "BUY").length;
  const sells = insider.items.filter((t) => t.buySell === "SELL").length;
  const blockN = deals.counts?.block ?? deals.block?.length ?? 0;
  const bulkN = deals.counts?.bulk ?? deals.bulk?.length ?? 0;

  // A factual, data-derived scaffold line to sit under the human-written thesis.
  const byNumbers =
    `In the latest data: ${buys} insider/promoter buy${buys === 1 ? "" : "s"} and ${sells} sell${sells === 1 ? "" : "s"}, ` +
    `${blockN} block and ${bulkN} bulk deal${bulkN === 1 ? "" : "s"}, ` +
    `${announcements.total} notable filing${announcements.total === 1 ? "" : "s"}, ` +
    `${concalls.counts?.recent ?? 0} recent earnings call${(concalls.counts?.recent ?? 0) === 1 ? "" : "s"}, and ` +
    `${corpActions.total} corporate action${corpActions.total === 1 ? "" : "s"}.`;

  const sections: IssueSection[] = [
    {
      id: "summary",
      title: "The week in one line",
      body: [
        `${TODO}: the week's thesis — index moves, the macro backdrop, and the single takeaway.`,
        byNumbers,
      ],
    },
    {
      id: "breadth",
      title: "Market breadth",
      body: [`${TODO}: is participation broadening or narrowing? (No live breadth feed yet — a Market Breadth tool is on the roadmap.)`],
      note: "A Market Breadth tool (sector × EMA heatmap) is planned under Data Tools.",
    },
    insiderSection(insider),
    dealsSection(deals),
    announcementsSection(announcements),
    concallsSection(concalls),
    corpActionsSection(corpActions),
    {
      id: "curated",
      title: "Curated",
      body: [`${TODO}: two or three long-reads worth the weekend.`],
      link: { href: "/curated", label: "Curated" },
    },
  ];

  return {
    slug: isoOf(now),
    date: displayOf(now),
    isoDate: isoOf(now),
    title: `${TODO}: headline for the week of ${displayOf(now)}`,
    dek: `${TODO}: one-line standfirst.`,
    readingTime: "Draft preview",
    sections,
  };
}

// ---- emit TypeScript + regenerate the drafts index ------------------------

function draftFileSource(issue: Issue, generatedAt: string): string {
  // JSON.stringify emits valid TS for this plain-data object and escapes every
  // string safely (headlines can contain quotes, ₹, etc.).
  const body = JSON.stringify(issue, null, 2);
  return `import type { Issue } from "@/types/issue";

// AUTO-GENERATED DRAFT by scripts/build-weekly-issue.ts on ${generatedAt}.
// This is a reviewable draft, NOT a published issue. Edit the "${TODO}" fields
// (headline, dek, section commentary), then promote to src/content/issues/ to
// publish. See docs/WEEKLY-ISSUE.md.
const issue: Issue = ${body};

export default issue;
`;
}

function rewriteIndex(): void {
  const files = readdirSync(DRAFTS_DIR)
    .filter((f) => f.endsWith(".ts") && f !== "index.ts")
    .map((f) => f.replace(/\.ts$/, ""))
    .sort((a, b) => b.localeCompare(a)); // newest slug first

  const imports = files.map((slug, i) => `import d${i} from "./${slug}";`).join("\n");
  const list = files.map((_, i) => `d${i}`).join(", ");

  const src = `import type { Issue } from "@/types/issue";
${imports ? "\n" + imports + "\n" : ""}
// AUTO-GENERATED by scripts/build-weekly-issue.ts — do not edit by hand.
// Drafts are reviewable weekly issues that are not yet published to /blog.
export const drafts: Issue[] = [${list}].sort((a, b) => b.isoDate.localeCompare(a.isoDate));

export function getDraft(slug: string): Issue | undefined {
  return drafts.find((d) => d.slug === slug);
}

export function getDraftSlugs(): string[] {
  return drafts.map((d) => d.slug);
}
`;
  writeFileSync(join(DRAFTS_DIR, "index.ts"), src);
}

function main() {
  const now = argDate();
  mkdirSync(DRAFTS_DIR, { recursive: true });
  const issue = buildIssue(now);
  const outFile = join(DRAFTS_DIR, `${issue.slug}.ts`);
  writeFileSync(outFile, draftFileSource(issue, now.toISOString()));
  rewriteIndex();

  const dataSections = issue.sections.filter((s) => s.groups?.length).length;
  console.log(`Wrote draft ${outFile}`);
  console.log(`  ${issue.sections.length} sections (${dataSections} filled from live feeds).`);
  console.log(`  Review at /blog/drafts/${issue.slug}, then edit the "${TODO}" fields and promote to src/content/issues/ to publish.`);
}

main();
