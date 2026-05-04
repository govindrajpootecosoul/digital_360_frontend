# Influra — project overview

Frontend-only influencer tracking dashboard (React, Vite, TypeScript, Tailwind CSS v4, Recharts). Brand: **Influra**. Static mock data lives in `src/data/*.json`. No backend or authentication.

## Routes

- `/` — Dashboard (KPIs, charts, activity)
- `/Influencers Manager` — CRM table / Kanban toggle, add modal (UI only)
- `/outreach` — Outreach table, status filter, script performance badges
- `/content` — Content tracker: category pills, table (hook → `/strategy?hook=…`), add category/entry (localStorage)
- `/strategy` — Strategy library grid; `?hook=` deep link from Content tracker
- `/settings` — Edit/delete content tracker categories

## Content tracker data

Seed: `src/data/contentTracker.json`. Runtime edits persist in `localStorage` key `influra-content-tracker-v1`. Context: `ContentTrackerProvider` + `useContentTracker()`.

## Key components

`src/components/ui/` — Table, KanbanBoard, Modal, Badge, Card. `src/components/layout/` — Sidebar (collapsible), AppLayout, PageToolbar.
