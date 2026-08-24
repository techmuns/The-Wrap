import type { Book } from "@/types/library";

/**
 * Our curated reading list — all real, widely-available books. This is our own
 * selection (not copied from anywhere); edit freely. No invented ratings; a
 * "must-read" flag marks the handful we'd start with.
 */
export const books: Book[] = [
  // Fundamentals / investing
  { title: "The Intelligent Investor", author: "Benjamin Graham", category: "Fundamentals", note: "The classic on value investing and margin of safety.", mustRead: true, topics: ["Value Investing", "Investing Process"] },
  { title: "Common Stocks and Uncommon Profits", author: "Philip Fisher", category: "Fundamentals", note: "The growth-investing companion to Graham.", topics: ["Growth Investing"] },
  { title: "One Up on Wall Street", author: "Peter Lynch", category: "Fundamentals", note: "Invest in what you know, from a legendary fund manager.", mustRead: true, topics: ["Stock Picking", "Investing Skills"] },
  { title: "The Little Book That Still Beats the Market", author: "Joel Greenblatt", category: "Fundamentals", note: "A simple, mechanical value formula, clearly explained.", topics: ["Value Investing"] },
  { title: "Poor Charlie's Almanack", author: "Charlie Munger", category: "Fundamentals", note: "Mental models and multidisciplinary thinking.", topics: ["Mental Models"] },
  { title: "The Psychology of Money", author: "Morgan Housel", category: "Fundamentals", note: "How behaviour, not maths, drives investing outcomes.", mustRead: true, topics: ["Behavioral Finance", "Personal Finance"] },
  { title: "The Most Important Thing", author: "Howard Marks", category: "Fundamentals", note: "Risk, cycles and second-level thinking.", topics: ["Risk Management", "Cycles"] },

  // Technical analysis / trading
  { title: "How to Make Money in Stocks", author: "William O'Neil", category: "Technical Analysis", note: "The CAN SLIM method — the origin of momentum investing.", mustRead: true, topics: ["Momentum", "Investing Skills"] },
  { title: "Trade Like a Stock Market Wizard", author: "Mark Minervini", category: "Technical Analysis", note: "A modern, disciplined take on momentum and risk.", topics: ["Momentum", "Risk Management"] },
  { title: "Stan Weinstein's Secrets for Profiting in Bull and Bear Markets", author: "Stan Weinstein", category: "Technical Analysis", note: "The stage-analysis framework behind our Momentum screen.", topics: ["Stage Analysis", "Momentum"] },
  { title: "Technical Analysis of the Financial Markets", author: "John J. Murphy", category: "Technical Analysis", note: "The standard reference for chart-based analysis.", topics: ["Technical Analysis"] },
  { title: "Reminiscences of a Stock Operator", author: "Edwin Lefèvre", category: "Technical Analysis", note: "Timeless trading psychology, thinly veiled as a novel.", topics: ["Trading Psychology"] },
  { title: "Market Wizards", author: "Jack D. Schwager", category: "Technical Analysis", note: "Interviews with top traders on how they actually think.", topics: ["Trading Psychology"] },

  // Industry / business
  { title: "Chip War", author: "Chris Miller", category: "Industry", note: "How semiconductors became the world's most critical technology.", mustRead: true, topics: ["Semiconductors", "Geopolitics"] },
  { title: "Apple in China", author: "Patrick McGee", category: "Industry", note: "How Apple's supply chain reshaped a superpower.", topics: ["Supply Chain", "Tech"] },
  { title: "The Everything Store", author: "Brad Stone", category: "Industry", note: "The definitive story of Amazon and Jeff Bezos.", topics: ["E-commerce", "Tech"] },
  { title: "Shoe Dog", author: "Phil Knight", category: "Industry", note: "The founding of Nike — a candid entrepreneurial memoir.", topics: ["Entrepreneurship"] },
  { title: "Bad Blood", author: "John Carreyrou", category: "Industry", note: "The Theranos fraud — a masterclass in due diligence.", topics: ["Fraud", "Due Diligence"] },

  // Knowledge base / thinking
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", category: "Knowledge Base", note: "The biases that quietly wreck investment decisions.", mustRead: true, topics: ["Behavioral Finance", "Biases"] },
  { title: "Fooled by Randomness", author: "Nassim Nicholas Taleb", category: "Knowledge Base", note: "How luck masquerades as skill in markets.", topics: ["Probability", "Risk Management"] },
  { title: "The Black Swan", author: "Nassim Nicholas Taleb", category: "Knowledge Base", note: "On rare, high-impact events and fragile forecasts.", topics: ["Risk Management", "Uncertainty"] },
  { title: "Superforecasting", author: "Philip E. Tetlock", category: "Knowledge Base", note: "What separates people who predict well from the rest.", topics: ["Forecasting", "Decision Making"] },
  { title: "Scale", author: "Geoffrey West", category: "Knowledge Base", note: "The universal laws behind companies, cities and growth.", topics: ["Systems", "Big Ideas"] },
  { title: "Sapiens", author: "Yuval Noah Harari", category: "Knowledge Base", note: "The big-picture story of humankind and its economies.", topics: ["History", "Big Ideas"] },
];
