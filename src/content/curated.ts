import type { CuratedItem } from "@/types/library";

/**
 * Hand-picked, publicly-available video creators worth your time. These are our
 * own picks of real, well-known channels. Each link is a YouTube search for the
 * creator/topic so it always resolves — swap in an exact video URL any time.
 */
const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

export const curated: CuratedItem[] = [
  // Expert views
  { title: "Valuation lectures & session notes", by: "Aswath Damodaran", category: "Expert Views", note: "The 'Dean of Valuation' — how to actually value a company.", url: yt("Aswath Damodaran valuation") },
  { title: "Evidence-based investing", by: "Ben Felix / Rational Reminder", category: "Expert Views", note: "What the research really says about beating the market.", url: yt("Ben Felix common sense investing") },
  { title: "Markets, macro & manias", by: "Patrick Boyle", category: "Expert Views", note: "A former hedge-fund manager explains finance with dry wit.", url: yt("Patrick Boyle finance") },

  // Investing skills
  { title: "Investing, explained simply", by: "The Plain Bagel", category: "Investing Skills", note: "Clear fundamentals for newer investors.", url: yt("The Plain Bagel investing") },
  { title: "Markets & Varsity", by: "Zerodha", category: "Investing Skills", note: "India-focused basics on markets and trading.", url: yt("Zerodha Varsity markets") },
  { title: "How money & markets work", by: "Money & Macro", category: "Investing Skills", note: "Macroeconomics made watchable.", url: yt("Money and Macro") },

  // Industry deep dives
  { title: "The economics of industries", by: "Modern MBA", category: "Industry Deep Dives", note: "How specific businesses actually make money.", url: yt("Modern MBA business economics") },
  { title: "How the world is built", by: "Wendover Productions", category: "Industry Deep Dives", note: "Logistics, airlines, supply chains and infrastructure.", url: yt("Wendover Productions logistics") },
  { title: "Industry & company documentaries", by: "Bloomberg Originals", category: "Industry Deep Dives", note: "Well-produced deep dives on sectors and firms.", url: yt("Bloomberg Originals documentary") },

  // Company deep dives
  { title: "Company breakdowns", by: "Wall Street Millennial", category: "Company Deep Dives", note: "Sceptical takes on individual companies and their numbers.", url: yt("Wall Street Millennial company analysis") },
  { title: "Business case studies", by: "CNBC", category: "Company Deep Dives", note: "How big companies rise, stumble and adapt.", url: yt("CNBC business documentary company") },
  { title: "Tech & founder stories", by: "Acquired (podcast)", category: "Company Deep Dives", note: "Long, deep histories of great companies.", url: yt("Acquired podcast company history") },
];
