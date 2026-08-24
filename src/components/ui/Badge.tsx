import { cn } from "@/lib/cn";

type BadgeVariant = "free" | "premium" | "featured" | "category" | "neutral";

const VARIANTS: Record<BadgeVariant, string> = {
  free: "bg-positive/15 text-positive",
  premium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  featured: "bg-primary/15 text-primary",
  category: "border bg-muted text-muted-foreground",
  neutral: "border bg-muted/60 text-muted-foreground",
};

export function Badge({
  variant = "neutral",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
