/**
 * Parsing for the muns "chat-muns" engine response. The engine responds with a
 * tagged, possibly SSE-framed stream. The final answer lives inside
 * <ans>...</ans>; citation markers <doc_source>KEY</doc_source> reference
 * entries in a trailing <sources>{...json...}</sources> block.
 *
 * Kept in its own module so it can be unit-tested without the route.
 */

export interface Source {
  key: string;
  title: string;
  url: string;
}

export function parseEngineResponse(raw: string): { answer: string; sources: Source[] } {
  // De-frame SSE: strip a leading "data:" from each line if present. On a raw
  // (unframed) payload this is a no-op.
  const text = raw.replace(/^data:\s?/gm, "");

  // Collect every <ans> block (usually one — we send a single task).
  const ansBlocks = [...text.matchAll(/<ans>([\s\S]*?)<\/ans>/g)].map((m) => m[1]);
  let answer = ansBlocks.join("\n\n").trim();

  // Which sources were actually cited inside the answer.
  const citedKeys = new Set(
    [...answer.matchAll(/<doc_source>(.*?)<\/doc_source>/g)].map((m) => m[1].trim())
  );

  // Remove the inline citation markers from the visible answer.
  answer = answer
    .replace(/<doc_source>.*?<\/doc_source>/g, "")
    .replace(/[ \t]+([.,;:])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Parse the <sources> JSON and keep only the cited ones.
  const sources: Source[] = [];
  const srcMatch = text.match(/<sources>([\s\S]*?)<\/sources>/);
  if (srcMatch) {
    try {
      const json = JSON.parse(srcMatch[1]) as Record<
        string,
        { title?: string; url?: string }
      >;
      for (const key of citedKeys) {
        const entry = json[key];
        if (entry?.url) {
          sources.push({ key, title: entry.title || entry.url, url: entry.url });
        }
      }
    } catch {
      // Malformed sources block — ignore, still return the answer.
    }
  }

  return { answer, sources };
}
