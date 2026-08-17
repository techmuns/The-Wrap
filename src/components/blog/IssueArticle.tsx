import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import type { Issue } from "@/types/issue";

export function IssueArticle({ issue }: { issue: Issue }) {
  return (
    <article className="space-y-8">
      <header className="space-y-2 border-b pb-6">
        <div className="text-sm text-muted-foreground">
          {issue.date} · {issue.readingTime}
        </div>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight">
          {issue.title}
        </h1>
        <p className="text-lg text-foreground/80">{issue.dek}</p>
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
