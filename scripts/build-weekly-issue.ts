/**
 * Weekly issue generator — the product's core loop.
 *
 * Reads the week's live data feeds and assembles a *draft* weekly Blog issue:
 * every data-driven section is filled from the real, independently sourced
 * feeds, while the editorial fields (headline, thesis, per-section commentary)
 * are left as clearly-marked "[DRAFT]" placeholders for a human to write before
 * publishing. Nothing here is fabricated — empty feeds produce honest "no
 * notable activity" notes, never invented items.
 *
 * Data source: each daily ingest archives an immutable partition under
 * src/data/history/<feed>/<day>.json (see scripts/ingest/history.ts). This
 * generator reads a rolling window of those partitions and dedupes them, so the
 * draft reflects the whole trading week rather than a single day's snapshot. If
 * no partitions exist yet (fresh repo), it falls back to the latest snapshot in
 * src/data/<feed>.json so it always produces something.
 *
 * Output: a TypeScript draft at src/content/drafts/<slug>.ts (default-exporting
 * an Issue) plus a regenerated src/content/drafts/index.ts. Drafts render at
 * /blog/drafts/<slug> for review; they are NOT part of the published /blog
 * archive until a human promotes the file into src/content/issues/.
 *
 * Run: `npm run build:weekly-issue`
 *   optional: `-- --date=YYYY-MM-DD`  the issue date (default: today, UTC)
 *   optional: `-- --days=N`           window length in days (default: 7)
 * See docs/WEEKLY-ISSUE.md for the full generate -> review -> publish workflow.
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { formatCrore, formatQty } from "../src/lib/format";
import { CATEGORY_ORDER } from "../src/lib/announcements/categories";
import { ACTION_LABELS } from "../src/types/corporate-actions";
import { readWindow, mergeWindow } from "./ingest/history";
import type { Issue, IssueSection, SectionGroup, SectionItem } from "../src/types/issue";
import type { DealsDataset, Deal } from "../src/types/deals";
import type { InsiderTradesDataset, InsiderTrade } from "../src/types/insider";
import type { AnnouncementsDataset, Announcement } from "../src/types/announcements";
import type { ConcallsDataset, Concall } from "../src/types/concalls";
import type { CorporateActionsDataset, CorporateAction, ActionType } from "../src/types/corporate-actions";

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

// ---- args + date helpers (UTC throughout; no external deps) ---------------
const ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function isoOf(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function displayOf(d: Date): string {
  return `${d.getUTCDate()} ${ABBR[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
function argValue(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
}
function issueDate(): Date {
  const arg = argValue("date");
  if (arg) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(arg)) throw new Error(`--date must be YYYY-MM-DD, got "${arg}"`);
    return new Date(`${arg}T00:00:00Z`);
  }
  return new Date();
}
function windowDays(): number {
  const arg = argValue("days");
  const n = arg ? Number(arg) : 7;
  if (!Number.isFinite(n) || n < 1) throw new Error(`--days must be a positive number, got "${arg}"`);
  return Math.floor(n);
}

// ---- feed loading: rolling window of partitions, snapshot fallback --------
function loadSnapshot<T>(file: string, fallback: T): T {
  const p = join(DATA_DIR, file);
  if (!existsSync(p)) return fallback;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as T;
  } catch {
    return fallback;
  }
}

interface Loaded<T> {
  rows: T[];
  fromHistory: boolean;
  days: string[]; // capturedOn of each partition that contributed
}

/** Read a feed's rolling window, deduped; fall back to the latest snapshot. */
function loadFeed<T>(
  feed: string,
  snapshotRows: T[],
  key: (row: T) => string,
  startDay: string,
  endDay: string
): Loaded<T> {
  const parts = readWindow<T>(feed, startDay, endDay);
  if (!parts.length) return { rows: snapshotRows, fromHistory: false, days: [] };
  return { rows: mergeWindow(parts, key), fromHistory: true, days: parts.map((p) => p.capturedOn) };
}

// Feed-specific dedup keys — a row that reappears in consecutive snapshots
// must collapse to one across the window.
const dealKey = (d: Deal) => `${d.category}|${d.symbol ?? d.name}|${d.clientName}|${d.qty}|${d.watp}|${d.date}`;
const insiderKey = (t: InsiderTrade) => `${t.symbol ?? t.company}|${t.person}|${t.buySell}|${t.shares}|${t.value}`;
const annKey = (a: Announcement) => a.url ?? `${a.symbol}|${a.subject}|${a.isoDate}`;
const concallKey = (c: Concall) => `${c.symbol ?? c.company}|${c.kind}|${c.isoDate}|${c.links[0]?.url ?? ""}`;
const corpKey = (a: CorporateAction) => `${a.symbol ?? a.company}|${a.type}|${a.isoDate}|${a.detail}`;

