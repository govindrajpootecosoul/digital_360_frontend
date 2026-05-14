import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DeleteIconButton, DownloadIconButton, EditIconButton } from '../components/ui/ActionIcons'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { PageToolbar, ToolbarSelect } from '../components/layout/PageToolbar'
import { PlatformIcon } from '../components/ui/PlatformIcon'
import { Table, type TableColumn } from '../components/ui/Table'
import { useContentTracker } from '../hooks/useContentTracker'
import { useStrategyLibrary } from '../hooks/useStrategyLibrary'
import type { StrategyCard } from '../types/data'
import type { ContentTrackerEntry } from '../types/contentTracker'
import { downloadCsv } from '../lib/csvDownload'
import { formatShortDateFromIso } from '../lib/format'

type Bucket = 'used' | 'unused'
type ViewMode = 'cards' | 'table'
type StrategyStatus = StrategyCard['status']
const STATUS_OPTIONS: StrategyStatus[] = ['Approved', 'Under Review', 'WIP', 'Rejected']

export function StrategyLibraryPage() {
  const { strategies, addStrategy, updateStrategy, deleteStrategy } = useStrategyLibrary()
  const { entries, categories: contentCategories, addEntry } = useContentTracker()
  const [searchParams, setSearchParams] = useSearchParams()
  const hookFilter = searchParams.get('hook') ?? ''
  const [platform, setPlatform] = useState('All')
  const [category, setCategory] = useState('All')
  const [bucket, setBucket] = useState<Bucket>('used')
  const [view, setView] = useState<ViewMode>('cards')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<StrategyCard | null>(null)
  const [deleting, setDeleting] = useState<StrategyCard | null>(null)
  const [postTarget, setPostTarget] = useState<StrategyCard | null>(null)

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
    () =>
      filtered
        .filter((s) => usedHookSet.has(s.hook.trim().toLowerCase()))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [filtered, usedHookSet],
  )

  const unused = useMemo(
    () =>
      filtered
        .filter((s) => !usedHookSet.has(s.hook.trim().toLowerCase()))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [filtered, usedHookSet],
  )

  const bucketLabel = (b: Bucket) => (b === 'used' ? 'Used in campaigns' : 'Ideation')

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

  const setStatus = useCallback(
    (s: StrategyCard, status: StrategyStatus) => {
      updateStrategy(s.id, {
        category: s.category,
        platform: s.platform,
        hook: s.hook,
        scriptPreview: s.scriptPreview,
        referenceLink: s.referenceLink,
        status,
      })
    },
    [updateStrategy],
  )

  const transitionToUnderReview = useCallback(
    (s: StrategyCard) => setStatus(s, 'Under Review'),
    [setStatus],
  )

  const openPostDialog = useCallback((s: StrategyCard) => {
    setPostTarget(s)
  }, [])

  const tableColumns: TableColumn<StrategyCard>[] = useMemo(
    () => {
      const base: TableColumn<StrategyCard>[] = [
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
      ...(bucket === 'unused'
        ? ([
            {
              id: 'status',
              header: 'Status',
              cell: (s) => (
                <select
                  value={s.status}
                  onChange={(e) => setStatus(s, e.target.value as StrategyStatus)}
                  className="min-w-[150px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm outline-none transition focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/5"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ),
            },
          ] as TableColumn<StrategyCard>[])
        : []),
      {
        id: 'added',
        header: 'Added',
        cell: (s) => (
          <span className="text-neutral-600" title={s.createdAt}>
            {formatShortDateFromIso(s.createdAt)}
          </span>
        ),
      },
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
          <div className="flex items-center justify-end gap-1.5">
            {bucket === 'unused' ? (
              <div className="mr-1 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => transitionToUnderReview(s)}
                  disabled={s.status === 'Under Review'}
                  className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send for approval
                </button>
                <button
                  type="button"
                  onClick={() => openPostDialog(s)}
                  className="rounded-lg bg-[var(--color-accent)] px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:opacity-95 active:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Post it
                </button>
              </div>
            ) : null}
            <EditIconButton aria-label={`Edit hook: ${s.hook}`} onClick={() => openEdit(s)} />
            <DeleteIconButton aria-label={`Delete hook: ${s.hook}`} onClick={() => setDeleting(s)} />
          </div>
        ),
      },
      ]

      return base
    },
    [openEdit, bucket, setStatus, transitionToUnderReview, openPostDialog],
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
          <div className="flex flex-wrap items-center gap-2">
            <DownloadIconButton
              aria-label="Download strategy library CSV"
              onClick={() => {
                const usedSet = new Set(used.map((s) => s.id))
                downloadCsv({
                  filename: `strategy-library-${new Date().toISOString().slice(0, 10)}.csv`,
                  headers: [
                    'id',
                    'bucket',
                    'status',
                    'category',
                    'platform',
                    'hook',
                    'scriptPreview',
                    'referenceLink',
                    'createdAt',
                  ],
                  rows: filtered.map((s) => ({
                    ...s,
                    bucket: bucketLabel(usedSet.has(s.id) ? 'used' : 'unused'),
                  })),
                })
              }}
            />
            <button
              type="button"
              onClick={openAdd}
              className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95 active:opacity-90"
            >
              Add hook
            </button>
          </div>
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
            Ideation
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
            {bucket === 'used' ? 'Used in campaigns' : 'Ideation'}
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
          <StrategyGrid
            items={activeList}
            showIdeationControls={bucket === 'unused'}
            onEdit={openEdit}
            onDelete={setDeleting}
            onStatusChange={setStatus}
            onSendForApproval={transitionToUnderReview}
            onPost={openPostDialog}
          />
        ) : (
          <Table columns={tableColumns} rows={activeList} emptyMessage="No rows." />
        )}
      </section>

      {postTarget ? (
        <PostItModal
          key={postTarget.id}
          strategy={postTarget}
          contentCategories={contentCategories}
          onClose={() => setPostTarget(null)}
          onConfirm={(payload) => {
            payload.platforms.forEach((p) => {
              const next: Omit<ContentTrackerEntry, 'id'> = {
                categoryId: payload.categoryId,
                subCategory: payload.subCategory,
                country: payload.country,
                date: payload.postedDate,
                day: payload.day,
                contentType: payload.contentType,
                campaignTheme: payload.product,
                idea: payload.idea,
                copy: payload.copy,
                designerName: '—',
                designerStatus: '—',
                platform: p,
                topic: payload.topic,
                scripts: payload.scripts,
                hook: postTarget.hook,
                isOwn: true,
                postLink: payload.postLink?.trim() || '',
                referenceLink: postTarget.referenceLink,
                views: 0,
                likes: 0,
                comments: '0',
              }
              addEntry(next)
            })

            setStatus(postTarget, 'Approved')
            setPostTarget(null)
          }}
        />
      ) : null}

      {formOpen ? (
        <StrategyFormModal
          key={editing?.id ?? 'new-hook'}
          title={editing ? 'Edit hook' : 'Add hook'}
          initial={editing}
          onClose={closeForm}
          onSave={(payload) => {
            if (editing) {
              updateStrategy(editing.id, { ...payload, status: editing.status })
            } else {
              addStrategy({ ...payload, status: 'WIP' })
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
  const [status] = useState<StrategyStatus>(initial?.status ?? 'WIP')

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
                status,
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
  showIdeationControls,
  onEdit,
  onDelete,
  onStatusChange,
  onSendForApproval,
  onPost,
}: {
  items: StrategyCard[]
  showIdeationControls: boolean
  onEdit: (s: StrategyCard) => void
  onDelete: (s: StrategyCard) => void
  onStatusChange: (s: StrategyCard, status: StrategyStatus) => void
  onSendForApproval: (s: StrategyCard) => void
  onPost: (s: StrategyCard) => void
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
            {showIdeationControls ? (
              <Badge tone="neutral">{s.status}</Badge>
            ) : null}
            <span className="text-xs text-neutral-400">·</span>
            <span className="text-xs font-medium text-neutral-500" title={s.createdAt}>
              Added {formatShortDateFromIso(s.createdAt)}
            </span>
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

          {showIdeationControls ? (
            <div className="mt-4 flex flex-col gap-2">
              <label className="text-xs font-medium text-neutral-600">
                Status
                <select
                  value={s.status}
                  onChange={(e) => onStatusChange(s, e.target.value as StrategyStatus)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm outline-none transition focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/5"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onSendForApproval(s)}
                  disabled={s.status === 'Under Review'}
                  className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send for approval
                </button>
                <button
                  type="button"
                  onClick={() => onPost(s)}
                  className="flex-1 rounded-xl bg-[var(--color-accent)] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 active:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Post it
                </button>
              </div>
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  )
}

function PostItModal({
  strategy,
  contentCategories,
  onClose,
  onConfirm,
}: {
  strategy: StrategyCard
  contentCategories: Array<{ id: string; name: string }>
  onClose: () => void
  onConfirm: (payload: {
    platforms: string[]
    categoryId: string
    subCategory: string
    country: string
    topic: string
    product: string
    idea: string
    scripts: string
    contentType: string
    postedDate: string
    day: string
    copy: string
    postLink?: string
  }) => void
}) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(() => [strategy.platform].filter(Boolean))
  const [categoryId, setCategoryId] = useState(() => contentCategories[0]?.id ?? '')
  const [subCategory, setSubCategory] = useState('')
  const [country, setCountry] = useState('')
  const [topic, setTopic] = useState('')
  const [product, setProduct] = useState('')
  const [idea, setIdea] = useState(strategy.hook)
  const [scripts, setScripts] = useState(strategy.scriptPreview)
  const [contentType, setContentType] = useState('')
  const [postedDate, setPostedDate] = useState(new Date().toISOString().slice(0, 10))
  const [copy, setCopy] = useState('')
  const [postLink, setPostLink] = useState('')

  const platformOptions = useMemo(() => ['TikTok', 'Instagram', 'YouTube', 'X'], [])
  const day = useMemo(() => dayFromIso(postedDate), [postedDate])

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
  }

  const canConfirm =
    selectedPlatforms.length > 0 &&
    !!categoryId &&
    subCategory.trim().length > 0 &&
    topic.trim().length > 0 &&
    postedDate.trim().length > 0

  return (
    <Modal
      open
      onClose={onClose}
      title="Post it"
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
            disabled={!canConfirm}
            onClick={() =>
              onConfirm({
                platforms: selectedPlatforms,
                categoryId,
                subCategory: subCategory.trim(),
                country: country.trim() || '—',
                topic: topic.trim(),
                product: product.trim() || '—',
                idea: idea.trim() || strategy.hook,
                scripts: scripts.trim() || '—',
                contentType: contentType.trim() || '—',
                postedDate: postedDate.trim(),
                day,
                copy: copy.trim() || '—',
                postLink: postLink.trim(),
              })
            }
            className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95 active:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm & post
          </button>
        </>
      }
    >
      <div className="grid max-h-[70vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p className="text-xs font-medium text-neutral-600">Platforms</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {platformOptions.map((p) => {
              const selected = selectedPlatforms.includes(p)
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selected
                      ? 'bg-[var(--color-accent)] text-white shadow-sm'
                      : 'border border-neutral-200 bg-white text-neutral-700 shadow-sm hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  {p}
                </button>
              )
            })}
          </div>
        </div>

        <label className="block text-xs font-medium text-neutral-600">
          Category
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm outline-none transition focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/5"
          >
            {contentCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <Field label="Subcategory" value={subCategory} onChange={setSubCategory} placeholder="e.g. Surface care" />
        <Field label="Topic" value={topic} onChange={setTopic} placeholder="e.g. Quick disinfect routines" />
        <Field label="Country" value={country} onChange={setCountry} placeholder="e.g. United States" />
        <Field label="Content Type" value={contentType} onChange={setContentType} placeholder="e.g. IG Reel" />
        <Field label="Product" value={product} onChange={setProduct} placeholder="e.g. Clean routines" />
        <Field label="Posted date" value={postedDate} onChange={setPostedDate} placeholder="YYYY-MM-DD" />

        <Field
          label="Idea"
          value={idea}
          onChange={setIdea}
          placeholder="Idea"
          className="sm:col-span-2"
        />
        <Field
          label="Scripts"
          value={scripts}
          onChange={setScripts}
          placeholder="Scripts"
          multiline
          className="sm:col-span-2"
        />
        <Field
          label="Copy"
          value={copy}
          onChange={setCopy}
          placeholder="Caption / copy"
          multiline
          className="sm:col-span-2"
        />
        <Field
          label="Post link (optional)"
          value={postLink}
          onChange={setPostLink}
          placeholder="Paste your Instagram post URL after publishing"
          className="sm:col-span-2"
        />

        <div className="sm:col-span-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
          <span className="font-semibold text-neutral-800">Hook</span>: {strategy.hook}
          <span className="mx-2 text-neutral-300">·</span>
          <span className="font-semibold text-neutral-800">Day</span>: {day}
        </div>
      </div>
    </Modal>
  )
}

function dayFromIso(iso: string): string {
  const v = iso.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return '—'
  const [y, m, d] = v.split('-').map((x) => Number(x))
  const dt = new Date(Date.UTC(y, m - 1, d))
  const day = dt.toLocaleDateString(undefined, { weekday: 'short' })
  return day
}
