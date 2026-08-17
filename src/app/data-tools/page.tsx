import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  Landmark,
  Megaphone,
  Factory,
  PackageCheck,
  Handshake,
  PhoneCall,
  Coins,
  Activity,
  Shuffle,
  Gauge,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

const trackers = [
  {
    href: "/data-tools/insider-trades",
    label: "Buying & Selling",
    icon: Landmark,
    description: "Promoter & insider trades, ranked by value.",
  },
  {
    href: "/data-tools/bulk-block-deals",
    label: "Bulk & Block Deals",
    icon: TrendingUp,
    description: "Large bulk, block & short deals on the exchange.",
  },
  {
    href: "/data-tools/announcements",
    label: "Announcements",
    icon: Megaphone,
    description: "All corporate filings — Capex, Order Wins, Acquisitions & more, tagged by category.",
  },
  {
    href: "/data-tools/capex",
    label: "Capex & New Ventures",
    icon: Factory,
    description: "Capacity expansion & new-venture filings.",
  },
  {
    href: "/data-tools/order-wins",
    label: "Order Wins",
    icon: PackageCheck,
    description: "New order & contract wins.",
  },
  {
    href: "/data-tools/acquisitions",
    label: "Acquisitions",
    icon: Handshake,
    description: "M&A and stake acquisitions.",
  },
  {
    href: "/data-tools/concalls",
    label: "Concalls",
    icon: PhoneCall,
    description: "Recent & upcoming earnings / investor calls.",
  },
  {
    href: "/data-tools/corporate-actions",
    label: "Corporate Actions",
    icon: Coins,
    description: "Bonus, buyback, split, rights & dividends.",
  },
];

const planned = [
  {
    label: "Market Breadth",
    icon: Activity,
    description: "Sector × EMA breadth heatmap.",
  },
  {
    label: "Sector Rotation",
    icon: Shuffle,
    description: "Relative strength & rotation across sectors.",
  },
  {
    label: "Stage-2 Screener",
    icon: Gauge,
    description: "Momentum screen across listed stocks.",
  },
];

export default function DataToolsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        title="Data Tools"
        subtitle="Live market-data trackers behind each weekly section."
      />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Trackers
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {trackers.map((t) => {
            const Icon = t.icon;
            return (
              <Link key={t.href} href={t.href} className="group">
                <Card className="h-full transition-colors hover:border-foreground/30">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 font-medium">
                        {t.label}
                        <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Also planned
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {planned.map((t) => {
            const Icon = t.icon;
            return (
              <Card key={t.label} tone="pending" className="h-full">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium">{t.label}</div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Every tracker is powered by independently sourced, publicly available
        exchange &amp; filing data — no mock data.
      </p>
    </div>
  );
}
