"use client";

import { cn } from "@/lib/cn";

/**
 * The Wrap-style filter row: a solid-blue active pill, translucent inactive
 * pills. Generic over the option type so pages can use string unions.
 */
export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  counts,
  className,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  /** Optional per-option counts shown in parentheses. */
  counts?: Partial<Record<T, number>>;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => {
        const active = opt === value;
        const count = counts?.[opt];
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {opt}
            {typeof count === "number" && (
              <span className={cn("ml-1", active ? "opacity-80" : "opacity-60")}>
                ({count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
