import { cn } from "@/lib/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  action?: React.ReactNode;
  /**
   * Visual treatment indicating data status:
   *   - undefined / "live" : default styling (live sourced data)
   *   - "demo"             : muted/dashed with a "Demo" badge
   *   - "pending"          : muted/dashed with a "Pending" badge
   */
  tone?: "live" | "demo" | "pending";
}

export function Card({
  title,
  action,
  tone,
  className,
  children,
  ...rest
}: CardProps) {
  const isMuted = tone === "demo" || tone === "pending";
  const toneBadge = tone === "demo" ? "Demo" : tone === "pending" ? "Pending" : null;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        isMuted && "border-dashed border-muted-foreground/40",
        "print:break-inside-avoid",
        className
      )}
      {...rest}
    >
      {(title || action || toneBadge) && (
        <div className="flex flex-col gap-3 px-6 pt-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="text-sm font-medium tracking-tight">{title}</h3>
            )}
          </div>
          {(action || toneBadge) && (
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              {action}
              {toneBadge && (
                <span className="shrink-0 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {toneBadge}
                </span>
              )}
            </div>
          )}
        </div>
      )}
      <div className="px-6 pb-6 pt-4">{children}</div>
    </div>
  );
}
