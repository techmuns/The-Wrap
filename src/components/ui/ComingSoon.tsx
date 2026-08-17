import { Clock } from "lucide-react";
import { Card } from "./Card";

export function ComingSoon({
  description,
  planned,
}: {
  description?: string;
  planned?: string[];
}) {
  return (
    <Card
      title="Coming soon"
      className="border-dashed"
      action={
        <span className="shrink-0 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          In progress
        </span>
      }
    >
      <div className="space-y-4">
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
        {planned && planned.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Planned for this section
            </p>
            <ul className="mt-2 space-y-1.5">
              {planned.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
