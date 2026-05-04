import { Card } from './Card'
import { Badge } from './Badge'
import { PlatformIcon } from './PlatformIcon'
import { statusTone } from '../../lib/badgeTones'
import { formatFollowers } from '../../lib/format'
import type { Influencer } from '../../types/data'

export type KanbanColumnDef = { id: string; title: string }

export function KanbanBoard({
  columns,
  items,
  getColumnId,
}: {
  columns: KanbanColumnDef[]
  items: Influencer[]
  getColumnId: (item: Influencer) => string
}) {
  const grouped = columns.map((col) => ({
    ...col,
    items: items.filter((i) => getColumnId(i) === col.id),
  }))

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {grouped.map((col) => (
        <div
          key={col.id}
          className="min-w-[260px] max-w-[280px] shrink-0 rounded-2xl border border-neutral-200/70 bg-neutral-50/50 p-3"
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {col.title}
            </span>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-neutral-600 ring-1 ring-neutral-200/80">
              {col.items.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {col.items.map((inf) => (
              <Card key={inf.id} padding="p-4" className="!shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-neutral-900">{inf.name}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      <span className="inline-flex items-center gap-1.5">
                        <PlatformIcon platform={inf.platform} size={14} />
                        <span>{formatFollowers(inf.followers)}</span>
                      </span>
                    </p>
                  </div>
                  <Badge tone={statusTone(inf.status)}>{inf.status}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">{inf.category}</Badge>
                  <Badge tone={inf.collaborationType === '—' ? 'neutral' : 'accent'}>
                    {inf.collaborationType}
                  </Badge>
                </div>
                <p className="mt-3 text-xs text-neutral-500">
                  Last: {inf.lastContact}
                </p>
              </Card>
            ))}
            {col.items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-neutral-200 bg-white/60 px-3 py-6 text-center text-xs text-neutral-400">
                Empty
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
