import { PageHeader } from "./PageHeader";
import { ComingSoon } from "./ComingSoon";

export function PlaceholderPage({
  title,
  subtitle,
  description,
  planned,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  planned?: string[];
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title={title} subtitle={subtitle} />
      <ComingSoon description={description} planned={planned} />
    </div>
  );
}
