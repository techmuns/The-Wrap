# Data contracts

Ingestion scripts (or external jobs) write **static JSON** files under
`src/data/`. The app reads them at build time and renders a graceful empty
state until real data is present. Each scheduled GitHub Action re-writes its
file and commits it to `main`, which triggers a redeploy.

> **Safety rule:** an ingestion should refuse to overwrite good data with an
> empty/failed pull (exit non-zero without writing) so a bad run can never blank
> the site. See `scripts/ingest/bulk-block-deals.ts` for the pattern.

---

## Insider trades — `src/data/insider-trades.json`

Powers the **Buying & Selling** tab (`/data-tools/insider-trades`). Write this
file from your ingestion (any language/host); the app just needs the shape
below.

### Schema

```jsonc
{
  "fetchedAt": "2026-08-17T18:16:08.316Z", // ISO timestamp of the pull (or null)
  "source": "NSE",                          // shown as "Source: …" (e.g. "NSE", "BSE", "Screener")
  "total": 2,                               // items.length
  "items": [
    {
      "company": "Maharashtra Seamless",     // string | null
      "symbol": "MAHSEAMLES",                // string | null (NSE/BSE code)
      "person": "D. P. Jindal",              // acquirer/disposer name | null
      "role": "Promoter",                    // "Promoter" | "Promoter Group" | "Director" | … | null
      "buySell": "BUY",                      // "BUY" | "SELL" | null
      "shares": 300000,                      // number | null
      "pct": 0.22,                           // % of company as a number (0.22 = 0.22%) | null
      "value": 176000000,                    // deal value in RUPEES | null
      "mode": "Market",                      // "Market" | "Off-market" | "Preferential" | … | null
      "date": "14 Aug 2026",                 // display date | null
      "isoDate": "2026-08-14T00:00:00+05:30" // ISO for sorting | null
    }
  ]
}
```

### Notes

- **`value` is in rupees** — the UI formats it to crore/lakh automatically.
- **`pct`** is a plain number (percent), not a fraction.
- The table tabs by `buySell` (All / Buying / Selling) and sorts by value,
  shares or company. Missing fields render as "—", so partial rows are fine.
- Rank/dedupe on your side if the source has duplicates. The app sorts by value
  descending by default.
- Empty is valid: `{"fetchedAt":null,"source":"","total":0,"items":[]}`.

### Sourcing options (pick whatever your API uses)

- **NSE (public, no login):** the corporate-filings insider/SAST endpoints work
  with the same cookie-prime trick as `scripts/ingest/bulk-block-deals.ts`.
- **Screener (login):** `/trades/insiders` and `/trades/sast` are reachable with
  the existing `SCREENER_USERNAME` / `SCREENER_PASSWORD` secrets — the login +
  parse pattern in `scripts/ingest/announcements.ts` can be reused.
- **Munshot / other API:** any source is fine; just emit the schema above.

If your API's natural output differs, share a sample response and I'll either
adapt the loader or add a small mapping step.

---

## Other feeds (already wired)

- **`src/data/bulk-block-deals.json`** — Bulk & Block Deals. Written by
  `scripts/ingest/bulk-block-deals.ts` (NSE largedeal snapshot). See
  `src/types/deals.ts`.
- **`src/data/announcements.json`** — unified announcements feed. Written by
  `scripts/ingest/announcements.ts` (Screener Daily Pulse). See
  `src/types/announcements.ts`. Categories are assigned by
  `src/lib/announcements/classify.ts`.
