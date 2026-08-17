import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export default function CuratedPage() {
  return (
    <PlaceholderPage
      title="Curated"
      subtitle="Hand-picked external reading worth your time."
      description="Long-reads, deep-dives and essays we found valuable this week — with a short note on why each one matters."
      planned={[
        "A weekly curated reading list",
        "Short editorial notes on each pick",
      ]}
    />
  );
}
