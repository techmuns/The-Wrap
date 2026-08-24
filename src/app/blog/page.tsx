import { PageHeader } from "@/components/ui/PageHeader";
import { BlogList } from "@/components/blog/BlogList";

export const metadata = {
  title: "Blog — The Wrap",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Blog"
        icon="✍️"
        subtitle="Insightful market analysis, data breakdowns and industry deep dives."
      />
      <BlogList />
    </div>
  );
}
