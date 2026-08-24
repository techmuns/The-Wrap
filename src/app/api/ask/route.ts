import { NextResponse } from "next/server";
import { parseEngineResponse } from "@/lib/ask-parse";

/**
 * Server-side proxy to the muns "chat-muns" engine. The bearer token
 * (MUNS_TOKEN) is read from the server environment (Cloudflare Worker secret
 * or GitHub Actions secret) and NEVER exposed to the browser. The browser
 * calls this route; this route adds the Authorization header and calls muns.
 */

export const dynamic = "force-dynamic";

const MUNS_ENDPOINT = "https://birdnest.muns.io/chat/chat-muns";

interface AskBody {
  question?: unknown;
}

/** yyyy-mm-dd for a Date. */
function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  const token = process.env.MUNS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "The assistant isn't configured yet. (Missing MUNS_TOKEN.)" },
      { status: 503 }
    );
  }

  let body: AskBody;
  try {
    body = (await request.json()) as AskBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) {
    return NextResponse.json({ error: "Please type a question." }, { status: 400 });
  }
  if (question.length > 1000) {
    return NextResponse.json(
      { error: "That question is a bit long — please shorten it." },
      { status: 400 }
    );
  }

  const now = new Date();
  const from = new Date(now);
  from.setFullYear(from.getFullYear() - 2);

  // user_index can be overridden via env; otherwise use the known-good value.
  const rawIdx = process.env.MUNS_USER_INDEX;
  const userIndex =
    rawIdx !== undefined && rawIdx !== "" && !Number.isNaN(Number(rawIdx))
      ? Number(rawIdx)
      : 124;

  const payload = {
    user_index: userIndex,
    tasks: [question],
    query_context: {
      TICKER_SYMBOL: [] as string[],
      FROM_DATE: iso(from),
      TO_DATE: iso(now),
      ANNOUNCEMENT_FORM_TYPE: "all",
      WEB_SEARCH_ENABLED: true,
      chatHistory: [] as unknown[],
      mode: "fast",
    },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);

  let upstream: Response;
  try {
    upstream = await fetch(MUNS_ENDPOINT, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    const timedOut = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      {
        error: timedOut
          ? "The assistant took too long to respond. Please try again."
          : "Couldn't reach the assistant. Please try again in a moment.",
      },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    clearTimeout(timer);
    return NextResponse.json(
      { error: `The assistant returned an error (${upstream.status}).` },
      { status: 502 }
    );
  }

  let raw: string;
  try {
    raw = await upstream.text();
  } catch {
    return NextResponse.json(
      { error: "The assistant's response was interrupted. Please try again." },
      { status: 502 }
    );
  } finally {
    clearTimeout(timer);
  }
  const { answer, sources } = parseEngineResponse(raw);

  if (!answer) {
    return NextResponse.json(
      { error: "The assistant didn't return an answer. Please rephrase and try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ answer, sources });
}
