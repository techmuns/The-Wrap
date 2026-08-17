import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export default function BlogPage() {
  return (
    <PlaceholderPage
      title="Blog"
      subtitle="The weekly issue — our digest of the Indian stock market."
      description="Every weekly issue of The Wrap, archived and searchable — our own writing, in our own voice."
      planned={[
        "The weekly issue template: market summary, breadth, insider trades, deals and noteworthy announcements",
        "A browsable archive of past issues",
        "Seed issues rewritten in our own voice",
      ]}
    />
  );
}
