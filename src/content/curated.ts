import type { CuratedItem } from "@/types/library";

/**
 * Hand-picked, publicly-available videos worth your time — our own selection of
 * real, well-known creators. Each entry is a specific real video; the thumbnail
 * and link are built from its YouTube ID. We're not affiliated with any channel.
 */
export const curated: CuratedItem[] = [
  // Investing skills
  {
    title: "Five Factor Investing with ETFs",
    by: "Ben Felix",
    category: "Investing Skills",
    note: "How the research-backed return factors translate into a real portfolio.",
    videoId: "jKWbW7Wgm0w",
    tags: ["Factor Investing", "ETFs"],
  },
  {
    title: "Intro to Investing (Guest Lecture)",
    by: "The Plain Bagel",
    category: "Investing Skills",
    note: "A clear, honest walk through the fundamentals for newer investors.",
    videoId: "wFlBrYa4nrw",
    tags: ["Basics", "Investing 101"],
  },

  // Expert views
  {
    title: "Session 1: Introduction to Valuation",
    by: "Aswath Damodaran",
    category: "Expert Views",
    note: "The 'Dean of Valuation' opens his famous NYU Stern course.",
    videoId: "znmQ7oMiQrM",
    tags: ["Valuation"],
  },
  {
    title: "The Truth About Investing",
    by: "Patrick Boyle",
    category: "Expert Views",
    note: "A former hedge-fund manager on what actually works — with dry wit.",
    videoId: "itnCadNugN8",
    tags: ["Markets", "Reality Check"],
  },

  // Industry deep dives
  {
    title: "How Airlines Decide Where to Fly",
    by: "Wendover Productions",
    category: "Industry Deep Dives",
    note: "The economics behind route planning — a masterclass in unit economics.",
    videoId: "E3jfvncofiA",
    tags: ["Airlines", "Economics"],
  },
  {
    title: "Is India Winning or Losing the Electric War?",
    by: "Think School",
    category: "Industry Deep Dives",
    note: "An India-focused breakdown of the EV opportunity and its risks.",
    videoId: "0QWC_N6Hi5s",
    tags: ["India", "EV"],
  },

  // Company deep dives
  {
    title: "The Decline of Kodak… What Happened?",
    by: "Company Man",
    category: "Company Deep Dives",
    note: "How a 100-year leader missed the digital shift — a disruption case study.",
    videoId: "eVrmFgvEnAA",
    tags: ["Kodak", "Disruption"],
  },
  {
    title: "Nokia: The Rise and Fall (Part 1)",
    by: "ColdFusion",
    category: "Company Deep Dives",
    note: "From dominance to collapse — how the mobile giant lost its lead.",
    videoId: "yyRb_4-cquc",
    tags: ["Nokia", "Mobile"],
  },
];
