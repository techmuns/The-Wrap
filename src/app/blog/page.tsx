import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { issues } from "@/content/issues";

export const metadata = {
  title: "Blog — The Wrap",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Blog"
        subtitle="The weekly issue — our digest of the Indian stock market."
      />

      <div className="space-y-4">
        {issues.map((issue) => (
          <Link
            key={issue.slug}
            href={`/blog/${issue.slug}`}
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
    </div>
  );
}
