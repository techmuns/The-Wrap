/**
 * Lightweight, on-device reader activity — streaks, active days and issues
 * read — stored in the browser's localStorage. No account or backend, and no
 * data leaves the device; it's an honest per-browser tracker (so the numbers
 * start at zero and only move as you actually use the app).
 */
export interface Activity {
  /** Unique local calendar days the app was opened, ascending. */
  days: string[];
  /** Count of weekly issues opened. */
  issuesRead: number;
}

export interface ActivityStats {
  currentStreak: number;
  bestStreak: number;
  activeDays: number;
  issuesRead: number;
}

const KEY = "wrap:activity:v1";
const EMPTY: Activity = { days: [], issuesRead: 0 };

function localDay(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return localDay(dt);
}

export function readActivity(): Activity {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<Activity>;
    return { days: Array.isArray(parsed.days) ? parsed.days : [], issuesRead: parsed.issuesRead ?? 0 };
  } catch {
    return { ...EMPTY };
  }
}

function write(a: Activity): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* storage disabled — ignore */
  }
  bump();
}

// ---- external store (for useSyncExternalStore) ----------------------------
// Lets components read this localStorage-backed state without setState-in-effect
// and without hydration mismatches (server snapshot is a stable empty object).
const listeners = new Set<() => void>();
let version = 0;
let cachedStats: ActivityStats | null = null;
let cachedVersion = -1;
const SERVER_STATS: ActivityStats = { currentStreak: 0, bestStreak: 0, activeDays: 0, issuesRead: 0 };

function bump(): void {
  version++;
  for (const l of listeners) l();
}

export function subscribeActivity(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) bump();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/** Cached so useSyncExternalStore sees a stable reference until data changes. */
export function getActivitySnapshot(): ActivityStats {
  if (cachedVersion !== version || cachedStats === null) {
    cachedStats = computeStats(readActivity());
    cachedVersion = version;
  }
  return cachedStats;
}

export function getServerActivitySnapshot(): ActivityStats {
  return SERVER_STATS;
}

/** Record that the app was opened today. Returns the updated activity. */
export function recordVisit(): Activity {
  const a = readActivity();
  const today = localDay();
  if (!a.days.includes(today)) {
    a.days = [...a.days, today].sort();
    write(a);
  }
  return a;
}

/** Record that a weekly issue was opened (also counts as a visit). */
export function recordIssueRead(): Activity {
  const a = recordVisit();
  a.issuesRead = (a.issuesRead ?? 0) + 1;
  write(a);
  return a;
}

export function computeStats(a: Activity): ActivityStats {
  const set = new Set(a.days);
  const activeDays = set.size;

  // Current streak: consecutive days counting back from today.
  let currentStreak = 0;
  let cursor = localDay();
  while (set.has(cursor)) {
    currentStreak++;
    cursor = addDays(cursor, -1);
  }

  // Best streak: longest consecutive run across all recorded days.
  let bestStreak = 0;
  let run = 0;
  let prev = "";
  for (const d of [...set].sort()) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    if (run > bestStreak) bestStreak = run;
    prev = d;
  }

  return { currentStreak, bestStreak, activeDays, issuesRead: a.issuesRead ?? 0 };
}
