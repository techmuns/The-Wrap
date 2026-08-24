"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowUp, ExternalLink, Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";

interface Source {
  key: string;
  title: string;
  url: string;
}

interface Turn {
  role: "user" | "assistant";
  text: string;
  sources?: Source[];
  isError?: boolean;
}

const EXAMPLES = [
  "Who is the CEO of Reliance Industries?",
  "In simple terms, what are FII and DII flows?",
  "What does it mean when a stock hits a 52-week high?",
  "Give me a simple overview of the Indian cement industry.",
];

/** Render **bold** inline, safely (no HTML injection). */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^\*\*[^*]+\*\*$/.test(p) ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

/** Minimal, safe rich-text: paragraphs, line breaks and bullet lists. */
function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).filter(Boolean);
  return (
    <div className="space-y-3">
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const isList = lines.length > 0 && lines.every((l) => /^\s*[-*•]\s+/.test(l));
        if (isList) {
          return (
            <ul key={bi} className="list-disc space-y-1 pl-5">
              {lines.map((l, li) => (
                <li key={li}>
                  <Inline text={l.replace(/^\s*[-*•]\s+/, "")} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi} className="leading-relaxed">
            {lines.map((l, li) => (
              <span key={li}>
                <Inline text={l} />
                {li < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export default function AskPage() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || loading) return;

    setTurns((t) => [...t, { role: "user", text: q }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = (await res.json()) as {
        answer?: string;
        sources?: Source[];
        error?: string;
      };
      if (!res.ok || data.error) {
        setTurns((t) => [
          ...t,
          { role: "assistant", text: data.error || "Something went wrong.", isError: true },
        ]);
      } else {
        setTurns((t) => [
          ...t,
          { role: "assistant", text: data.answer || "", sources: data.sources },
        ]);
      }
    } catch {
      setTurns((t) => [
        ...t,
        {
          role: "assistant",
          text: "Couldn't reach the assistant. Please check your connection and try again.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    ask(input);
  }

  const empty = turns.length === 0;

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col gap-4">
      <PageHeader
        title="Ask AI"
        subtitle="Ask anything about the Indian market — powered by muns."
      />

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-xl border bg-card p-4"
      >
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-foreground">
              <Sparkles className="h-6 w-6" />
            </span>
            <div>
              <p className="font-medium">Ask about companies, sectors or the market.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                It can search the web and recent announcements. Try one:
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => ask(ex)}
                  className="rounded-full border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          turns.map((turn, i) =>
            turn.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-foreground px-4 py-2.5 text-sm text-background">
                  {turn.text}
                </div>
              </div>
            ) : (
              <div key={i} className="flex justify-start">
                <div
                  className={cn(
                    "max-w-[90%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm",
                    turn.isError
                      ? "flex items-start gap-2 bg-negative/10 text-negative"
                      : "bg-muted text-foreground"
                  )}
                >
                  {turn.isError ? (
                    <>
                      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{turn.text}</span>
                    </>
                  ) : (
                    <>
                      <RichText text={turn.text} />
                      {turn.sources && turn.sources.length > 0 && (
                        <div className="mt-3 border-t pt-2.5">
                          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                            Sources
                          </p>
                          <ul className="space-y-1">
                            {turn.sources.map((s, si) => (
                              <li key={s.key}>
                                <a
                                  href={s.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                                >
                                  <span className="text-muted-foreground/70">{si + 1}.</span>
                                  <span className="line-clamp-1">{s.title}</span>
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          )
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking…
            </div>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ask(input);
            }
          }}
          rows={1}
          placeholder="Ask a question…"
          disabled={loading}
          className="max-h-40 min-h-[46px] flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-foreground/30 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          aria-label="Send"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        AI can make mistakes — verify anything important. Informational only, not
        investment advice.
      </p>
    </div>
  );
}
