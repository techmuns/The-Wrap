import type { InterviewSource } from "@/types/interview";

/**
 * Where to hear listed-company management in their own words — all from free,
 * publicly-available sources. TV and podcast links open a YouTube search so they
 * always resolve; earnings-call links point to the free primary sources. We are
 * not affiliated with any of these outlets.
 */
const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

export const interviews: InterviewSource[] = [
  // Business TV — results-day and event interviews with CEOs/CFOs
  { title: "Management interviews", by: "CNBC-TV18", category: "Business TV", note: "Results-day conversations with Indian CEOs, CFOs and MDs.", url: yt("CNBC-TV18 management interview") },
  { title: "Management interviews", by: "ET Now", category: "Business TV", note: "CEO/CFO interviews around earnings and big announcements.", url: yt("ET Now management interview") },
  { title: "Corporate interviews", by: "Zee Business", category: "Business TV", note: "Hindi-first interviews with promoters and management.", url: yt("Zee Business management interview") },
  { title: "Management chats", by: "NDTV Profit", category: "Business TV", note: "Post-results and strategy interviews (formerly BQ Prime).", url: yt("NDTV Profit management interview") },
  { title: "Company management", by: "Moneycontrol", category: "Business TV", note: "Short, focused interviews clipped by topic.", url: yt("Moneycontrol management interview") },

  // Long-form & founders — the unhurried, in-depth conversations
  { title: "WTF is", by: "Nikhil Kamath", category: "Long-Form & Founders", note: "Long, candid sit-downs with founders and business leaders.", url: yt("WTF is with Nikhil Kamath founder") },
  { title: "Figuring Out", by: "Raj Shamani", category: "Long-Form & Founders", note: "Founder and CEO interviews on building Indian businesses.", url: yt("Figuring Out Raj Shamani founder") },
  { title: "Founder & CEO stories", by: "Forbes India", category: "Long-Form & Founders", note: "Profiles and interviews with Indian business leaders.", url: yt("Forbes India CEO interview") },
  { title: "Founder interviews", by: "YourStory", category: "Long-Form & Founders", note: "Startup and SME founders on how they built their companies.", url: yt("YourStory founder interview") },

  // Earnings calls — management's own words, unfiltered (primary sources)
  { title: "Concall transcripts & notes", by: "Screener.in", category: "Earnings Calls", note: "Free earnings-call transcripts linked on every listed company's page.", url: "https://www.screener.in" },
  { title: "Corporate announcements & transcripts", by: "BSE India", category: "Earnings Calls", note: "Companies file concall transcripts and investor presentations here.", url: "https://www.bseindia.com/corporates/ann.html" },
  { title: "Corporate filings", by: "NSE India", category: "Earnings Calls", note: "Official announcements, transcripts and investor decks.", url: "https://www.nseindia.com/companies-listing/corporate-filings-announcements" },
];
