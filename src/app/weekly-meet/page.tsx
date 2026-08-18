import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata = {
  title: "Weekly Meet — The Wrap",
};

export default function WeeklyMeetPage() {
  return (
    <PlaceholderPage
      title="Weekly Meet"
      subtitle="A live weekly call to walk through the issue together."
      description="A short live session each week to go over the latest issue and take questions. No session is scheduled yet — this page will show the next meeting time and joining link once it's set."
      planned={[
        "A recurring weekly call open to readers",
        "A walk-through of the week's issue and data",
        "Live Q&A",
      ]}
    />
  );
}
