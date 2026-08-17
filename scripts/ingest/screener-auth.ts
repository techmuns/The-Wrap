/**
 * Shared Screener.in auth for ingestion scripts. Standard Django form login
 * (no CAPTCHA); credentials from SCREENER_USERNAME / SCREENER_PASSWORD env
 * (GitHub Actions secrets) — never logged. Logs in fresh each run, so there is
 * no token to expire.
 */
import * as cheerio from "cheerio";

export const SCREENER_BASE = "https://www.screener.in";
export const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export type Jar = Record<string, string>;
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function clean(s: string | null | undefined): string | null {
  if (!s) return null;
  const t = s.replace(/\s+/g, " ").trim();
  return t || null;
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var ${name}`);
  return v;
}

function absorbCookies(res: Response, jar: Jar) {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const pair = c.split(";")[0];
    const i = pair.indexOf("=");
    if (i > 0) jar[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
  }
}

export const cookieHeader = (jar: Jar) =>
  Object.entries(jar).map(([k, v]) => `${k}=${v}`).join("; ");

export async function screenerLogin(): Promise<Jar> {
  const jar: Jar = {};
  const loginUrl = `${SCREENER_BASE}/login/`;
  const getRes = await fetch(loginUrl, { headers: { "User-Agent": UA } });
  absorbCookies(getRes, jar);
  const $ = cheerio.load(await getRes.text());
  const token = $('input[name="csrfmiddlewaretoken"]').attr("value") || jar["csrftoken"];
  if (!token) throw new Error("Could not find CSRF token on login page");

  const body = new URLSearchParams({
    csrfmiddlewaretoken: token,
    username: requireEnv("SCREENER_USERNAME"),
    password: requireEnv("SCREENER_PASSWORD"),
    next: "/",
  });
  const postRes = await fetch(loginUrl, {
    method: "POST",
    headers: {
      "User-Agent": UA,
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: loginUrl,
      Origin: SCREENER_BASE,
      Cookie: cookieHeader(jar),
    },
    body: body.toString(),
    redirect: "manual",
  });
  absorbCookies(postRes, jar);
  if (!jar["sessionid"]) {
    throw new Error(
      `Login failed: no sessionid (HTTP ${postRes.status}). Check SCREENER_USERNAME / SCREENER_PASSWORD.`
    );
  }
  return jar;
}

/** GET a logged-in Screener page; throws if redirected to /register (not authed). */
export async function screenerGet(jar: Jar, path: string): Promise<string> {
  const res = await fetch(`${SCREENER_BASE}${path}`, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml",
      Cookie: cookieHeader(jar),
      Referer: `${SCREENER_BASE}/filings/`,
    },
    redirect: "manual",
  });
  if (res.status >= 300 && res.status < 400)
    throw new Error(`${path} redirected (HTTP ${res.status}) — not authenticated`);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.text();
}
