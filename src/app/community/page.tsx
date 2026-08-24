import { Users, MessageSquare, TrendingUp, CalendarClock, MessagesSquare } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = {
  title: "Community — The Wrap",
};

const features = [
  { icon: Users, title: "Connect with readers", body: "Meet others following the Indian market week to week." },
  { icon: MessageSquare, title: "Real-time discussion", body: "Talk through the week's data, deals and filings as they land." },
  { icon: TrendingUp, title: "Share ideas", body: "Swap watchlists, screens and research with the community." },
  { icon: CalendarClock, title: "Events & Q&A", body: "Occasional live sessions and question threads." },
];

// TODO: replace with your real Discord invite URL to activate the button.
const DISCORD_INVITE = "";

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        title="Community"
        subtitle="Connect and stay in the loop with fellow readers of The Wrap."
      />

      <div className="flex flex-col items-start gap-4 rounded-xl border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#5865F2]/15 text-[#5865F2]">
            <MessagesSquare className="h-5 w-5" />
          </span>
          <div>
            <div className="font-semibold">Join our Discord</div>
            <p className="text-sm text-muted-foreground">A free space to discuss the market with other readers.</p>
          </div>
        </div>
        {DISCORD_INVITE ? (
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Join Discord
          </a>
        ) : (
          <span className="rounded-full border px-3 py-1.5 text-xs uppercase tracking-wide text-muted-foreground">
            Invite coming soon
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="rounded-xl border bg-card p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-foreground">
                <Icon className="h-4 w-4" />
              </span>
              <div className="mt-3 font-medium">{f.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        The community is free and open to all readers. Set up a Discord server
        and drop the invite link in and this button goes live.
      </p>
    </div>
  );
}
