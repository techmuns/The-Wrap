import { Activity, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = {
  title: "Indicators — The Wrap",
};

const features = [
  "Trend-stage detection (basing / advancing / topping / declining)",
  "Relative strength vs a benchmark (default NIFTY)",
  "50 & 200-day moving-average alignment",
  "Momentum (rate-of-change) reading",
  "Volume-health check",
  "On-chart status table + entry/exit alerts",
];

// Our own original Pine Script (v6). Free to copy into TradingView.
const PINE = `//@version=6
indicator("The Wrap — Stage & Momentum", shorttitle="Wrap S&M", overlay=true)

// ---- inputs ----
maFast  = input.int(50,  "Fast MA (days)")
maSlow  = input.int(200, "Slow MA (days)")
trendLn = input.int(150, "Trend MA (~30 weeks)")
benchSym= input.symbol("NSE:NIFTY", "Relative-strength benchmark")
momLen  = input.int(63,  "Momentum lookback (days)")
volLen  = input.int(50,  "Volume average (days)")

// ---- moving averages ----
emaFast = ta.ema(close, maFast)
emaSlow = ta.ema(close, maSlow)
trendMA = ta.sma(close, trendLn)
trendRising = trendMA > trendMA[10]

// ---- stage (Weinstein-style) ----
above = close > trendMA
stage = above and trendRising ? 2 : (not above and not trendRising ? 4 : (above ? 3 : 1))
stageTxt = stage == 2 ? "Stage 2 - Advancing" : stage == 4 ? "Stage 4 - Declining" : stage == 3 ? "Stage 3 - Topping" : "Stage 1 - Basing"
stageCol = stage == 2 ? color.green : stage == 4 ? color.red : color.gray

// ---- relative strength ----
bench = request.security(benchSym, timeframe.period, close)
rs = close / bench
rsRising = rs > rs[momLen]

// ---- momentum & volume ----
mom = ta.roc(close, momLen)
volAvg = ta.sma(volume, volLen)
volOk = volume > volAvg

// ---- plots ----
plot(emaFast, "Fast MA", color=color.new(color.blue, 0))
plot(emaSlow, "Slow MA", color=color.new(color.orange, 0))
plot(trendMA, "Trend MA", color=color.new(color.teal, 0), linewidth=2)
bgcolor(stage == 2 ? color.new(color.green, 92) : stage == 4 ? color.new(color.red, 92) : na)

// ---- status table ----
var table t = table.new(position.top_right, 1, 5, border_width=1)
if barstate.islast
    table.cell(t, 0, 0, stageTxt, text_color=color.white, bgcolor=stageCol)
    table.cell(t, 0, 1, "RS " + (rsRising ? "rising" : "falling"))
    table.cell(t, 0, 2, "Momentum " + str.tostring(mom, "#.#") + "%")
    table.cell(t, 0, 3, "Volume " + (volOk ? "healthy" : "light"))
    table.cell(t, 0, 4, "MA " + (emaFast > emaSlow ? "50>200" : "50<200"))

// ---- alerts ----
alertcondition(ta.crossover(close, trendMA),  "Enters uptrend",  "Price crossed above the trend MA")
alertcondition(ta.crossunder(close, trendMA), "Breaks trend",    "Price crossed below the trend MA")`;

export default function IndicatorsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        title="TradingView Indicators"
        icon="📈"
        subtitle="Our own TradingView indicator — free to copy onto your charts."
      />

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-chart-2/15 text-chart-2">
            <Activity className="h-5 w-5" />
          </span>
          <div>
            <div className="font-semibold">Stage &amp; Momentum</div>
            <p className="text-sm text-muted-foreground">
              One overlay showing a stock&apos;s trend stage, relative strength and momentum.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f} className="flex items-start gap-2 text-sm text-foreground/80">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-chart-2/70" />
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">How to add it</h2>
        <ol className="ml-5 list-decimal space-y-1 text-sm text-foreground/80">
          <li>Open any chart on TradingView and click <span className="font-medium">Pine Editor</span> (bottom panel).</li>
          <li>Delete the sample code, paste the script below, and click <span className="font-medium">Save</span>, then <span className="font-medium">Add to chart</span>.</li>
          <li>Right-click the status table → settings to change the benchmark or lengths.</li>
          <li>Pine Screener (scanning many stocks at once) needs a TradingView Premium plan.</li>
        </ol>

        <div className="overflow-x-auto rounded-lg border bg-muted/40">
          <pre className="p-4 text-xs leading-relaxed"><code>{PINE}</code></pre>
        </div>

        <p className="text-xs text-muted-foreground">
          This is our own original script (Pine v6), free to use. Written from
          scratch — verify and tweak on TradingView before relying on it; it&apos;s
          for information, not investment advice.
        </p>
      </div>
    </div>
  );
}