// ---- ranking helpers ------------------------------------------------------
function byDesc<T>(arr: T[], key: (x: T) => number | null | undefined): T[] {
  return [...arr].sort((a, b) => (key(b) ?? -Infinity) - (key(a) ?? -Infinity));
}
function byRecent<T>(arr: T[], key: (x: T) => string | null | undefined): T[] {
  return [...arr].sort((a, b) => (key(b) ?? "").localeCompare(key(a) ?? ""));
}
function star(items: SectionItem[]): SectionItem[] {
  return items.map((it, i) => (i === 0 ? { ...it, starred: true } : it));
}

// ---- section builders (`src` = human phrase for where the data came from) --

function insiderSection(rows: InsiderTrade[], src: string): IssueSection {
  const buys = byDesc(rows.filter((t) => t.buySell === "BUY"), (t) => t.value).slice(0, LIMITS.insiderPerSide);
  const sells = byDesc(rows.filter((t) => t.buySell === "SELL"), (t) => t.value).slice(0, LIMITS.insiderPerSide);

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
      ? `Ranked by disclosed value ${src}. The full list lives in the Buying & Selling tracker.`
      : `No insider or promoter trades ${src}.`,
    link: { href: "/data-tools/insider-trades", label: "Buying & Selling" },
  };
}

function dealsSection(bulk: Deal[], block: Deal[], src: string): IssueSection {
  const fmt = (d: Deal): SectionItem => {
    const verb = d.buySell === "BUY" ? "bought" : d.buySell === "SELL" ? "sold" : "traded";
    const who = d.clientName ? `${d.clientName} ${verb} ` : "";
    return { text: `${d.name ?? d.symbol ?? "—"} — ${who}${formatCrore(d.value)}` };
  };
  const topBlock = byDesc(block, (d) => d.value).slice(0, LIMITS.blockDeals);
  const topBulk = byDesc(bulk, (d) => d.value).slice(0, LIMITS.bulkDeals);

  const groups: SectionGroup[] = [];
  if (topBlock.length) groups.push({ heading: "Block deals", items: star(topBlock.map(fmt)) });
  if (topBulk.length) groups.push({ heading: "Bulk deals", items: topBulk.map(fmt) });

  return {
    id: "deals",
    title: "Bulk & block deals",
    body: [`${TODO}: a line on the week's institutional churn — who's building or trimming positions.`],
    groups: groups.length ? groups : undefined,
    note: groups.length
      ? `Largest by deal value ${src}. Live bulk, block and short deals are tracked here.`
      : `No bulk or block deals ${src}.`,
    link: { href: "/data-tools/bulk-block-deals", label: "Bulk & Block Deals" },
  };
}

