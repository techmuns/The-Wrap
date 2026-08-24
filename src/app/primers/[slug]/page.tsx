import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, Building2, Clock } from "lucide-react";
import { getPrimer, getPrimerSlugs } from "@/content/primers";

export function generateStaticParams() {
  return getPrimerSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const primer = getPrimer(slug);
  return {
    title: primer ? `${primer.title} — Industry Primer — The Wrap` : "Primer not found — The Wrap",
    description: primer?.dek,
  };
}

export default async function PrimerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const primer = getPrimer(slug);
  if (!primer) notFound();

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/primers"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All primers
      </Link>

      <header className="space-y-3 border-b pb-6">
        <span className="inline-block rounded-full border bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          {primer.category}
        </span>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight">
          {primer.title}
        </h1>
        <p className="text-lg text-foreground/80">{primer.dek}</p>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {primer.readingTime}
        </div>
      </header>

      <div className="space-y-8">
        {primer.sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>
            {section.body.map((para, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-foreground/85">
                {para}
              </p>
            ))}
          </section>
        ))}
      </div>

      <section className="space-y-4 rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-foreground">
            <Building2 className="h-4 w-4" />
          </span>
          <h2 className="text-lg font-semibold tracking-tight">Key listed players</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          A starting map of the listed names in this space — not a buy list, and
          not exhaustive.
        </p>
        <ul className="divide-y">
          {primer.players.map((p) => (
            <li key={p.name} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-3">
              <span className="font-medium">{p.name}</span>
              <span className="text-sm text-muted-foreground">{p.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-xl border border-chart-3/40 bg-chart-3/10 p-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-chart-3" />
          <h2 className="text-lg font-semibold tracking-tight">Key risks to weigh</h2>
        </div>
        <ul className="space-y-2">
          {primer.risks.map((r) => (
            <li key={r} className="flex gap-2 text-[15px] text-foreground/85">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-chart-3" />
              {r}
            </li>
          ))}
        </ul>
      </section>

      <p className="border-t pt-6 text-xs text-muted-foreground">
        Original explainer written from publicly-available industry knowledge.
        Informational only — this is not investment advice. Do your own research.
      </p>
    </article>
  );
}
