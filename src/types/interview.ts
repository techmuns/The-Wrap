export type InterviewCategory =
  | "Business TV"
  | "Long-Form & Founders"
  | "Earnings Calls";

export interface InterviewSource {
  /** The show, channel or resource. */
  title: string;
  /** Who publishes it. */
  by: string;
  category: InterviewCategory;
  /** What you actually get here. */
  note: string;
  /** A link that always resolves — a YouTube search or a public site. */
  url: string;
}
