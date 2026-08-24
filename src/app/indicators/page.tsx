import { Activity, ExternalLink, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = {
  title: "Indicators — The Wrap",
};

// TODO: once the indicator is published, drop its TradingView URL here.
const TRADINGVIEW_URL = "";

// Planned features of our own charting indicator (original — not copied).
const planned = [
  "Trend-stage detection (basing / advancing / topping / declining)",
  "Relative-strength rating vs the broad market",
  "50 & 200-day moving-average alignment",
  "Distance-from-average tracking",
  "Volume-health check",
  "Momentum score",
  "Multi-timeframe support",
  "Configurable alerts",
];

export default function IndicatorsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        title="Indicators"
        subtitle="Our own TradingView charting indicators — free to add to your charts."
      />

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-chart-2/15 text-chart-2">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <div className="font-semibold">Stage &amp; Momentum indicator</div>
              <p className="text-sm text-muted-foreground">
                A single overlay that shows a stock&apos;s trend stage, relative strength and momentum.
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border px-3 py-1.5 text-xs uppercase tracking-wide text-muted-foreground">
            In development
          </span>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {planned.map((f) => (
            <div key={f} className="flex items-start gap-2 text-sm text-foreground/80">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-chart-2/70" />
              {f}
            </div>
          ))}
        </div>

        {TRADINGVIEW_URL && (
          <a
            href={TRADINGVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
          >
            View on TradingView
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        This will be our own original indicator (written from scratch, not copied
        from anyone). Once it&apos;s published on TradingView, its link and guide
        appear here.
      </p>
    </div>
  );
}
