import Link from "next/link";
import {
  ArrowRight,
  Newspaper,
  LineChart,
  GraduationCap,
  Bookmark,
  BookOpen,
  Sparkles,
  Video,
  Download,
  Bell,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ActivityPanel } from "@/components/home/ActivityPanel";
import { issues } from "@/content/issues";
import { cn } from "@/lib/cn";

type Color = "blue" | "violet" | "emerald" | "amber" | "rose" | "teal";

const COLORS: Record<Color, { grad: string; border: string; icon: string }> = {
  blue: { grad: "from-blue-500/10", border: "hover:border-blue-500/40", icon: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  violet: { grad: "from-violet-500/10", border: "hover:border-violet-500/40", icon: "bg-violet-500/15 text-violet-600 dark:text-violet-400" },
  emerald: { grad: "from-emerald-500/10", border: "hover:border-emerald-500/40", icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  amber: { grad: "from-amber-500/10", border: "hover:border-amber-500/40", icon: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  rose: { grad: "from-rose-500/10", border: "hover:border-rose-500/40", icon: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
  teal: { grad: "from-teal-500/10", border: "hover:border-teal-500/40", icon: "bg-teal-500/15 text-teal-600 dark:text-teal-400" },
};

const quickActions: { href: string; label: string; icon: typeof Newspaper; blurb: string; color: Color }[] = [
  { href: "/blog", label: "Blog", icon: Newspaper, blurb: "This week's issue", color: "blue" },
  { href: "/data-tools", label: "Data Tools", icon: LineChart, blurb: "Live market data", color: "violet" },
  { href: "/courses", label: "Courses", icon: GraduationCap, blurb: "Learn the market", color: "emerald" },
  { href: "/curated", label: "Curated", icon: Bookmark, blurb: "Worth reading", color: "amber" },
  { href: "/books", label: "Books", icon: BookOpen, blurb: "Reading list", color: "rose" },
  { href: "/ask", label: "Ask AI", icon: Sparkles, blurb: "Ask about the market", color: "teal" },
];

export default function HomePage() {
  const latest = issues[0];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        {/* Main column */}
        <div className="space-y-8">
          <PageHeader
            title="The Wrap"
            subtitle="Your weekly digest of everything important in the Indian stock market."
          />

          {/* Latest issue hero */}
          {latest && (
            <Link href={`/blog/${latest.slug}`} className="group block">
              <div className="flex gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/30">
                <div className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-chart-1/30 to-chart-3/20 sm:flex">
                  <Newspaper className="h-8 w-8 text-foreground/70" />
                </div>
                <div className="min-w-0">
                  <span className="inline-block rounded-full bg-chart-3/15 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-chart-3">
                    Latest issue
                  </span>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {latest.date} · {latest.readingTime} · By The Wrap
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-lg font-semibold leading-snug tracking-tight">
                    {latest.title}
                    <ArrowRight className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{latest.dek}</p>
                </div>
              </div>
            </Link>
          )}

          {/* Quick actions */}
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Quick actions</h2>
            <p className="mb-3 text-sm text-muted-foreground">Jump to a section.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {quickActions.map((a) => {
                const Icon = a.icon;
                const c = COLORS[a.color];
                return (
                  <Link
                    key={a.href}
                    href={a.href}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border p-5 transition-colors",
                      c.border
                    )}
                  >
                    <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent", c.grad)} />
                    <div className="relative">
                      <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", c.icon)}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="mt-3 flex items-center gap-1 font-semibold">
                        {a.label}
                        <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.blurb}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Weekly meet banner */}
          <Link
            href="/weekly-meet"
            className="group flex items-center gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/30"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-2/15 text-chart-2">
              <Video className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-medium">Weekly Meet</div>
              <p className="text-sm text-muted-foreground">
                Live weekly walk-through — next session to be scheduled.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
              View
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <p className="text-xs text-muted-foreground">
            The Wrap publishes original writing and independently sourced data.
            Nothing here is investment advice.
          </p>
        </div>

        {/* Right rail */}
        <aside className="space-y-6">
          <ActivityPanel />

          <div className="rounded-xl border bg-card p-5">
            <h2 className="text-sm font-semibold tracking-tight">App setup</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Coming soon.</p>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5 text-muted-foreground">
                  <Download className="h-4 w-4" />
                  Install app
                </span>
                <span className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  Soon
                </span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5 text-muted-foreground">
                  <Bell className="h-4 w-4" />
                  Notifications
                </span>
                <span className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  Soon
                </span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
