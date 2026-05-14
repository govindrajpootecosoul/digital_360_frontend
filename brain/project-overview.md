# Digital 360 — project overview

Influencer tracking dashboard (React, Vite, TypeScript, Tailwind CSS v4, Recharts). Brand: **Digital 360**. Seed and static reference data in `src/data/*.json`. Content, strategies, and related records load from the Fastify API (`src/lib/api.ts`).

## Routes

- `/` — Dashboard (KPIs, charts, activity)
- `/influencers` — CRM table / Kanban toggle, add modal
- `/outreach` — Influencer finder by country/category and follower range
- `/content` — Content tracker: category pills, table (hook → `/strategy?hook=…`), add category/entry
- `/strategy` — Strategy library grid; `?hook=` deep link from Content tracker
- `/settings` — Edit/delete content tracker categories

## Content tracker data

Seed: `src/data/contentTracker.json`. Runtime data from API (`ContentTrackerProvider` + `useContentTracker()`).

## Key components

`src/components/ui/` — Table, KanbanBoard, Modal, Badge, Card. `src/components/layout/` — Sidebar (collapsible), AppLayout, PageToolbar.
