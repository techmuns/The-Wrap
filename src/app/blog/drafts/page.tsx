import Link from "next/link";
import { ArrowRight, FileEdit } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { drafts } from "@/content/drafts";

export const metadata = {
  title: "Draft issues — The Wrap",
  robots: { index: false, follow: false },
};

export default function DraftsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Draft issues"
        subtitle="Auto-generated weekly drafts, assembled from the live data feeds. Review, edit the commentary, then publish."
      />

      <div className="flex items-start gap-2 rounded-md border border-chart-3/40 bg-chart-3/10 px-4 py-3 text-sm">
        <FileEdit className="mt-0.5 h-4 w-4 shrink-0 text-chart-3" />
        <p className="text-foreground/80">
          These are unpublished drafts. Data-driven sections are filled from the
          feeds; the commentary marked{" "}
          <span className="font-medium">[DRAFT — write this]</span> is for a human
          to write before promoting the issue to the published Blog.
        </p>
      </div>

      {drafts.length === 0 ? (
        <Card tone="pending">
          <p className="text-sm text-muted-foreground">
            No drafts yet. Run{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              npm run build:weekly-issue
            </code>{" "}
            to generate this week&apos;s draft from the live feeds.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {drafts.map((issue) => (
            <Link
              key={issue.slug}
              href={`/blog/drafts/${issue.slug}`}
              className="group block"
            >
              <Card className="transition-colors hover:border-foreground/30">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {issue.date} · {issue.readingTime}
                  </div>
                  <div className="flex items-center gap-1 text-lg font-semibold tracking-tight">
                    {issue.title}
                    <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="text-sm text-muted-foreground">{issue.dek}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
