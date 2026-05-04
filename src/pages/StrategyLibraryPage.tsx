import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DeleteIconButton, EditIconButton } from '../components/ui/ActionIcons'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { PageToolbar, ToolbarSelect } from '../components/layout/PageToolbar'
import { PlatformIcon } from '../components/ui/PlatformIcon'
import { Table, type TableColumn } from '../components/ui/Table'
import { useContentTracker } from '../hooks/useContentTracker'
import { useStrategyLibrary } from '../hooks/useStrategyLibrary'
import type { StrategyCard } from '../types/data'

type Bucket = 'used' | 'unused'
type ViewMode = 'cards' | 'table'

export function StrategyLibraryPage() {
  const { strategies, addStrategy, updateStrategy, deleteStrategy } = useStrategyLibrary()
  const { entries } = useContentTracker()
  const [searchParams, setSearchParams] = useSearchParams()
  const hookFilter = searchParams.get('hook') ?? ''
  const [platform, setPlatform] = useState('All')
  const [category, setCategory] = useState('All')
  const [bucket, setBucket] = useState<Bucket>('used')
  const [view, setView] = useState<ViewMode>('cards')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<StrategyCard | null>(null)
  const [deleting, setDeleting] = useState<StrategyCard | null>(null)

  const platforms = useMemo(
    () => ['All', ...Array.from(new Set(strategies.map((c) => c.platform))).sort()],
    [strategies],
  )
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(strategies.map((c) => c.category))).sort()],
    [strategies],
  )

  const setHookFilter = (v: string) => {
    const next = new URLSearchParams(searchParams)
    if (v.trim()) {
      next.set('hook', v)
    } else {
      next.delete('hook')
    }
    setSearchParams(next, { replace: true })
  }

  const filtered = useMemo(() => {
    const q = hookFilter.trim().toLowerCase()
    return strategies.filter((c) => {
      const okP = platform === 'All' || c.platform === platform
      const okCat = category === 'All' || c.category === category
      const okQ =
        q === '' ||
        c.hook.toLowerCase().includes(q) ||
        c.scriptPreview.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      return okP && okCat && okQ
    })
  }, [strategies, hookFilter, platform, category])

  const usedHookSet = useMemo(() => {
    return new Set(
      entries
        .map((e) => e.hook.trim().toLowerCase())
        .filter((h) => h.length > 0),
    )
  }, [entries])

  const used = useMemo(
    () => filtered.filter((s) => usedHookSet.has(s.hook.trim().toLowerCase())),
    [filtered, usedHookSet],
  )

  const unused = useMemo(
    () => filtered.filter((s) => !usedHookSet.has(s.hook.trim().toLowerCase())),
    [filtered, usedHookSet],
  )

  const activeList = bucket === 'used' ? used : unused

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = useCallback((s: StrategyCard) => {
    setEditing(s)
    setFormOpen(true)
  }, [])

  const closeForm = () => {
    setFormOpen(false)
    setEditing(null)
  }

  const tableColumns: TableColumn<StrategyCard>[] = useMemo(
    () => [
      {
        id: 'hook',
        header: 'Hook',
        cell: (s) => <span className="max-w-[320px] font-medium text-neutral-900">{s.hook}</span>,
      },
      {
        id: 'platform',
        header: 'Platform',
        cell: (s) => <PlatformIcon platform={s.platform} />,
      },
      { id: 'category', header: 'Category', cell: (s) => s.category },
      { id: 'added', header: 'Added', cell: (s) => <span className="tabular-nums text-neutral-600">{s.createdAt}</span> },
      {
        id: 'ref',
        header: 'Reference',
        cell: (s) => (
          <a
            href={s.referenceLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            Open
          </a>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        className: 'w-[1%] whitespace-nowrap',
        cell: (s) => (
          <div className="flex justify-end gap-0.5">
            <EditIconButton aria-label={`Edit hook: ${s.hook}`} onClick={() => openEdit(s)} />
            <DeleteIconButton aria-label={`Delete hook: ${s.hook}`} onClick={() => setDeleting(s)} />
          </div>
        ),
      },
    ],
    [openEdit],
  )

  return (
    <div>
      <PageToolbar
        title="Strategy library"
        subtitle="Reusable hooks and scripts — curated for your team."
        searchValue={hookFilter}
        onSearchChange={setHookFilter}
        filters={
          <>
            <ToolbarSelect
              label="Platform"
              value={platform}
              onChange={setPlatform}
              options={platforms.map((p) => ({ value: p, label: p }))}
            />
            <ToolbarSelect
              label="Category"
              value={category}
              onChange={setCategory}
              options={categories.map((c) => ({ value: c, label: c }))}
            />
          </>
        }
        actions={
          <button
            type="button"
            onClick={openAdd}
            className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95 active:opacity-90"
          >
            Add hook
          </button>
        }
      />

      {hookFilter ? (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-neutral-200/90 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-700">
            Managing script for hook:{' '}
            <span className="font-semibold text-neutral-900">{hookFilter}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/content"
              className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 shadow-sm transition hover:bg-neutral-50"
            >
              ← Content tracker
            </Link>
            <button
              type="button"
              onClick={() => setHookFilter('')}
              className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:opacity-95 active:opacity-90"
            >
              Clear hook filter
            </button>
          </div>
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <PillButton selected={bucket === 'used'} onClick={() => setBucket('used')}>
            Used in campaigns
            <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold tabular-nums">
              {used.length}
            </span>
          </PillButton>
          <PillButton selected={bucket === 'unused'} onClick={() => setBucket('unused')}>
            Not used yet
            <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold tabular-nums">
              {unused.length}
            </span>
          </PillButton>
        </div>

        <div className="flex rounded-xl border border-neutral-200 bg-white p-0.5 shadow-sm">
          <button
            type="button"
            onClick={() => setView('cards')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              view === 'cards'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Cards
          </button>
          <button
            type="button"
            onClick={() => setView('table')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              view === 'table'
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      <section className="mb-10">
        <div className="mb-4">
          <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
            {bucket === 'used' ? 'Used in campaigns' : 'Not used yet'}
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            {bucket === 'used'
              ? 'Hooks currently referenced by entries in Content tracker.'
              : "Hooks you've added but haven't used in any campaign entries."}
          </p>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">No strategies match your filters.</p>
        ) : activeList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-10 text-center text-sm text-neutral-500">
            Nothing here for this bucket yet.
          </div>
        ) : view === 'cards' ? (
          <StrategyGrid items={activeList} onEdit={openEdit} onDelete={setDeleting} />
        ) : (
          <Table columns={tableColumns} rows={activeList} emptyMessage="No rows." />
        )}
      </section>

      {formOpen ? (
        <StrategyFormModal
          key={editing?.id ?? 'new-hook'}
          title={editing ? 'Edit hook' : 'Add hook'}
          initial={editing}
          onClose={closeForm}
          onSave={(payload) => {
            if (editing) {
              updateStrategy(editing.id, payload)
            } else {
              addStrategy(payload)
            }
            closeForm()
          }}
        />
      ) : null}

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete hook"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleting(null)}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (deleting) {
                  deleteStrategy(deleting.id)
                  if (hookFilter && deleting.hook === hookFilter) {
                    setHookFilter('')
                  }
                }
                setDeleting(null)
              }}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          Remove <span className="font-semibold text-neutral-900">{deleting?.hook}</span>? This cannot be undone
          (demo storage: local device only).
        </p>
      </Modal>
    </div>
  )
}

function PillButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
        selected
          ? 'bg-[var(--color-accent)] text-white shadow-sm'
          : 'border border-neutral-200 bg-white text-neutral-700 shadow-sm hover:border-neutral-300 hover:bg-neutral-50'
      }`}
    >
      {children}
    </button>
  )
}

function StrategyFormModal({
  title,
  initial,
  onClose,
  onSave,
}: {
  title: string
  initial: StrategyCard | null
  onClose: () => void
  onSave: (payload: Omit<StrategyCard, 'id' | 'createdAt'>) => void
}) {
  const [category, setCategory] = useState(initial?.category ?? '')
  const [platform, setPlatform] = useState(initial?.platform ?? '')
  const [hook, setHook] = useState(initial?.hook ?? '')
  const [scriptPreview, setScriptPreview] = useState(initial?.scriptPreview ?? '')
  const [referenceLink, setReferenceLink] = useState(initial?.referenceLink ?? 'https://example.com')

  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (!hook.trim() || !category.trim() || !platform.trim()) return
              onSave({
                category: category.trim(),
                platform: platform.trim(),
                hook: hook.trim(),
                scriptPreview: scriptPreview.trim() || '—',
                referenceLink: referenceLink.trim() || 'https://example.com',
              })
            }}
            className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95 active:opacity-90"
          >
            Save
          </button>
        </>
      }
    >
      <div className="grid max-h-[65vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
        <Field label="Category" value={category} onChange={setCategory} placeholder="Beauty" />
        <Field label="Platform" value={platform} onChange={setPlatform} placeholder="TikTok" />
        <Field label="Hook" value={hook} onChange={setHook} placeholder="Short hook line" className="sm:col-span-2" />
        <Field
          label="Script preview"
          value={scriptPreview}
          onChange={setScriptPreview}
          placeholder="Opening line…"
          multiline
          className="sm:col-span-2"
        />
        <Field
          label="Reference link"
          value={referenceLink}
          onChange={setReferenceLink}
          placeholder="https://…"
          className="sm:col-span-2"
        />
      </div>
    </Modal>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  className = '',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  multiline?: boolean
  className?: string
}) {
  const base =
    'mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none focus:ring-2 focus:ring-neutral-900/5'
  return (
    <label className={`block text-xs font-medium text-neutral-600 ${className}`}>
      {label}
      {multiline ? (
        <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${base} resize-y`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={base} />
      )}
    </label>
  )
}

function StrategyGrid({
  items,
  onEdit,
  onDelete,
}: {
  items: StrategyCard[]
  onEdit: (s: StrategyCard) => void
  onDelete: (s: StrategyCard) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((s) => (
        <Card key={s.id} padding="p-5" className="relative flex flex-col pt-12">
          <div className="absolute right-3 top-3 flex items-center gap-0.5">
            <EditIconButton aria-label={`Edit hook: ${s.hook}`} onClick={() => onEdit(s)} />
            <DeleteIconButton aria-label={`Delete hook: ${s.hook}`} onClick={() => onDelete(s)} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{s.category}</Badge>
            <Badge tone="accent" className="pl-1.5 pr-2">
              <span className="inline-flex items-center gap-1.5">
                <PlatformIcon platform={s.platform} size={14} />
                <span>{s.platform}</span>
              </span>
            </Badge>
            <span className="text-xs text-neutral-400">·</span>
            <span className="text-xs font-medium text-neutral-500">Added {s.createdAt}</span>
          </div>
          <h3 className="mt-4 text-base font-semibold tracking-tight text-neutral-900">{s.hook}</h3>
          <p className="mt-2 line-clamp-4 flex-1 text-sm leading-relaxed text-neutral-600">{s.scriptPreview}</p>
          <a
            href={s.referenceLink}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-neutral-900 underline-offset-4 transition hover:underline"
          >
            Reference link
            <span aria-hidden>↗</span>
          </a>
        </Card>
      ))}
    </div>
  )
}
