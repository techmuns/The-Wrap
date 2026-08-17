import type { LucideIcon } from "lucide-react";
import {
  Rocket,
  Newspaper,
  LineChart,
  GraduationCap,
  Bookmark,
  Mic,
  BookOpen,
  Layers,
  Sparkles,
  Compass,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Short one-line description used on placeholder / landing pages. */
  description?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

/**
 * Left-sidebar information architecture. Mirrors the reference newsletter's
 * navigation shape (a collapsible "Content & Learning" group + two top-level
 * items). Labels/branding are our own; only the structure is shared.
 */
export const contentGroup: NavGroup = {
  label: "Content & Learning",
  items: [
    {
      href: "/",
      label: "Getting Started",
      icon: Rocket,
      description: "What The Wrap is, how to read it, and where to begin.",
    },
    {
      href: "/blog",
      label: "Blog",
      icon: Newspaper,
      description: "The weekly issue — our digest of the Indian stock market.",
    },
    {
      href: "/data-tools",
      label: "Data Tools",
      icon: LineChart,
      description: "Live market-data trackers behind each weekly section.",
    },
    {
      href: "/courses",
      label: "Courses",
      icon: GraduationCap,
      description: "Structured lessons on markets, investing and analysis.",
    },
    {
      href: "/curated",
      label: "Curated",
      icon: Bookmark,
      description: "Hand-picked external reading worth your time.",
    },
    {
      href: "/interviews",
      label: "Management Interviews",
      icon: Mic,
      description: "Notes and takeaways from management commentary.",
    },
    {
      href: "/books",
      label: "Books",
      icon: BookOpen,
      description: "A reading list for investors, with our notes.",
    },
    {
      href: "/primers",
      label: "Industry Primers",
      icon: Layers,
      description: "Sector deep-dives explaining how industries work.",
    },
  ],
};

export const topLevelNav: NavItem[] = [
  {
    href: "/ask",
    label: "Ask AI",
    icon: Sparkles,
    description:
      "An assistant to ask questions about this week's market. Persona and name to be finalised.",
  },
  {
    href: "/beas",
    label: "Beas",
    icon: Compass,
    description: "Section to be defined.",
  },
];

/** Flat list of every nav destination, for lookups. */
export const allNav: NavItem[] = [...contentGroup.items, ...topLevelNav];
