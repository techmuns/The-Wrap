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
import type { Issue, IssueSection, SectionGroup, SectionItem, IssueTable, TableCell } from "../src/types/issue";
import type { DealsDataset, Deal } from "../src/types/deals";
import type { InsiderTradesDataset, InsiderTrade } from "../src/types/insider";
import type { AnnouncementsDataset, Announcement } from "../src/types/announcements";
import type { ConcallsDataset, Concall } from "../src/types/concalls";
import type { CorporateActionsDataset, CorporateAction, ActionType } from "../src/types/corporate-actions";
import type { IndicesDataset, IndexQuote } from "../src/types/indices";
import type { FlowsDataset } from "../src/types/flows";
import type { MoversDataset, MoverRow } from "../src/types/movers";

const DATA_DIR = resolve(process.cwd(), "src/data");
const ISSUES_DIR = resolve(process.cwd(), "src/content/issues");

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
    body: [insiderTone(rows.filter((t) => t.buySell === "BUY").length, rows.filter((t) => t.buySell === "SELL").length)],
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
    body: [dealsTone(block.length, bulk.length)],
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
        ? "The week's more consequential filings, grouped by category — not exhaustive:"
        : "Few notable filings surfaced in this window.",
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
    body: [concallsTone(recent.length, upcomingCount)],
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
    body: [corpTone(groups.length ? rows.length : 0)],
    groups: groups.length ? groups : undefined,
    note: groups.length
      ? "Bonuses, buybacks, splits, rights and dividends — full list in the tracker."
      : `No corporate actions ${src}.`,
    link: { href: "/data-tools/corporate-actions", label: "Corporate Actions" },
  };
}

