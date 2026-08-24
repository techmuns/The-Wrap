import type { LucideIcon } from "lucide-react";
import { Rocket, Newspaper, LineChart, Sparkles, BookOpen, Bookmark, Activity, MessagesSquare, Layers, Mic } from "lucide-react";

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
 * Left-sidebar navigation. The Wrap is a free market-data terminal: our own
 * weekly issue plus live, independently sourced exchange data — no paid course
 * or content sections.
 */
export const contentGroup: NavGroup = {
  label: "Menu",
  items: [
    {
      href: "/",
      label: "Getting Started",
      icon: Rocket,
      description: "What The Wrap is, how to read it, and where to begin.",
    },
    {
      href: "/blog",
      label: "Weekly Issue",
      icon: Newspaper,
      description: "Our free weekly digest of the Indian stock market.",
    },
    {
      href: "/data-tools",
      label: "Data Tools",
      icon: LineChart,
      description: "Live, free market-data trackers — the heart of The Wrap.",
    },
    {
      href: "/books",
      label: "Books",
      icon: BookOpen,
      description: "A curated reading list for investors — our picks.",
    },
    {
      href: "/curated",
      label: "Curated",
      icon: Bookmark,
      description: "Hand-picked videos and explainers worth your time.",
    },
    {
      href: "/primers",
      label: "Industry Primers",
      icon: Layers,
      description: "How industries work — from first principles to listed players.",
    },
    {
      href: "/interviews",
      label: "Management Interviews",
      icon: Mic,
      description: "Notable management commentary and interviews.",
    },
    {
      href: "/indicators",
      label: "Indicators",
      icon: Activity,
      description: "Our TradingView charting indicators and how to use them.",
    },
    {
      href: "/community",
      label: "Community",
      icon: MessagesSquare,
      description: "Join fellow readers to discuss the week's market.",
    },
    {
      href: "/ask",
      label: "Ask AI",
      icon: Sparkles,
      description:
        "An assistant to ask questions about this week's market. Coming soon.",
    },
  ],
};

/** Flat list of every nav destination, for lookups. */
export const allNav: NavItem[] = [...contentGroup.items];
