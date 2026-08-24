/**
 * On-device "getting started" progress — which sections you've visited and a
 * couple of action flags — stored in localStorage. Powers the Getting Started
 * checklist. No account, no backend; it only moves as you actually use the app.
 */
export interface Progress {
  /** Section keys the user has opened. */
  visited: string[];
  /** One-off action flags (e.g. "theme"). */
  flags: string[];
}

const KEY = "wrap:progress:v1";
const EMPTY: Progress = { visited: [], flags: [] };

/** Map a pathname to a trackable section key, or null if not tracked. */
export function sectionKey(path: string): string | null {
  if (path.startsWith("/data-tools")) return "data-tools";
  if (path.startsWith("/books")) return "books";
  if (path.startsWith("/curated")) return "curated";
  if (path.startsWith("/primers")) return "primers";
  if (path.startsWith("/interviews")) return "interviews";
  if (path.startsWith("/indicators")) return "indicators";
  if (path.startsWith("/ask")) return "ask";
  return null;
}

function read(): Progress {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const p = JSON.parse(raw) as Partial<Progress>;
    return {
      visited: Array.isArray(p.visited) ? p.visited : [],
      flags: Array.isArray(p.flags) ? p.flags : [],
    };
  } catch {
    return { ...EMPTY };
  }
}

function write(p: Progress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage disabled — ignore */
  }
  bump();
}

// ---- external store -------------------------------------------------------
const listeners = new Set<() => void>();
let version = 0;
let cached: Progress | null = null;
let cachedVersion = -1;
const SERVER_SNAPSHOT: Progress = EMPTY;

function bump(): void {
  version++;
  for (const l of listeners) l();
}

export function subscribeProgress(cb: () => void): () => void {
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

export function getProgressSnapshot(): Progress {
  if (cachedVersion !== version || cached === null) {
    cached = read();
    cachedVersion = version;
  }
  return cached;
}

export function getServerProgressSnapshot(): Progress {
  return SERVER_SNAPSHOT;
}

/** Record a section visit (idempotent). */
export function recordSectionVisit(path: string): void {
  const key = sectionKey(path);
  if (!key) return;
  const p = read();
  if (!p.visited.includes(key)) {
    p.visited = [...p.visited, key];
    write(p);
  }
}

/** Mark a one-off action flag (idempotent). */
export function markFlag(flag: string): void {
  const p = read();
  if (!p.flags.includes(flag)) {
    p.flags = [...p.flags, flag];
    write(p);
  }
}
