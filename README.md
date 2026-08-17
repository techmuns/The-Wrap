# The Wrap

A weekly digest of the Indian stock market — an original newsletter and
dashboard covering market breadth, insider trades, deals, and noteworthy
corporate announcements.

The Wrap publishes **our own writing** and **independently sourced data**. It
follows the familiar shape of a weekly market wrap-up, but all content and data
are our own.

## Tech stack

- **Next.js** (App Router) + **TypeScript** + **React 19**
- **Tailwind CSS** 3.x with shadcn-style CSS-variable tokens; dark mode via a
  `.dark` class + `localStorage`
- **lucide-react** icons, **recharts** charts, **date-fns**
- Data ingestion: standalone `.ts` scripts run with `tsx`, scheduled via GitHub
  Actions, writing static JSON the app reads
- Deploy: **Cloudflare** via `@opennextjs/cloudflare` + `wrangler`

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm run build       # next build
npm run preview     # build + preview on the Cloudflare Worker runtime
```

## Project structure

```
src/
  app/                 # routes (App Router)
    page.tsx           # Getting Started / home
    blog/              # weekly issue archive
    data-tools/        # live market-data trackers
    courses/ curated/ interviews/ books/ primers/
    ask/  beas/
  components/
    layout/            # Shell, Sidebar, Topbar, ThemeToggle
    ui/                # Card, PageHeader, ComingSoon, ...
  lib/                 # cn(), nav config
scripts/               # data-ingestion scripts (added per tracker)
```

## Navigation

**Content & Learning** — Getting Started · Blog · Data Tools · Courses ·
Curated · Management Interviews · Books · Industry Primers
**Ask AI** · **Beas**

## Data Tools

Live trackers behind the weekly sections:

- **Buying & Selling** — promoter/insider trades
- **Bulk & Block Deals** — large bulk/block/short deals (sourced from NSE)
- **Capex & New Ventures**, **Order Wins**, **Acquisitions** — corporate filings

Planned: Market Breadth, Sector Rotation, and a Stage-2 momentum screener.

## Principles

- **No mock data.** Placeholders render as honest "coming soon" states; every
  number shown traces to a real, independently sourced pipeline.
- **Original content.** Our own voice, branding, and sourced data throughout.

## Status

🚧 Phase 1 — app shell and navigation scaffolded; trackers and content being
wired section by section.