function pctStr(n: number | null): string {
  return n == null ? "—" : `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
}

// ---- auto-writer: turn the real numbers into finished, factual prose --------
// Every sentence below is composed only from the loaded data. Empty feeds get
// honest "quiet week" lines; nothing is invented and there's no advice.

type Tone = "up" | "down" | "mixed";

/** Overall market tone from the breadth of sectoral moves (+ headline index). */
function marketTone(ix: IndicesDataset): { tone: Tone; up: number; down: number; total: number; idxPct: number | null; headline: string | null } {
  const up = ix.sectoral.filter((s) => (s.pctChange ?? 0) > 0).length;
  const down = ix.sectoral.filter((s) => (s.pctChange ?? 0) < 0).length;
  const total = ix.sectoral.length;
  const headlineIdx =
    ix.broad.find((b) => /NIFTY 50$/i.test(b.name)) ||
    ix.broad.find((b) => /NIFTY 500/i.test(b.name)) ||
    ix.broad.find((b) => /TOTAL MARKET/i.test(b.name)) ||
    ix.broad[0];
  const idxPct = headlineIdx?.pctChange ?? null;
  let tone: Tone = "mixed";
  if (total > 0) {
    if (up > down * 1.3) tone = "up";
    else if (down > up * 1.3) tone = "down";
  } else if (idxPct != null) {
    tone = idxPct > 0 ? "up" : idxPct < 0 ? "down" : "mixed";
  }
  return { tone, up, down, total, idxPct, headline: headlineIdx?.name ?? null };
}

const TONE_HEADLINE: Record<Tone, string> = {
  up: "Broad-Based Gains",
  down: "Broad-Based Selling",
  mixed: "A Mixed Week",
};

function leadersLaggardsSentence(ix: IndicesDataset): string | null {
  const sorted = [...ix.sectoral].sort((a, b) => (b.pctChange ?? -Infinity) - (a.pctChange ?? -Infinity));
  if (sorted.length < 2) return null;
  const nm = (s: IndexQuote) => s.name.replace(/^NIFTY /, "");
  const leaders = sorted.slice(0, 3).map(nm);
  const laggards = sorted.slice(-3).reverse().map(nm);
  return `Money favoured ${leaders.join(", ")}, while ${laggards.join(", ")} lagged.`;
}

function insiderTone(buys: number, sells: number): string {
  if (buys === 0 && sells === 0) return "No promoter or insider trades were disclosed in this window.";
  if (buys > sells * 1.5) return `Promoters and insiders leaned toward accumulation — ${buys} disclosed buy${buys === 1 ? "" : "s"} against ${sells} sell${sells === 1 ? "" : "s"}.`;
  if (sells > buys * 1.5) return `Promoters and insiders leaned toward distribution — ${sells} disclosed sell${sells === 1 ? "" : "s"} against ${buys} buy${buys === 1 ? "" : "s"}.`;
  return `Promoter and insider activity was two-sided — ${buys} buy${buys === 1 ? "" : "s"} and ${sells} sell${sells === 1 ? "" : "s"} disclosed.`;
}

function dealsTone(blockN: number, bulkN: number): string {
  if (blockN === 0 && bulkN === 0) return "A quiet stretch for large bulk and block deals.";
  return `Institutions stayed active on the tape — ${blockN} block and ${bulkN} bulk deal${bulkN === 1 ? "" : "s"} of note. The largest by value:`;
}

function concallsTone(recentN: number, upcomingN: number): string {
  if (recentN === 0 && upcomingN === 0) return "No earnings calls with published materials in this window.";
  if (recentN === 0) return `${upcomingN} earnings call${upcomingN === 1 ? "" : "s"} scheduled ahead — none with materials out yet.`;
  return "Management hit the mic. Recent calls with transcripts, notes or recordings:";
}

function corpTone(n: number): string {
  return n === 0 ? "No new corporate actions in this window." : "Capital returns and structural actions announced:";
}

function moversSection(mv: MoversDataset): IssueSection {
  const nm = (r: MoverRow) => r.company ?? r.symbol ?? "—";
  const highs = mv.highs.length;
  const lows = mv.lows.length;
  const topVol = byDesc(mv.volume, (v) => v.timesAvg).slice(0, 3);
  const facts: string[] = [];
  if (highs || lows) facts.push(`${highs} stock${highs === 1 ? "" : "s"} hit fresh 52-week highs and ${lows} touched new lows.`);
  const hasData = highs > 0 || lows > 0 || topVol.length > 0;

  const groups: SectionGroup[] = [];
  if (mv.highs.length) groups.push({ heading: "New 52-week highs", items: star(mv.highs.slice(0, 5).map((r) => ({ text: `${nm(r)} (${pctStr(r.pctChange)})` }))) });
  if (mv.lows.length) groups.push({ heading: "New 52-week lows", items: mv.lows.slice(0, 5).map((r) => ({ text: `${nm(r)} (${pctStr(r.pctChange)})` })) });
  if (topVol.length) groups.push({ heading: "Unusual volume", items: topVol.map((r) => ({ text: `${nm(r)}${r.timesAvg != null ? ` — ${r.timesAvg.toFixed(1)}× avg` : ""}` })) });

  return {
    id: "movers",
    title: "Highs, lows & volume",
    body: hasData ? facts : ["Highs/lows data pending the next market-close update."],
    groups: groups.length ? groups : undefined,
    note: "New 52-week highs and lows and unusual-volume stocks at the latest close.",
    link: { href: "/data-tools/movers", label: "Highs, Lows & Volume" },
  };
}

/** Rough reading time from the finished issue's word count. */
function readingTimeOf(issue: Issue): string {
  let words = `${issue.title} ${issue.dek}`.split(/\s+/).length;
  for (const s of issue.sections) {
    words += (s.body ?? []).join(" ").split(/\s+/).length;
    for (const g of s.groups ?? []) words += g.items.length * 8;
  }
  return `${Math.max(3, Math.round(words / 180))} min read`;
}

function breadthSection(ix: IndicesDataset): IssueSection {
  const headline =
    ix.broad.find((b) => /TOTAL MARKET/i.test(b.name)) ||
    ix.broad.find((b) => /NIFTY 500/i.test(b.name)) ||
    ix.broad.find((b) => /NIFTY 50$/i.test(b.name)) ||
    ix.broad.find((b) => (b.advances ?? 0) + (b.declines ?? 0) > 0) ||
    ix.broad[0];
  const up = ix.sectoral.filter((s) => (s.pctChange ?? 0) > 0).length;
  const down = ix.sectoral.filter((s) => (s.pctChange ?? 0) < 0).length;

  const facts: string[] = [];
  if (headline && (headline.advances != null || headline.declines != null)) {
    facts.push(
      `${headline.name}: ${headline.advances ?? "?"} advancing vs ${headline.declines ?? "?"} declining${
        headline.pctChange != null ? ` (${pctStr(headline.pctChange)})` : ""
      }.`
    );
  }
  if (ix.sectoral.length) facts.push(`${up} of ${ix.sectoral.length} sectors up, ${down} down.`);
  const hasData = facts.length > 0;

  return {
    id: "breadth",
    title: "Market breadth",
    body: hasData
      ? [
          `Beneath the headline, breadth looked ${up > down * 1.3 ? "broadly positive" : down > up * 1.3 ? "weak" : "mixed"}.`,
          facts.join(" "),
        ]
      : ["Breadth data pending the first market-close update."],
    note: hasData ? "Advances vs declines beneath the headline index." : "Breadth data pending the first market-close update.",
    link: { href: "/data-tools/market-breadth", label: "Market Breadth" },
  };
}

function sectorSection(ix: IndicesDataset): IssueSection {
  const sorted = [...ix.sectoral].sort((a, b) => (b.pctChange ?? -Infinity) - (a.pctChange ?? -Infinity));

  // Colour-coded sector heatmap: day move + advancing/declining breadth.
  let table: IssueTable | undefined;
  if (sorted.length) {
    const rows = sorted.map((s) => {
      const adv = s.advances ?? null;
      const dec = s.declines ?? null;
      const breadth = adv != null && dec != null && adv + dec > 0 ? (adv / (adv + dec)) * 100 : null;
      const cells: TableCell[] = [
        { text: pctStr(s.pctChange), value: s.pctChange ?? null, scale: 3 },
        { text: adv != null ? String(adv) : "—" },
        { text: dec != null ? String(dec) : "—" },
        { text: breadth != null ? `${breadth.toFixed(0)}%` : "—", value: breadth != null ? breadth - 50 : null, scale: 50 },
      ];
      return { label: s.name.replace(/^NIFTY /, ""), cells };
    });
    table = {
      columns: ["Sector", "Day %", "Adv", "Dec", "Breadth %"],
      rows,
      caption: "Day move and advancing-vs-declining breadth per sector, at the latest close. Green = strength, red = weakness.",
    };
  }

  return {
    id: "sectors",
    title: "Sector rotation",
    body: [leadersLaggardsSentence(ix) ?? "Sector data pending the first market-close update."],
    table,
    note: table ? undefined : "Sector data pending the first market-close update.",
    link: { href: "/data-tools/sector-rotation", label: "Sector Rotation" },
  };
}

/** One-line FII/DII summary, or null when no data. */
function flowsLine(f: FlowsDataset): string | null {
  const part = (label: string, r: FlowsDataset["fii"]): string | null => {
    if (!r || r.net == null) return null;
    const verb = r.net >= 0 ? "net bought" : "net sold";
    return `${label} ${verb} ₹${Math.abs(r.net).toLocaleString("en-IN", { maximumFractionDigits: 0 })} cr`;
  };
  const parts = [part("FIIs", f.fii), part("DIIs", f.dii)].filter(Boolean) as string[];
  if (!parts.length) return null;
  return `${f.date ? `On ${f.date}, ` : ""}${parts.join("; ")}.`;
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

  // Point-in-time snapshots (latest close), not rolling-window feeds.
  const indices = loadSnapshot<IndicesDataset>("indices.json", { fetchedAt: null, source: "NSE", timestamp: null, broad: [], sectoral: [] });
  const flows = loadSnapshot<FlowsDataset>("flows.json", { fetchedAt: null, source: "NSE", date: null, fii: null, dii: null });

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

  const movers = loadSnapshot<MoversDataset>("movers.json", {
    fetchedAt: null, source: "NSE", timestamp: null, highs: [], lows: [], volume: [],
  });

  // Auto-written thesis, from the numbers only.
  const t = marketTone(indices);
  const moodSentence =
    t.total > 0
      ? `At the latest close, ${t.up} of ${t.total} sectoral indices advanced and ${t.down} declined${
          t.idxPct != null ? `; the headline index was ${pctStr(t.idxPct)}` : ""
        }.`
      : t.idxPct != null
        ? `The headline index was ${pctStr(t.idxPct)} at the latest close.`
        : "Market breadth will appear here after the next close.";
  const ll = leadersLaggardsSentence(indices);
  const flows$ = flowsLine(flows);
  const summaryBody = [moodSentence, ...(ll ? [ll] : []), byNumbers, ...(flows$ ? [flows$] : [])];

  const sections: IssueSection[] = [
    {
      id: "summary",
      title: "This week, in short",
      body: summaryBody,
    },
    breadthSection(indices),
    sectorSection(indices),
    moversSection(movers),
    insiderSection(insider.rows, src),
    dealsSection(bulk, block, src),
    announcementsSection(announcements.rows),
    concallsSection(concalls.rows, src),
    corpActionsSection(corpActions.rows, src),
  ];

  const issue: Issue = {
    slug: endDay,
    date: displayOf(now),
    isoDate: endDay,
    title: `The Wrap 🌯 ${displayOf(now)} — ${TONE_HEADLINE[t.tone]}`,
    dek: "Your weekly wrap of everything that moved the Indian market — breadth, flows, deals and the filings that mattered.",
    readingTime: "",
    sections,
  };
  issue.readingTime = readingTimeOf(issue);

  const coverageMsg = usedHistory
    ? `window ${startDay}..${endDay}, ${coverage.size} day(s) archived`
    : `no archive yet — used latest snapshot (window ${startDay}..${endDay})`;
  return { issue, log: coverageMsg };
}

// ---- emit TypeScript + regenerate the issues index ------------------------

function issueFileSource(issue: Issue, generatedAt: string): string {
  const body = JSON.stringify(issue, null, 2);
  return `import type { Issue } from "@/types/issue";

// AUTO-GENERATED weekly wrap by scripts/build-weekly-issue.ts on ${generatedAt}.
// Every line is composed from independently-sourced, publicly-available data —
// no mock data and no investment advice. Regenerated each week by the workflow.
const issue: Issue = ${body};

export default issue;
`;
}

function rewriteIssuesIndex(): void {
  const files = readdirSync(ISSUES_DIR)
    .filter((f) => f.endsWith(".ts") && f !== "index.ts")
    .map((f) => f.replace(/\.ts$/, ""))
    .sort((a, b) => b.localeCompare(a)); // newest slug first

  const imports = files.map((slug, i) => `import i${i} from "./${slug}";`).join("\n");
  const list = files.map((_, i) => `i${i}`).join(", ");

  const src = `import type { Issue } from "@/types/issue";
${imports ? "\n" + imports + "\n" : ""}
// AUTO-GENERATED index by scripts/build-weekly-issue.ts — includes hand-written
// issues and the auto-generated weekly wraps, newest first.
export const issues: Issue[] = [${list}].sort((a, b) => b.isoDate.localeCompare(a.isoDate));

export function getIssue(slug: string): Issue | undefined {
  return issues.find((i) => i.slug === slug);
}

export function getIssueSlugs(): string[] {
  return issues.map((i) => i.slug);
}
`;
  writeFileSync(join(ISSUES_DIR, "index.ts"), src);
}

function main() {
  const now = issueDate();
  const days = windowDays();
  mkdirSync(ISSUES_DIR, { recursive: true });
  const { issue, log } = buildIssue(now, days);
  const outFile = join(ISSUES_DIR, `${issue.slug}.ts`);
  writeFileSync(outFile, issueFileSource(issue, new Date().toISOString()));
  rewriteIssuesIndex();

  const dataSections = issue.sections.filter((s) => s.groups?.length).length;
  console.log(`Published weekly wrap ${outFile}`);
  console.log(`  ${log}`);
  console.log(`  "${issue.title}" — ${issue.readingTime}`);
  console.log(`  ${issue.sections.length} sections (${dataSections} with live data). Live at /blog/${issue.slug}.`);
}

main();
