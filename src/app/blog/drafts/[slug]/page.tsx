import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileEdit } from "lucide-react";
import { IssueArticle } from "@/components/blog/IssueArticle";
import { getDraft, getDraftSlugs } from "@/content/drafts";

export function generateStaticParams() {
  return getDraftSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = getDraft(slug);
  return {
    title: issue ? `Draft: ${issue.date} — The Wrap` : "Draft not found — The Wrap",
    robots: { index: false, follow: false },
  };
}

export default async function DraftIssuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = getDraft(slug);
  if (!issue) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/blog/drafts"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All drafts
      </Link>

      <div className="flex items-start gap-2 rounded-md border border-chart-3/40 bg-chart-3/10 px-4 py-3 text-sm">
        <FileEdit className="mt-0.5 h-4 w-4 shrink-0 text-chart-3" />
        <div className="text-foreground/80">
          <span className="font-medium text-foreground">Draft preview.</span> Not
          published. Data sections are filled from the live feeds; write the
          commentary marked{" "}
          <span className="font-medium">[DRAFT — write this]</span>, then promote{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            src/content/drafts/{issue.slug}.ts
          </code>{" "}
          into <code className="rounded bg-muted px-1 py-0.5 text-xs">src/content/issues/</code> to publish.
        </div>
      </div>

      <IssueArticle issue={issue} />
    </div>
  );
}
