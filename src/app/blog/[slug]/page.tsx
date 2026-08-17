import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { IssueArticle } from "@/components/blog/IssueArticle";
import { getIssue, getIssueSlugs } from "@/content/issues";

export function generateStaticParams() {
  return getIssueSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = getIssue(slug);
  if (!issue) return { title: "Issue not found — The Wrap" };
  return { title: `${issue.title} — The Wrap`, description: issue.dek };
}

export default async function IssuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = getIssue(slug);
  if (!issue) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All issues
      </Link>
      <IssueArticle issue={issue} />
    </div>
  );
}
