import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Issue, TableCell } from "@/types/issue";

/** Green (positive) / red (negative) heat background for a table cell. */
function heatStyle(cell: TableCell): React.CSSProperties {
  if (cell.value == null) return {};
  const scale = cell.scale ?? 3;
  const t = Math.min(Math.abs(cell.value) / scale, 1);
  const alpha = (0.14 + t * 0.5).toFixed(2);
  const rgb = cell.value >= 0 ? "34,197,94" : "239,68,68";
  return { backgroundColor: `rgba(${rgb},${alpha})` };
}

/** Colour signed percentages (+1.2% green, -0.4% red) inside a string. */
function Coloured({ text }: { text: string }) {
  const parts = text.split(/([+-]\d[\d,]*(?:\.\d+)?%)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^[+-]\d[\d,]*(?:\.\d+)?%$/.test(p) ? (
          <span key={i} className={p.startsWith("+") ? "font-semibold text-positive" : "font-semibold text-negative"}>
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

/** Per-section coloured band (emoji + colour), styled like the reference report. */
const SECTION_STYLE: Record<string, { emoji: string; band: string }> = {
  summary: { emoji: "📝", band: "bg-chart-1" },
  breadth: { emoji: "📊", band: "bg-chart-5" },
  sectors: { emoji: "🔁", band: "bg-chart-4" },
  movers: { emoji: "🔥", band: "bg-chart-3" },
  insider: { emoji: "💼", band: "bg-chart-2" },
  deals: { emoji: "🪙", band: "bg-foreground" },
  announcements: { emoji: "📣", band: "bg-chart-6" },
  concalls: { emoji: "🎙️", band: "bg-chart-9" },
  "corporate-actions": { emoji: "🏦", band: "bg-chart-10" },
};

const DEFAULT_STYLE = { emoji: "•", band: "bg-chart-1" };

export function IssueArticle({ issue }: { issue: Issue }) {
  return (
    <article className="space-y-8">
      <header className="space-y-5">
        {/* Branded masthead */}
        <div className="report-color flex items-center justify-center gap-3 rounded-xl bg-[#0b1220] py-7 text-white">
          <span className="text-3xl leading-none" aria-hidden>
            🌯
          </span>
          <span className="text-2xl font-extrabold tracking-[0.3em]">THE WRAP</span>
        </div>

        {issue.image && (
          <div className="overflow-hidden rounded-2xl border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={issue.image} alt={issue.title} className="max-h-[420px] w-full object-cover" />
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

      {issue.sections.map((section) => {
        const style = SECTION_STYLE[section.id] ?? DEFAULT_STYLE;
        const onDark = style.band === "bg-foreground";
        return (
          <section key={section.id} className="space-y-3 print:break-inside-avoid">
            {/* Coloured section band */}
            <div
              className={`report-color flex items-center gap-2.5 rounded-lg px-4 py-2.5 ${style.band} ${
                onDark ? "text-background" : "text-white"
              }`}
            >
              <span className="text-lg leading-none" aria-hidden>
                {style.emoji}
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wide">{section.title}</h2>
            </div>

            <div className="space-y-3 px-1">
              {section.body?.map((para, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-foreground/90">
                  <Coloured text={para} />
                </p>
              ))}

              {section.table && (
                <figure className="space-y-2">
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full min-w-[440px] border-collapse text-sm">
                      <thead>
                        <tr className="bg-muted/60">
                          {section.table.columns.map((col, ci) => (
                            <th
                              key={ci}
                              className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground ${
                                ci === 0 ? "text-left" : "text-right"
                              }`}
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, ri) => (
                          <tr key={ri} className="border-t">
                            <td className="px-3 py-1.5 font-medium">{row.label}</td>
                            {row.cells.map((cell, ci) => (
                              <td
                                key={ci}
                                className="report-color tabular px-3 py-1.5 text-right"
                                style={heatStyle(cell)}
                              >
                                {cell.text}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {section.table.caption && (
                    <figcaption className="text-xs text-muted-foreground">
                      {section.table.caption}
                    </figcaption>
                  )}
                </figure>
              )}

              {section.groups?.map((group, gi) => (
                <div key={gi} className="space-y-1.5">
                  {group.heading && (
                    <h3 className="text-sm font-semibold text-foreground">{group.heading}</h3>
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
                        <span><Coloured text={item.text} /></span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {section.link && (
                <Link
                  href={section.link.href}
                  className="no-print inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Open {section.link.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}

              {section.note && (
                <p className="text-xs text-muted-foreground">{section.note}</p>
              )}
            </div>
          </section>
        );
      })}

      <footer className="space-y-2 border-t pt-6 text-xs leading-relaxed text-muted-foreground print:break-inside-avoid">
        <p className="font-semibold text-foreground">Disclaimer</p>
        <p>
          This report is for informational purposes only and is not investment
          advice. It is compiled automatically from publicly available,
          independently sourced market data; while we aim for accuracy, we cannot
          guarantee its completeness or reliability.
        </p>
        <p>
          Investing in securities carries risk. Do your own research or consult a
          qualified financial adviser before making any decision. The Wrap is not
          liable for any loss arising from reliance on this report.
        </p>
      </footer>
    </article>
  );
}
