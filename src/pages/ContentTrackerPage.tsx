import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DeleteIconButton, EditIconButton } from '../components/ui/ActionIcons'
import { PlatformIcon } from '../components/ui/PlatformIcon'
import { useContentTracker } from '../hooks/useContentTracker'
import { Card, CardHeader } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { SidePanel } from '../components/ui/SidePanel'
import { PageToolbar } from '../components/layout/PageToolbar'
import { Table, type TableColumn } from '../components/ui/Table'
import { formatNumber } from '../lib/format'
import type { ContentTrackerEntry } from '../types/contentTracker'

const ALL = 'all'

function strategyUrlForHook(hook: string): string {
  const p = new URLSearchParams()
  p.set('hook', hook)
  return `/strategy?${p.toString()}`
}

type EntryDialog = 'new' | ContentTrackerEntry | null

export function ContentTrackerPage() {
  const { categories, entries, addCategory, addEntry, updateEntry, deleteEntry } = useContentTracker()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(ALL)
  const [search, setSearch] = useState('')
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [entryDialog, setEntryDialog] = useState<EntryDialog>(null)
  const [deletingEntry, setDeletingEntry] = useState<ContentTrackerEntry | null>(null)
  const [activeRow, setActiveRow] = useState<ContentTrackerEntry | null>(null)
  const [newCatName, setNewCatName] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const byCat =
      selectedCategoryId === ALL
        ? entries
        : entries.filter((e) => e.categoryId === selectedCategoryId)
    if (!q) return byCat
    return byCat.filter(
      (e) =>
        e.subCategory.toLowerCase().includes(q) ||
        e.country.toLowerCase().includes(q) ||
        e.campaignTheme.toLowerCase().includes(q) ||
        e.contentType.toLowerCase().includes(q) ||
        e.designerName.toLowerCase().includes(q) ||
        e.designerStatus.toLowerCase().includes(q) ||
        e.topic.toLowerCase().includes(q) ||
        e.hook.toLowerCase().includes(q) ||
        e.scripts.toLowerCase().includes(q) ||
        e.platform.toLowerCase().includes(q),
    )
  }, [entries, selectedCategoryId, search])

  const defaultEntryCategoryId =
    selectedCategoryId === ALL ? categories[0]?.id ?? '' : selectedCategoryId

  const columns: TableColumn<ContentTrackerEntry>[] = useMemo(
    () => [
    {
      id: 'sub',
      header: 'Sub category',
      cell: (r) => <span className="font-medium text-neutral-900">{r.subCategory}</span>,
    },
    { id: 'country', header: 'Country', cell: (r) => <span className="text-neutral-700">{r.country}</span> },
    { id: 'plat', header: 'Platform', cell: (r) => <PlatformIcon platform={r.platform} /> },
    { id: 'topic', header: 'Topic', cell: (r) => <span className="max-w-[200px] truncate">{r.topic}</span> },
    { id: 'scripts', header: 'Scripts', cell: (r) => <span className="max-w-[180px] truncate text-neutral-600">{r.scripts}</span> },
    {
      id: 'hook',
      header: 'Hook',
      cell: (r) => (
        <Link
          to={strategyUrlForHook(r.hook)}
          className="max-w-[min(100vw,280px)] text-left text-sm font-medium text-[var(--color-accent)] underline-offset-2 transition hover:underline"
        >
          {r.hook}
        </Link>
      ),
    },
    {
      id: 'ref',
      header: 'Reference link',
      cell: (r) => (
        <a
          href={r.referenceLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-neutral-700 underline-offset-2 hover:text-neutral-900 hover:underline"
        >
          Open
          <span className="text-neutral-400" aria-hidden>
            ↗
          </span>
        </a>
      ),
    },
    { id: 'views', header: 'Views', cell: (r) => <span className="tabular-nums">{formatNumber(r.views)}</span> },
    { id: 'likes', header: 'Likes', cell: (r) => <span className="tabular-nums">{formatNumber(r.likes)}</span> },
    {
      id: 'comments',
      header: 'Comments',
      cell: (r) => <span className="tabular-nums">{formatNumber(r.comments)}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'w-[1%] whitespace-nowrap',
      cell: (r) => (
        <div className="flex justify-end gap-0.5">
          <EditIconButton
            aria-label={`Edit entry: ${r.hook}`}
            onClick={() => setEntryDialog(r)}
          />
          <DeleteIconButton
            aria-label={`Delete entry: ${r.hook}`}
            onClick={() => setDeletingEntry(r)}
          />
        </div>
      ),
    },
  ],
    [],
  )

  const activeCategoryName =
    selectedCategoryId === ALL
      ? 'All categories'
      : categories.find((c) => c.id === selectedCategoryId)?.name ?? 'Category'

  return (
    <div>
      <PageToolbar
        title="Content tracker"
        subtitle="Filter by category, then open a hook in Strategy library to manage its script."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          <CategoryPill
            label="All"
            selected={selectedCategoryId === ALL}
            onClick={() => setSelectedCategoryId(ALL)}
          />
          {categories.map((c) => (
            <CategoryPill
              key={c.id}
              label={c.name}
              selected={selectedCategoryId === c.id}
              onClick={() => setSelectedCategoryId(c.id)}
            />
          ))}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link
            to="/settings"
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
          >
            Manage categories
          </Link>
          <button
            type="button"
            onClick={() => {
              setNewCatName('')
              setCatModalOpen(true)
            }}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
          >
            Add category
          </button>
          <button
            type="button"
            onClick={() => setEntryDialog('new')}
            className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95 active:opacity-90"
          >
            Add entry
          </button>
        </div>
      </div>

      <Card padding="p-5">
        <CardHeader
          title="Entries"
          subtitle={`Showing ${filtered.length} row(s) · ${activeCategoryName}`}
        />
        <Table
          columns={columns}
          rows={filtered}
          emptyMessage="No entries for this category or search."
          onRowClick={(row) => setActiveRow(row)}
        />
      </Card>

      <Modal
        open={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title="Add category"
        footer={
          <>
            <button
              type="button"
              onClick={() => setCatModalOpen(false)}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                addCategory(newCatName)
                setCatModalOpen(false)
              }}
              className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95 active:opacity-90"
            >
              Save
            </button>
          </>
        }
      >
        <label className="block text-xs font-medium text-neutral-600">
          Category name
          <input
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="e.g. Pet care"
            className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none focus:ring-2 focus:ring-neutral-900/5"
          />
        </label>
      </Modal>

      {entryDialog ? (
        <EntryFormModal
          key={entryDialog === 'new' ? 'new-entry' : entryDialog.id}
          title={entryDialog === 'new' ? 'Add entry' : 'Edit entry'}
          initialEntry={entryDialog === 'new' ? null : entryDialog}
          categories={categories}
          defaultCategoryId={defaultEntryCategoryId}
          onClose={() => setEntryDialog(null)}
          onSave={(payload) => {
            if (entryDialog === 'new') {
              addEntry(payload)
            } else {
              updateEntry(entryDialog.id, payload)
            }
            setEntryDialog(null)
          }}
        />
      ) : null}

      <Modal
        open={!!deletingEntry}
        onClose={() => setDeletingEntry(null)}
        title="Delete entry"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeletingEntry(null)}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (deletingEntry) deleteEntry(deletingEntry.id)
                setDeletingEntry(null)
              }}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          Remove this row for <span className="font-semibold text-neutral-900">{deletingEntry?.hook}</span>? This only
          affects data stored in your browser for this demo.
        </p>
      </Modal>

      <ContentEntryDetailsPanel row={activeRow} onClose={() => setActiveRow(null)} />
    </div>
  )
}

