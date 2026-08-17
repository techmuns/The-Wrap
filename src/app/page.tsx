import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { contentGroup, topLevelNav } from "@/lib/nav";

export default function HomePage() {
  const sections = [
    ...contentGroup.items.filter((item) => item.href !== "/"),
    ...topLevelNav,
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        title="The Wrap"
        subtitle="Your weekly digest of everything important in the Indian stock market."
      />

      <Card>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            The Wrap is a weekly read on the Indian stock market — what moved,
            what changed, and what deserves your attention. Each issue distills
            market breadth, insider and institutional activity, and the week&apos;s
            noteworthy corporate announcements into one place.
          </p>
          <p>
            New here? The <span className="font-medium text-foreground">Blog</span>{" "}
            holds every weekly issue. <span className="font-medium text-foreground">Data Tools</span>{" "}
            powers the numbers behind it — live trackers for insider trades, bulk
            &amp; block deals, and corporate filings. <span className="font-medium text-foreground">Courses</span>,{" "}
            <span className="font-medium text-foreground">Books</span> and{" "}
            <span className="font-medium text-foreground">Industry Primers</span>{" "}
            are there when you want to go deeper.
          </p>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Explore
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="group">
                <Card className="h-full transition-colors hover:border-foreground/30">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 font-medium">
                        {item.label}
                        <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        The Wrap publishes original writing and independently sourced data.
        Nothing here is investment advice.
      </p>
    </div>
  );
}
