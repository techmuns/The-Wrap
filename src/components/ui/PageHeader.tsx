interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  /** Small accent icon shown right after the title (a lucide icon or emoji). */
  icon?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action, icon }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="flex items-center gap-2.5 text-[28px] font-bold leading-tight tracking-tight">
          {title}
          {icon && <span className="text-primary">{icon}</span>}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-base text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </header>
  );
}
