import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export default function InsiderTradesPage() {
  return (
    <PlaceholderPage
      title="Buying & Selling"
      subtitle="Promoter & insider trades reported this week."
      description="Who's buying and who's selling their own companies — insider and promoter transactions, ranked by value across the market."
      planned={[
        "Weekly insider / promoter buy and sell transactions",
        "Ranked by deal value across the NSE universe",
        "Filter by buy vs sell and by company",
      ]}
    />
  );
}
