/**
 * Fetch real book-cover image URLs from the Open Library API for our reading
 * list, and write them to src/data/book-covers.json (title -> cover URL).
 * Run once (or when the book list changes): `npx tsx scripts/enrich-book-covers.ts`.
 * No mock data — every cover comes from Open Library's public covers CDN.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BOOKS: { title: string; author: string }[] = [
  { title: "The Intelligent Investor", author: "Benjamin Graham" },
  { title: "Common Stocks and Uncommon Profits", author: "Philip Fisher" },
  { title: "One Up on Wall Street", author: "Peter Lynch" },
  { title: "The Little Book That Still Beats the Market", author: "Joel Greenblatt" },
  { title: "Poor Charlie's Almanack", author: "Charlie Munger" },
  { title: "The Psychology of Money", author: "Morgan Housel" },
  { title: "The Most Important Thing", author: "Howard Marks" },
  { title: "How to Make Money in Stocks", author: "William O'Neil" },
  { title: "Trade Like a Stock Market Wizard", author: "Mark Minervini" },
  { title: "Stan Weinstein's Secrets for Profiting in Bull and Bear Markets", author: "Stan Weinstein" },
  { title: "Technical Analysis of the Financial Markets", author: "John J. Murphy" },
  { title: "Reminiscences of a Stock Operator", author: "Edwin Lefèvre" },
  { title: "Market Wizards", author: "Jack D. Schwager" },
  { title: "Chip War", author: "Chris Miller" },
  { title: "Apple in China", author: "Patrick McGee" },
  { title: "The Everything Store", author: "Brad Stone" },
  { title: "Shoe Dog", author: "Phil Knight" },
  { title: "Bad Blood", author: "John Carreyrou" },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman" },
  { title: "Fooled by Randomness", author: "Nassim Nicholas Taleb" },
  { title: "The Black Swan", author: "Nassim Nicholas Taleb" },
  { title: "Superforecasting", author: "Philip E. Tetlock" },
  { title: "Scale", author: "Geoffrey West" },
  { title: "Sapiens", author: "Yuval Noah Harari" },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function findCover(title: string, author: string): Promise<string | null> {
  const url =
    "https://openlibrary.org/search.json?" +
    new URLSearchParams({
      title,
      author,
      limit: "5",
      fields: "title,author_name,cover_i,editions",
    }).toString();
  const res = await fetch(url, { headers: { "User-Agent": "TheWrap/1.0 (book covers)" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${title}`);
  const data = (await res.json()) as {
    docs?: { cover_i?: number; title?: string }[];
  };
  const doc = data.docs?.find((d) => typeof d.cover_i === "number");
  if (!doc?.cover_i) return null;
  return `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
}

async function main() {
  const out: Record<string, string> = {};
  for (const b of BOOKS) {
    try {
      const cover = await findCover(b.title, b.author);
      if (cover) {
        out[b.title] = cover;
        console.log(`✓ ${b.title} -> ${cover}`);
      } else {
        console.log(`✗ ${b.title} (no cover found)`);
      }
    } catch (e) {
      console.log(`! ${b.title} — ${(e as Error).message}`);
    }
    await sleep(400); // be polite to the API
  }
  const path = resolve(process.cwd(), "src/data/book-covers.json");
  writeFileSync(path, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nWrote ${Object.keys(out).length}/${BOOKS.length} covers to ${path}`);
}

main();
