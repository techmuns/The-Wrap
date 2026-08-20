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

This reads a **rolling window of the daily archive** (default 7 days) and dedupes
it, so the draft reflects the whole trading week — not just the latest day. Each
feed contributes one section:

| Feed | Source | Section it fills |
| --- | --- | --- |
| Market indices | `indices.json` (latest close) | Market breadth + Sector rotation |
| FII/DII flows | `flows.json` (latest close) | FII/DII line in the summary |
| Bulk & block deals | `history/bulk-block-deals/` | Bulk & block deals |
| Insider trades | `history/insider-trades/` | Insider & promoter trades |
| Announcements | `history/announcements/` | Noteworthy announcements (by category) |
| Concalls | `history/concalls/` | Earnings calls |
| Corporate actions | `history/corporate-actions/` | Corporate actions |

Breadth, sector rotation and FII/DII are point-in-time (latest close) rather than
rolling-window feeds, so they read the latest snapshot directly.

If a feed has no archive yet, the generator falls back to that feed's latest
snapshot (`src/data/<feed>.json`) so it always produces something. Change the
window with `-- --days=N`.

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

## How the weekly archive works

Each daily ingest still overwrites its snapshot (`src/data/<feed>.json`) — that's
what the live Data Tools read — **and** appends an immutable daily partition:

```
src/data/history/<feed>/<YYYY-MM-DD>.json  = { capturedOn, capturedAt, count, rows }
```

The daily refresh workflows commit these partitions, so the archive survives the
ephemeral CI runners and accumulates a rolling week. The generator reads a window
of partitions and dedupes them (a row that reappears in consecutive days'
snapshots collapses to one), giving a true Mon–Fri view. Partitions older than
`RETENTION_DAYS` (60) are pruned automatically on write.

- **Seed / backfill:** `npm run seed:history` writes one partition per feed from
  the current snapshots — useful right after enabling the archive, or to recover
  if the history is ever cleared.
- **Ramp-up:** the archive fills one day at a time. Until a full week has been
  captured, the draft honestly reports how many days it has (e.g. "Over the past
  week (3 trading days captured): …").

### Residual limitation: snapshot depth

Each daily pull captures only the latest ~25–100 rows per feed. On an unusually
busy day a feed can have more rows than one snapshot holds, so a few may fall off
before the next day's capture. This is far better than a single-day view, but the
archive is not guaranteed to be an exhaustive record of every row that week.
Deepening per-day capture (pagination) is a future improvement.
