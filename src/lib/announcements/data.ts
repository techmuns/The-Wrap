import raw from "@/data/announcements.json";
import {
  EMPTY_ANNOUNCEMENTS,
  type AnnouncementsDataset,
} from "@/types/announcements";

/**
 * Announcements dataset, read from the static JSON produced by
 * `scripts/ingest/announcements.ts` (refreshed on a schedule by GitHub
 * Actions). Returns an empty dataset if the file is malformed so pages render
 * a graceful empty state.
 */
export function getAnnouncements(): AnnouncementsDataset {
  const data = raw as AnnouncementsDataset;
  if (!data || !Array.isArray(data.items)) return EMPTY_ANNOUNCEMENTS;
  return data;
}
