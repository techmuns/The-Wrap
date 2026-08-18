import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata = {
  title: "Indicators — The Wrap",
};

export default function IndicatorsPage() {
  return (
    <PlaceholderPage
      title="Indicators"
      subtitle="Our charting indicators and how to use them."
      description="A library of the charting indicators we use in the weekly analysis, with plain guides on how to read them. It's still being put together — this page will host the list and instructions once ready."
      planned={[
        "Our own market-breadth and momentum indicators",
        "Plain-English guides for each",
        "Setup instructions for your charts",
      ]}
    />
  );
}
