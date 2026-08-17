import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export default function AskPage() {
  return (
    <PlaceholderPage
      title="Ask AI"
      subtitle="Ask questions about this week's market."
      description="A conversational assistant grounded in The Wrap's own data — ask about the week's breadth, deals and announcements. The assistant's name and persona are still to be decided (we won't reuse the reference product's persona)."
      planned={[
        "Conversational answers grounded in The Wrap's own data",
        "Persona & name to be finalised with you",
      ]}
    />
  );
}
