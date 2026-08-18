import { Info } from "lucide-react";

interface ExplainerProps {
  /** Plain-English "what am I looking at". */
  what: string;
  /** Why a reader should care. */
  matters?: string;
  /** How to read a single row. */
  row?: string;
}

/**
 * A friendly, plain-language panel that sits at the top of a data page so a
 * non-expert immediately understands what the numbers are and why they matter.
 */
export function Explainer({ what, matters, row }: ExplainerProps) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed">
      <div className="flex items-start gap-2.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="space-y-1.5">
          <p>
            <span className="font-medium text-foreground">What this is: </span>
            <span className="text-muted-foreground">{what}</span>
          </p>
          {matters && (
            <p>
              <span className="font-medium text-foreground">Why it matters: </span>
              <span className="text-muted-foreground">{matters}</span>
            </p>
          )}
          {row && (
            <p>
              <span className="font-medium text-foreground">How to read a row: </span>
              <span className="text-muted-foreground">{row}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