function CategoryPill({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        selected
          ? 'bg-neutral-900 text-white shadow-sm'
          : 'border border-neutral-200 bg-white text-neutral-700 shadow-sm hover:border-neutral-300 hover:bg-neutral-50'
      }`}
    >
      {label}
    </button>
  )
}

function EntryFormModal({
  title,
  initialEntry,
  onClose,
  categories,
  defaultCategoryId,
  onSave,
}: {
  title: string
  initialEntry: ContentTrackerEntry | null
  onClose: () => void
  categories: { id: string; name: string }[]
  defaultCategoryId: string
  onSave: (e: Omit<ContentTrackerEntry, 'id'>) => void
}) {
  const [categoryId, setCategoryId] = useState(
    () => (initialEntry?.categoryId ?? defaultCategoryId) || categories[0]?.id || '',
  )
  const [subCategory, setSubCategory] = useState(() => initialEntry?.subCategory ?? '')
  const [country, setCountry] = useState(() => initialEntry?.country ?? '')
  const [date, setDate] = useState(() => initialEntry?.date ?? '')
  const [day, setDay] = useState(() => initialEntry?.day ?? '')
  const [contentType, setContentType] = useState(() => initialEntry?.contentType ?? '')
  const [campaignTheme, setCampaignTheme] = useState(() => initialEntry?.campaignTheme ?? '')
  const [idea, setIdea] = useState(() => initialEntry?.idea ?? '')
  const [copy, setCopy] = useState(() => initialEntry?.copy ?? '')
  const [designerName, setDesignerName] = useState(() => initialEntry?.designerName ?? '')
  const [designerStatus, setDesignerStatus] = useState(() => initialEntry?.designerStatus ?? '')
  const [platform, setPlatform] = useState(() => initialEntry?.platform ?? '')
  const [topic, setTopic] = useState(() => initialEntry?.topic ?? '')
  const [scripts, setScripts] = useState(() => initialEntry?.scripts ?? '')
  const [hook, setHook] = useState(() => initialEntry?.hook ?? '')
  const [referenceLink, setReferenceLink] = useState(() => initialEntry?.referenceLink ?? 'https://example.com')
  const [views, setViews] = useState(() => String(initialEntry?.views ?? 0))
  const [likes, setLikes] = useState(() => String(initialEntry?.likes ?? 0))
  const [comments, setComments] = useState(() => String(initialEntry?.comments ?? 0))

  const reset = () => {
    if (initialEntry) {
      setCategoryId(initialEntry.categoryId)
      setSubCategory(initialEntry.subCategory)
      setCountry(initialEntry.country)
      setDate(initialEntry.date)
      setDay(initialEntry.day)
      setContentType(initialEntry.contentType)
      setCampaignTheme(initialEntry.campaignTheme)
      setIdea(initialEntry.idea)
      setCopy(initialEntry.copy)
      setDesignerName(initialEntry.designerName)
      setDesignerStatus(initialEntry.designerStatus)
      setPlatform(initialEntry.platform)
      setTopic(initialEntry.topic)
      setScripts(initialEntry.scripts)
      setHook(initialEntry.hook)
      setReferenceLink(initialEntry.referenceLink)
      setViews(String(initialEntry.views))
      setLikes(String(initialEntry.likes))
      setComments(String(initialEntry.comments))
    } else {
      setCategoryId(defaultCategoryId || categories[0]?.id || '')
      setSubCategory('')
      setCountry('')
      setDate('')
      setDay('')
      setContentType('')
      setCampaignTheme('')
      setIdea('')
      setCopy('')
      setDesignerName('')
      setDesignerStatus('')
      setPlatform('')
      setTopic('')
      setScripts('')
      setHook('')
      setReferenceLink('https://example.com')
      setViews('0')
      setLikes('0')
      setComments('0')
    }
  }

  return (
    <Modal
      open
      onClose={() => {
        reset()
        onClose()
      }}
      title={title}
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              reset()
              onClose()
            }}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const cid = categoryId || categories[0]?.id
              if (!cid || !hook.trim()) return
              onSave({
                categoryId: cid,
                subCategory: subCategory.trim() || '—',
                country: country.trim() || '—',
                date: date.trim() || '—',
                day: day.trim() || '—',
                contentType: contentType.trim() || '—',
                campaignTheme: campaignTheme.trim() || '—',
                idea: idea.trim() || '—',
                copy: copy.trim() || '—',
                designerName: designerName.trim() || '—',
                designerStatus: designerStatus.trim() || '—',
                platform: platform.trim() || '—',
                topic: topic.trim() || '—',
                scripts: scripts.trim() || '—',
                hook: hook.trim(),
                referenceLink: referenceLink.trim() || 'https://example.com',
                views: Number(views) || 0,
                likes: Number(likes) || 0,
                comments: Number(comments) || 0,
              })
            }}
            className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95 active:opacity-90"
          >
            Save entry
          </button>
        </>
      }
    >
      {categories.length === 0 ? (
        <p className="text-sm text-neutral-500">Add a category first, then you can add entries.</p>
      ) : (
        <div className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
          <label className="block text-xs font-medium text-neutral-600 sm:col-span-2">
            Category
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-neutral-900/5"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <Field label="Sub category" value={subCategory} onChange={setSubCategory} placeholder="Surface care" />
          <Field label="Country" value={country} onChange={setCountry} placeholder="United States" />
          <Field label="Platform" value={platform} onChange={setPlatform} placeholder="TikTok" />
          <Field label="Date" value={date} onChange={setDate} placeholder="2026-05-02" />
          <Field label="Day" value={day} onChange={setDay} placeholder="Mon" />
          <Field label="Content type" value={contentType} onChange={setContentType} placeholder="TikTok Short" className="sm:col-span-2" />
          <Field label="Campaign theme" value={campaignTheme} onChange={setCampaignTheme} placeholder="Clean routines" className="sm:col-span-2" />
          <Field label="Idea" value={idea} onChange={setIdea} placeholder="Concept / outline" className="sm:col-span-2" />
          <Field label="Copy" value={copy} onChange={setCopy} placeholder="Caption / VO copy" className="sm:col-span-2" />
          <Field label="Designer name" value={designerName} onChange={setDesignerName} placeholder="Avery Singh" />
          <Field label="Designer status" value={designerStatus} onChange={setDesignerStatus} placeholder="In progress / Ready" />
          <Field label="Topic" value={topic} onChange={setTopic} className="sm:col-span-2" placeholder="Campaign angle" />
          <Field label="Scripts" value={scripts} onChange={setScripts} className="sm:col-span-2" placeholder="A — Outline" />
          <Field label="Hook" value={hook} onChange={setHook} className="sm:col-span-2" placeholder="Short hook line" />
          <Field
            label="Reference link"
            value={referenceLink}
            onChange={setReferenceLink}
            className="sm:col-span-2"
            placeholder="https://…"
          />
          <Field label="Views" value={views} onChange={setViews} placeholder="0" />
          <Field label="Likes" value={likes} onChange={setLikes} placeholder="0" />
          <Field label="Comments" value={comments} onChange={setComments} placeholder="0" />
        </div>
      )}
    </Modal>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  className = '',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  className?: string
}) {
  return (
    <label className={`block text-xs font-medium text-neutral-600 ${className}`}>
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none focus:ring-2 focus:ring-neutral-900/5"
      />
    </label>
  )
}

function ContentEntryDetailsPanel({
  row,
  onClose,
}: {
  row: ContentTrackerEntry | null
  onClose: () => void
}) {
  if (!row) return null

  return (
    <SidePanel
      open={!!row}
      onClose={onClose}
      title={row.hook}
      subtitle={
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5">
            <PlatformIcon platform={row.platform} size={14} />
            <span>{row.platform}</span>
          </span>
          <span className="text-neutral-400">·</span>
          <span>{row.country}</span>
          <span className="text-neutral-400">·</span>
          <span>{row.subCategory}</span>
        </div>
      }
    >
      <dl className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Detail label="Date" value={row.date} />
          <Detail label="Day" value={row.day} />
        </div>
        <Detail label="Content type" value={row.contentType} />
        <Detail label="Campaign theme" value={row.campaignTheme} />
        <Detail label="Idea" value={row.idea} />
        <Detail label="Copy" value={row.copy} />
        <div className="grid grid-cols-2 gap-4">
          <Detail label="Designer" value={row.designerName} />
          <Detail label="Designer status" value={row.designerStatus} />
        </div>
        <Detail label="Topic" value={row.topic} />
        <Detail label="Scripts" value={row.scripts} />
        <Detail label="Reference link" value={row.referenceLink} link />
        <div className="grid grid-cols-3 gap-4">
          <Detail label="Views" value={formatNumber(row.views)} />
          <Detail label="Likes" value={formatNumber(row.likes)} />
          <Detail label="Comments" value={formatNumber(row.comments)} />
        </div>
      </dl>
    </SidePanel>
  )
}

function Detail({
  label,
  value,
  link,
}: {
  label: string
  value: string
  link?: boolean
}) {
  const v = value?.trim() ? value : '—'
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-400">{label}</dt>
      <dd className="mt-1 text-sm text-neutral-900">
        {link && v !== '—' && v.startsWith('http') ? (
          <a
            href={v}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            {v}
          </a>
        ) : (
          <span className="text-neutral-800">{v}</span>
        )}
      </dd>
    </div>
  )
}
