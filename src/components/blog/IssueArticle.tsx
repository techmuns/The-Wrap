import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Newspaper, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Issue } from "@/types/issue";

export function IssueArticle({ issue }: { issue: Issue }) {
  return (
    <article className="space-y-8">
      <header className="space-y-5">
        {/* Banner */}
        {issue.image ? (
          <div className="overflow-hidden rounded-2xl border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={issue.image} alt={issue.title} className="max-h-[420px] w-full object-cover" />
          </div>
        ) : (
          <div className="flex min-h-[180px] items-center justify-center overflow-hidden rounded-2xl border bg-gradient-to-br from-chart-1/25 via-chart-4/15 to-chart-3/20 sm:min-h-[240px]">
            <Newspaper className="h-14 w-14 text-foreground/40" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="featured">Featured</Badge>
          <Badge variant="free">Free</Badge>
        </div>

        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {issue.title}
        </h1>

        <p className="border-l-4 border-primary pl-4 text-lg text-muted-foreground">
          {issue.dek}
        </p>

        {/* Author row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y py-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-4 text-xs font-bold text-primary-foreground">
              W
            </span>
            <span className="font-medium text-foreground">The Wrap</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            {issue.date}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {issue.readingTime}
          </span>
        </div>
      </header>

      {issue.sections.map((section) => (
        <section key={section.id} className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            {section.title}
          </h2>

          {section.body?.map((para, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-foreground/90">
              {para}
            </p>
          ))}

          {section.groups?.map((group, gi) => (
            <div key={gi} className="space-y-1.5">
              {group.heading && (
                <h3 className="text-sm font-medium text-muted-foreground">
                  {group.heading}
                </h3>
              )}
              <ul className="space-y-1.5">
                {group.items.map((item, ii) => (
                  <li key={ii} className="flex items-start gap-2 text-[15px]">
                    {item.starred ? (
                      <Star
                        className="mt-1 h-3.5 w-3.5 shrink-0 fill-current text-chart-3"
                        aria-label="must read"
                      />
                    ) : (
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                    )}
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {section.link && (
            <Link
              href={section.link.href}
              className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
            >
              Open {section.link.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}

          {section.note && (
            <p className="text-xs text-muted-foreground">{section.note}</p>
          )}
        </section>
      ))}

      <footer className="border-t pt-6 text-xs leading-relaxed text-muted-foreground">
        The Wrap publishes original writing and independently sourced data. This
        is informational only, not investment advice — do your own research.
      </footer>
    </article>
  );
}