function announcementsSection(rows: Announcement[]): IssueSection {
  const groups: SectionGroup[] = [];
  for (const cat of CATEGORY_ORDER) {
    if (cat.slug === "other" || cat.slug === "concall") continue; // noise / own section
    if (groups.length >= LIMITS.annMaxCategories) break;
    const inCat = byRecent(rows.filter((a) => a.category === cat.slug), (a) => a.isoDate).slice(0, LIMITS.annPerCategory);
    if (!inCat.length) continue;
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

function concallsSection(rows: Concall[], src: string): IssueSection {
  const recent = byRecent(rows.filter((c) => c.kind === "recent"), (c) => c.isoDate).slice(0, LIMITS.recentConcalls);
  const upcomingCount = rows.filter((c) => c.kind === "upcoming").length;

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
    note: items.length ? notes.join(" ") : `No recent concall materials ${src}.`,
    link: { href: "/data-tools/concalls", label: "Concalls" },
  };
}

function corpActionsSection(rows: CorporateAction[], src: string): IssueSection {
  const order: ActionType[] = ["buyback", "bonus", "split", "rights", "dividend"];
  const groups: SectionGroup[] = [];
  for (const type of order) {
    const inType = byRecent(rows.filter((a) => a.type === type), (a) => a.isoDate).slice(0, LIMITS.corpActionsPerType);
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
      : `No corporate actions ${src}.`,
    link: { href: "/data-tools/corporate-actions", label: "Corporate Actions" },
  };
}

// ---- assembly -------------------------------------------------------------

function buildIssue(now: Date, days: number): { issue: Issue; log: string } {
  const endDay = isoOf(now);
  const startDate = new Date(now);
  startDate.setUTCDate(startDate.getUTCDate() - (days - 1));
  const startDay = isoOf(startDate);

  // Snapshot fallbacks (used only if a feed has no partitions yet).
  const snapDeals = loadSnapshot<DealsDataset>("bulk-block-deals.json", {
    asOnDate: null, fetchedAt: null, counts: { bulk: 0, block: 0, short: 0 }, bulk: [], block: [], short: [],
  });
  const snapInsider = loadSnapshot<InsiderTradesDataset>("insider-trades.json", { fetchedAt: null, source: "", total: 0, items: [] });
  const snapAnn = loadSnapshot<AnnouncementsDataset>("announcements.json", { fetchedAt: null, source: "Screener", total: 0, byCategory: {}, items: [] });
  const snapConcalls = loadSnapshot<ConcallsDataset>("concalls.json", { fetchedAt: null, source: "", counts: { recent: 0, upcoming: 0 }, items: [] });
  const snapCorp = loadSnapshot<CorporateActionsDataset>("corporate-actions.json", { fetchedAt: null, source: "", total: 0, byType: {}, items: [] });

  const deals = loadFeed<Deal>("bulk-block-deals", [...snapDeals.bulk, ...snapDeals.block, ...snapDeals.short], dealKey, startDay, endDay);
  const insider = loadFeed<InsiderTrade>("insider-trades", snapInsider.items, insiderKey, startDay, endDay);
  const announcements = loadFeed<Announcement>("announcements", snapAnn.items, annKey, startDay, endDay);
  const concalls = loadFeed<Concall>("concalls", snapConcalls.items, concallKey, startDay, endDay);
  const corpActions = loadFeed<CorporateAction>("corporate-actions", snapCorp.items, corpKey, startDay, endDay);

  const bulk = deals.rows.filter((d) => d.category === "bulk");
  const block = deals.rows.filter((d) => d.category === "block");
  const buys = insider.rows.filter((t) => t.buySell === "BUY").length;
  const sells = insider.rows.filter((t) => t.buySell === "SELL").length;
  const recentCalls = concalls.rows.filter((c) => c.kind === "recent").length;

  // Coverage across all feeds: how many distinct trading days we actually have.
  const coverage = new Set<string>([deals, insider, announcements, concalls, corpActions].flatMap((f) => f.days));
  const usedHistory = coverage.size > 0;
  const src = usedHistory ? "over the past week" : "from the latest snapshot";
  const byNumbers =
    (usedHistory
      ? `Over the past week (${coverage.size} trading day${coverage.size === 1 ? "" : "s"} captured): `
      : "In the latest snapshot: ") +
    `${buys} insider/promoter buy${buys === 1 ? "" : "s"} and ${sells} sell${sells === 1 ? "" : "s"}, ` +
    `${block.length} block and ${bulk.length} bulk deal${bulk.length === 1 ? "" : "s"}, ` +
    `${announcements.rows.length} notable filing${announcements.rows.length === 1 ? "" : "s"}, ` +
    `${recentCalls} earnings call${recentCalls === 1 ? "" : "s"}, and ` +
    `${corpActions.rows.length} corporate action${corpActions.rows.length === 1 ? "" : "s"}.`;

  const sections: IssueSection[] = [
    {
      id: "summary",
      title: "The week in one line",
      body: [`${TODO}: the week's thesis — index moves, the macro backdrop, and the single takeaway.`, byNumbers],
    },
    {
      id: "breadth",
      title: "Market breadth",
      body: [`${TODO}: is participation broadening or narrowing? (No live breadth feed yet — a Market Breadth tool is on the roadmap.)`],
      note: "A Market Breadth tool (sector × EMA heatmap) is planned under Data Tools.",
    },
    insiderSection(insider.rows, src),
    dealsSection(bulk, block, src),
    announcementsSection(announcements.rows),
    concallsSection(concalls.rows, src),
    corpActionsSection(corpActions.rows, src),
    {
      id: "curated",
      title: "Curated",
      body: [`${TODO}: two or three long-reads worth the weekend.`],
      link: { href: "/curated", label: "Curated" },
    },
  ];

  const issue: Issue = {
    slug: endDay,
    date: displayOf(now),
    isoDate: endDay,
    title: `${TODO}: headline for the week of ${displayOf(now)}`,
    dek: `${TODO}: one-line standfirst.`,
    readingTime: "Draft preview",
    sections,
  };

  const coverageMsg = usedHistory
    ? `window ${startDay}..${endDay}, ${coverage.size} day(s) archived`
    : `no archive yet — used latest snapshot (window ${startDay}..${endDay})`;
  return { issue, log: coverageMsg };
}

// ---- emit TypeScript + regenerate the drafts index ------------------------

function draftFileSource(issue: Issue, generatedAt: string): string {
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
  const now = issueDate();
  const days = windowDays();
  mkdirSync(DRAFTS_DIR, { recursive: true });
  const { issue, log } = buildIssue(now, days);
  const outFile = join(DRAFTS_DIR, `${issue.slug}.ts`);
  writeFileSync(outFile, draftFileSource(issue, new Date().toISOString()));
  rewriteIndex();

  const dataSections = issue.sections.filter((s) => s.groups?.length).length;
  console.log(`Wrote draft ${outFile}`);
  console.log(`  ${log}`);
  console.log(`  ${issue.sections.length} sections (${dataSections} filled from live feeds).`);
  console.log(`  Review at /blog/drafts/${issue.slug}, then edit the "${TODO}" fields and promote to src/content/issues/ to publish.`);
}

main();
