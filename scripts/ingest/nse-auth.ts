/**
 * Shared NSE access helper. NSE's public JSON APIs sit behind an anti-bot edge
 * that first requires a GET to the site root to obtain cookies, after which the
 * /api/* endpoints return JSON for a browser-like User-Agent + Referer. This is
 * the same handshake the bulk/block-deals ingest uses; extracted here so the
 * breadth/sector, FII-DII and 52-week feeds can share it.
 *
 * Runs from GitHub Actions (whose IPs NSE serves); it is expected to be blocked
 * from some other networks.
 */
export const NSE_BASE = "https://www.nseindia.com";
export const NSE_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Parse an NSE numeric string ("1,234.56", "-", "") into a number or null. */
export function nseNum(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

async function primeCookies(): Promise<string> {
  const res = await fetch(`${NSE_BASE}/`, {
    headers: {
      "User-Agent": NSE_UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  const cookies = (res.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
  if (!cookies || cookies.length < 20) {
    throw new Error(`NSE home returned no usable cookie (status ${res.status})`);
  }
  return cookies;
}

/** Fetch and parse an NSE /api/* JSON endpoint, re-priming cookies on failure. */
export async function nseGetJson<T = unknown>(
  path: string,
  referer: string = `${NSE_BASE}/`,
  attempts = 4
): Promise<T> {
  let lastErr: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      const cookie = await primeCookies();
      const res = await fetch(`${NSE_BASE}${path}`, {
        headers: {
          "User-Agent": NSE_UA,
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
          Referer: referer,
          Cookie: cookie,
        },
      });
      if (!res.ok) throw new Error(`${path} returned HTTP ${res.status}`);
      const text = await res.text();
      return JSON.parse(text) as T;
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`  attempt ${i}/${attempts} failed: ${msg}`);
      if (i < attempts) await sleep(1500 * i);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}
