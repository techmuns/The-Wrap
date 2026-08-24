import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Rss,
  Tv,
  Library,
  Layers,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Short one-line description used on placeholder / landing pages. */
  description?: string;
  /** External destination (opens in a new tab). */
  external?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

/**
 * Left-sidebar navigation, grouped. The Wrap is a free market-data terminal:
 * our own weekly issue plus live, independently sourced exchange data — no paid
 * course or paywalled sections.
 */
export const navGroups: NavGroup[] = [
  {
    label: "Content & Learning",
    items: [
      {
        href: "/",
        label: "Getting Started",
        icon: LayoutDashboard,
        description: "What The Wrap is, how to read it, and where to begin.",
      },
      {
        href: "/blog",
        label: "Blog",
        icon: BookOpen,
        description: "Our free weekly digest of the Indian stock market.",
      },
      {
        href: "/data-tools",
        label: "Data Tools",
        icon: BarChart3,
        description: "Live, free market-data trackers — the heart of The Wrap.",
      },
      {
        href: "/curated",
        label: "Curated",
        icon: Rss,
        description: "Hand-picked videos and explainers worth your time.",
      },
      {
        href: "/interviews",
        label: "Management Interviews",
        icon: Tv,
        description: "Hear listed-company management in their own words.",
      },
      {
        href: "/books",
        label: "Books",
        icon: Library,
        description: "A curated reading list for investors — our picks.",
      },
      {
        href: "/primers",
        label: "Industry Primers",
        icon: Layers,
        description: "How industries work — from first principles to listed players.",
      },
      {
        href: "/ask",
        label: "Ask AI",
        icon: Sparkles,
        description:
          "Ask anything about the Indian market — searches the web and recent filings.",
      },
    ],
  },
  {
    label: "Indicators",
    items: [
      {
        href: "/indicators",
        label: "TradingView Indicators",
        icon: TrendingUp,
        description: "Our TradingView charting indicators and how to use them.",
      },
    ],
  },
];

/** Back-compat: the first (main) group. */
export const contentGroup: NavGroup = navGroups[0];

/** Flat list of every nav destination, for lookups. */
export const allNav: NavItem[] = navGroups.flatMap((g) => g.items);
