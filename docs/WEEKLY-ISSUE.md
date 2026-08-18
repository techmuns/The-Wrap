# Weekly issue workflow

The weekly issue generator is the product's core loop: it turns the week's live
data feeds into a **draft** Blog issue you review, edit, and publish. It never
invents content — every listed item comes from an independently sourced feed,
and everything that needs a human voice is left as a clearly-marked placeholder.

## The loop

```
generate  →  review  →  write commentary  →  publish
```

### 1. Generate

```bash
npm run build:weekly-issue          # dated today
npm run build:weekly-issue -- --date=2026-08-16   # or a specific Saturday/Sunday
```

This reads the five feeds in `src/data/`:

| Feed | File | Section it fills |
| --- | --- | --- |
| Bulk & block deals | `bulk-block-deals.json` | Bulk & block deals |
| Insider trades | `insider-trades.json` | Insider & promoter trades |
| Announcements | `announcements.json` | Noteworthy announcements (by category) |
| Concalls | `concalls.json` | Earnings calls |
| Corporate actions | `corporate-actions.json` | Corporate actions |

and writes:

- `src/content/drafts/<slug>.ts` — the draft issue (a normal `Issue` object).
- `src/content/drafts/index.ts` — regenerated list of all drafts.

The generator ranks items so the draft leads with what matters — insider and
deal sections are ordered by disclosed value, announcements are grouped by our
category taxonomy, and corporate actions are grouped by type. Empty feeds
produce an honest "no notable activity" note rather than a fabricated item.

In CI, the **Build Weekly Issue Draft** workflow runs this every Sunday at
06:00 UTC and commits the draft. It needs no secrets — it only reads the
already-committed data.

### 2. Review

Drafts render at **`/blog/drafts`** (list) and **`/blog/drafts/<slug>`**
(preview), using the same template as a published issue, with a DRAFT banner.
These routes are `noindex` and are not linked from the public navigation, so a
draft is never mistaken for a published issue.

### 3. Write the commentary

Open `src/content/drafts/<slug>.ts` and replace every field marked
`[DRAFT — write this]`:

- `title` — the week's headline.
- `dek` — the one-line thesis.
- The `body` of the **summary**, **breadth**, **insider**, **deals**,
  **concalls**, **corporate actions**, and **curated** sections — your
  commentary. (A factual "by the numbers" line is pre-filled under the summary.)

Trim or reorder the data lists as you see fit, and star (`starred: true`) the
must-reads. `readingTime` starts as `"Draft preview"` — set a real estimate.

### 4. Publish

When it reads the way you want:

1. Move the file: `git mv src/content/drafts/<slug>.ts src/content/issues/<slug>.ts`
2. Register it in `src/content/issues/index.ts` (import + add to the `issues` array).
3. Re-run the generator so the drafts index drops the promoted file:
   `npm run build:weekly-issue -- --date=<slug>` is not needed — just delete the
   stale draft if one lingers and the next generation rewrites the index.

The issue now appears in the published `/blog` archive.

## Known limitation: latest-snapshot, not rolling week

Each daily ingest **overwrites** its `src/data/*.json` with the latest snapshot
(the most recent ~25–100 rows), so it does not accumulate a full rolling week of
history. A draft therefore summarizes the **latest available snapshot**, which
is close to — but not guaranteed to be — the complete Mon–Fri week. The draft
says as much ("In the latest data: …").

**Planned follow-up:** append each daily pull into a week-partitioned archive so
the generator can assemble a true Monday-to-Friday view. Until then, treat the
draft as a strong starting point, not a complete week of record.
