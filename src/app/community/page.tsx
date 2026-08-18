import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata = {
  title: "Community — The Wrap",
};

export default function CommunityPage() {
  return (
    <PlaceholderPage
      title="Community"
      subtitle="A place for readers to talk about the week's market."
      description="We're setting up a members' community to discuss each issue, share ideas and ask questions. It isn't open yet — this page will hold the invite link once it is."
      planned={[
        "A discussion space tied to each weekly issue",
        "Reader Q&A and idea-sharing",
        "Announcements when a new issue drops",
      ]}
    />
  );
}
