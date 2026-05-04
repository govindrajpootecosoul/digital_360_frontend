import { useMemo, useState } from 'react'
import influencerData from '../data/influencers.json'
import { DeleteIconButton, DownloadIconButton, EditIconButton } from '../components/ui/ActionIcons'
import { Badge } from '../components/ui/Badge'
import { statusTone } from '../lib/badgeTones'
import { Card } from '../components/ui/Card'
import { KanbanBoard } from '../components/ui/KanbanBoard'
import { PlatformIcon } from '../components/ui/PlatformIcon'
import { Modal } from '../components/ui/Modal'
import { SidePanel } from '../components/ui/SidePanel'
import { Table, type TableColumn } from '../components/ui/Table'
import { PageToolbar, ToolbarSelect } from '../components/layout/PageToolbar'
import { INFLUENCER_KANBAN_COLUMNS } from '../constants/kanban'
import { formatFollowers } from '../lib/format'
import { downloadCsv } from '../lib/csvDownload'
import type { Influencer } from '../types/data'

const seedRows = influencerData as Influencer[]

const platforms = ['All', ...Array.from(new Set(seedRows.map((r) => r.platform)))]
const categories = ['All', ...Array.from(new Set(seedRows.map((r) => r.category)))]

export function InfluencersPage() {
  const [rows, setRows] = useState<Influencer[]>(seedRows)
  const [view, setView] = useState<'table' | 'kanban'>('table')
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('All')
  const [category, setCategory] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editRow, setEditRow] = useState<Influencer | null>(null)
  const [deleteRow, setDeleteRow] = useState<Influencer | null>(null)
  const [activeRow, setActiveRow] = useState<Influencer | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      const okP = platform === 'All' || r.platform === platform
      const okC = category === 'All' || r.category === category
      const okQ =
        q === '' ||
        r.name.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q)
      return okP && okC && okQ
    })
  }, [rows, search, platform, category])

  const columns: TableColumn<Influencer>[] = [
    { id: 'name', header: 'Creator', cell: (r) => <span className="font-medium text-neutral-900">{r.name}</span> },
    { id: 'country', header: 'Country', cell: (r) => <span className="text-neutral-700">{r.country}</span> },
    { id: 'platform', header: 'Platform', cell: (r) => <PlatformIcon platform={r.platform} /> },
    { id: 'category', header: 'Category', cell: (r) => r.category },
    {
      id: 'followers',
      header: 'Followers',
      cell: (r) => <span className="tabular-nums">{formatFollowers(r.followers)}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge>,
    },
    { id: 'collab', header: 'Collaboration', cell: (r) => r.collaborationType },
    { id: 'last', header: 'Last Contact', cell: (r) => <span className="text-neutral-600">{r.lastContact}</span> },
    {
      id: 'actions',
      header: 'Actions',
      className: 'w-[1%] whitespace-nowrap',
      cell: (r) => (
        <div className="flex justify-end gap-0.5">
          <EditIconButton
            aria-label={`Edit influencer ${r.name}`}
            onClick={(e) => {
              e.stopPropagation()
              setEditRow(r)
            }}
          />
          <DeleteIconButton
            aria-label={`Delete influencer ${r.name}`}
            onClick={(e) => {
              e.stopPropagation()
              setDeleteRow(r)
            }}
          />
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageToolbar
        title="Influencer Manager"
        subtitle="CRM — table and board views with shared filters."
        searchValue={search}
        onSearchChange={setSearch}
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
          <div className="flex flex-wrap items-end gap-2">
            <DownloadIconButton
              aria-label="Download influencer manager CSV"
              onClick={() => {
                downloadCsv({
                  filename: `influencer-manager-${new Date().toISOString().slice(0, 10)}.csv`,
                  headers: [
                    'id',
                    'name',
                    'platform',
                    'category',
                    'country',
                    'creatorLink',
                    'productAsked',
                    'compensation',
                    'address',
                    'contentType',
                    'shipmentId',
                    'trackingLink',
                    'shipmentStatus',
                    'assetLink',
                    'paymentDetails',
                    'followers',
                    'status',
                    'collaborationType',
                    'lastContact',
                    'kanbanStatus',
                  ],
                  rows: filtered,
                })
              }}
            />
            <div className="flex rounded-xl border border-neutral-200 bg-white p-0.5 shadow-sm">
              <button
                type="button"
                onClick={() => setView('table')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  view === 'table' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Table
              </button>
              <button
                type="button"
                onClick={() => setView('kanban')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  view === 'kanban' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Kanban
              </button>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95 active:opacity-90"
            >
              Add Influencer
            </button>
          </div>
        }
      />

      {view === 'table' ? (
        <Table
          columns={columns}
          rows={filtered}
          emptyMessage="No influencers match your filters."
          onRowClick={(row) => setActiveRow(row)}
        />
      ) : (
        <Card padding="p-4">
          <KanbanBoard
            columns={INFLUENCER_KANBAN_COLUMNS}
            items={filtered}
            getColumnId={(i) => i.kanbanStatus}
          />
        </Card>
      )}

      <AddInfluencerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(next) => setRows((prev) => [next, ...prev])}
      />

      {editRow ? (
        <EditInfluencerModal
          key={editRow.id}
          row={editRow}
          onClose={() => setEditRow(null)}
          onSave={(next) => {
            setRows((prev) => prev.map((r) => (r.id === next.id ? next : r)))
            setEditRow(null)
          }}
        />
      ) : null}

      <Modal
        open={!!deleteRow}
        onClose={() => setDeleteRow(null)}
        title="Delete influencer"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteRow(null)}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (deleteRow) setRows((prev) => prev.filter((r) => r.id !== deleteRow.id))
                setDeleteRow(null)
              }}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          Remove <span className="font-semibold text-neutral-900">{deleteRow?.name}</span> from this demo list?
        </p>
      </Modal>

      <InfluencerDetailsPanel
        row={activeRow}
        onClose={() => setActiveRow(null)}
        onEdit={(r) => setEditRow(r)}
      />
    </div>
  )
}

function newId(prefix: string): string {
  const c = globalThis.crypto
  if (c?.randomUUID) return `${prefix}-${c.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function AddInfluencerModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (next: Influencer) => void
}) {
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [platform, setPlatform] = useState('')
  const [category, setCategory] = useState('')
  const [followers, setFollowers] = useState('')
  const [status, setStatus] = useState('Not Contacted')
  const [collaborationType, setCollaborationType] = useState('—')
  const [lastContact, setLastContact] = useState('—')
  const [creatorLink, setCreatorLink] = useState('')
  const [productAsked, setProductAsked] = useState('')
  const [compensation, setCompensation] = useState('')
  const [address, setAddress] = useState('')
  const [contentType, setContentType] = useState('')
  const [shipmentId, setShipmentId] = useState('')
  const [trackingLink, setTrackingLink] = useState('')
  const [shipmentStatus, setShipmentStatus] = useState('')
  const [assetLink, setAssetLink] = useState('')
  const [paymentDetails, setPaymentDetails] = useState('')

  const reset = () => {
    setName('')
    setCountry('')
    setPlatform('')
    setCategory('')
    setFollowers('')
    setStatus('Not Contacted')
    setCollaborationType('—')
    setLastContact('—')
    setCreatorLink('')
    setProductAsked('')
    setCompensation('')
    setAddress('')
    setContentType('')
    setShipmentId('')
    setTrackingLink('')
    setShipmentStatus('')
    setAssetLink('')
    setPaymentDetails('')
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      title="Add influencer"
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
              if (!name.trim()) return
              const next: Influencer = {
                id: newId('inf'),
                name: name.trim(),
                country: country.trim() || '—',
                platform: platform.trim() || '—',
                category: category.trim() || '—',
                followers: Number(followers) || 0,
                status: status.trim() || 'Not Contacted',
                collaborationType: collaborationType.trim() || '—',
                lastContact: lastContact.trim() || '—',
                kanbanStatus: status.trim() || 'Not Contacted',
                creatorLink: creatorLink.trim() || '—',
                productAsked: productAsked.trim() || '—',
                compensation: compensation.trim() || '—',
                address: address.trim() || '—',
                contentType: contentType.trim() || '—',
                shipmentId: shipmentId.trim() || '—',
                trackingLink: trackingLink.trim() || '—',
                shipmentStatus: shipmentStatus.trim() || '—',
                assetLink: assetLink.trim() || '—',
                paymentDetails: paymentDetails.trim() || '—',
              }
              onSave(next)
              reset()
              onClose()
            }}
            className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95 active:opacity-90"
          >
            Save
          </button>
        </>
      }
    >
      <div className="mt-1 grid max-h-[65vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
        <InlineField label="Creator name" value={name} onChange={setName} placeholder="Jordan Lee" />
        <InlineField label="Country" value={country} onChange={setCountry} placeholder="United States" />
        <InlineField label="Platform" value={platform} onChange={setPlatform} placeholder="Instagram" />
        <InlineField label="Category" value={category} onChange={setCategory} placeholder="Fitness" />
        <InlineField label="Followers" value={followers} onChange={setFollowers} placeholder="412000" />
        <InlineField label="Status" value={status} onChange={setStatus} placeholder="Not Contacted" />
        <InlineField label="Collaboration" value={collaborationType} onChange={setCollaborationType} placeholder="Paid / Affiliate / Gifting" />
        <InlineField label="Last contact" value={lastContact} onChange={setLastContact} placeholder="2026-05-02" />
        <InlineField label="Creator link" value={creatorLink} onChange={setCreatorLink} placeholder="https://…" className="sm:col-span-2" />
        <InlineField label="Product asked" value={productAsked} onChange={setProductAsked} placeholder="Hydrating serum kit" className="sm:col-span-2" />
        <InlineField label="Compensation" value={compensation} onChange={setCompensation} placeholder="$2,500 + usage rights" className="sm:col-span-2" />
        <InlineField label="Address" value={address} onChange={setAddress} placeholder="Los Angeles, CA, USA" className="sm:col-span-2" />
        <InlineField label="Content type" value={contentType} onChange={setContentType} placeholder="IG Reel / TikTok Short" className="sm:col-span-2" />
        <InlineField label="Shipment id" value={shipmentId} onChange={setShipmentId} placeholder="SHIP-10421" />
        <InlineField label="Shipment status" value={shipmentStatus} onChange={setShipmentStatus} placeholder="Delivered / In transit" />
        <InlineField label="Tracking link" value={trackingLink} onChange={setTrackingLink} placeholder="https://…" className="sm:col-span-2" />
        <InlineField label="Asset link" value={assetLink} onChange={setAssetLink} placeholder="https://…" className="sm:col-span-2" />
        <InlineField label="Payment details" value={paymentDetails} onChange={setPaymentDetails} placeholder="Net 15 · ACH" className="sm:col-span-2" />
      </div>
    </Modal>
  )
}

function EditInfluencerModal({
  row,
  onClose,
  onSave,
}: {
  row: Influencer
  onClose: () => void
  onSave: (next: Influencer) => void
}) {
  const [name, setName] = useState(row.name)
  const [platform, setPlatform] = useState(row.platform)
  const [category, setCategory] = useState(row.category)
  const [country, setCountry] = useState(row.country)
  const [followers, setFollowers] = useState(String(row.followers))
  const [status, setStatus] = useState(row.status)
  const [collaborationType, setCollaborationType] = useState(row.collaborationType)
  const [lastContact, setLastContact] = useState(row.lastContact)
  const [creatorLink, setCreatorLink] = useState(row.creatorLink)
  const [productAsked, setProductAsked] = useState(row.productAsked)
  const [compensation, setCompensation] = useState(row.compensation)
  const [address, setAddress] = useState(row.address)
  const [contentType, setContentType] = useState(row.contentType)
  const [shipmentId, setShipmentId] = useState(row.shipmentId)
  const [trackingLink, setTrackingLink] = useState(row.trackingLink)
  const [shipmentStatus, setShipmentStatus] = useState(row.shipmentStatus)
  const [assetLink, setAssetLink] = useState(row.assetLink)
  const [paymentDetails, setPaymentDetails] = useState(row.paymentDetails)

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit influencer"
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
            onClick={() =>
              onSave({
                ...row,
                name: name.trim() || row.name,
                platform: platform.trim() || row.platform,
                category: category.trim() || row.category,
                country: country.trim() || row.country,
                followers: Number(followers) || row.followers,
                status: status.trim() || row.status,
                collaborationType: collaborationType.trim() || row.collaborationType,
                lastContact: lastContact.trim() || row.lastContact,
                kanbanStatus: status.trim() || row.kanbanStatus,
                creatorLink: creatorLink.trim() || row.creatorLink,
                productAsked: productAsked.trim() || row.productAsked,
                compensation: compensation.trim() || row.compensation,
                address: address.trim() || row.address,
                contentType: contentType.trim() || row.contentType,
                shipmentId: shipmentId.trim() || row.shipmentId,
                trackingLink: trackingLink.trim() || row.trackingLink,
                shipmentStatus: shipmentStatus.trim() || row.shipmentStatus,
                assetLink: assetLink.trim() || row.assetLink,
                paymentDetails: paymentDetails.trim() || row.paymentDetails,
              })
            }
            className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95 active:opacity-90"
          >
            Save
          </button>
        </>
      }
    >
      <div className="mt-1 grid max-h-[65vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
        <InlineField label="Name" value={name} onChange={setName} placeholder="Maya Chen" />
        <InlineField label="Platform" value={platform} onChange={setPlatform} placeholder="TikTok" />
        <InlineField label="Category" value={category} onChange={setCategory} placeholder="Beauty" />
        <InlineField label="Country" value={country} onChange={setCountry} placeholder="United States" />
        <InlineField label="Followers" value={followers} onChange={setFollowers} placeholder="890000" />
        <InlineField label="Status" value={status} onChange={setStatus} placeholder="Contacted" />
        <InlineField label="Collaboration" value={collaborationType} onChange={setCollaborationType} placeholder="Paid" />
        <InlineField label="Last contact" value={lastContact} onChange={setLastContact} placeholder="2026-05-02" />
        <InlineField label="Creator link" value={creatorLink} onChange={setCreatorLink} placeholder="https://…" className="sm:col-span-2" />
        <InlineField label="Product asked" value={productAsked} onChange={setProductAsked} placeholder="Product request" className="sm:col-span-2" />
        <InlineField label="Compensation" value={compensation} onChange={setCompensation} placeholder="$…" className="sm:col-span-2" />
        <InlineField label="Address" value={address} onChange={setAddress} placeholder="Shipping address" className="sm:col-span-2" />
        <InlineField label="Content type" value={contentType} onChange={setContentType} placeholder="IG Reel / TikTok Short" className="sm:col-span-2" />
        <InlineField label="Shipment id" value={shipmentId} onChange={setShipmentId} placeholder="SHIP-…" />
        <InlineField label="Shipment status" value={shipmentStatus} onChange={setShipmentStatus} placeholder="In transit" />
        <InlineField label="Tracking link" value={trackingLink} onChange={setTrackingLink} placeholder="https://…" className="sm:col-span-2" />
        <InlineField label="Asset link" value={assetLink} onChange={setAssetLink} placeholder="https://…" className="sm:col-span-2" />
        <InlineField label="Payment details" value={paymentDetails} onChange={setPaymentDetails} placeholder="Net 15 · ACH" className="sm:col-span-2" />
      </div>
    </Modal>
  )
}

function InlineField({
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

function InfluencerDetailsPanel({
  row,
  onClose,
  onEdit,
}: {
  row: Influencer | null
  onClose: () => void
  onEdit: (r: Influencer) => void
}) {
  if (!row) return null
  return (
    <SidePanel
      open={!!row}
      onClose={onClose}
      title={row.name}
      subtitle={
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5">
            <PlatformIcon platform={row.platform} size={14} />
            <span>{row.platform}</span>
          </span>
          <span className="text-neutral-400">·</span>
          <span>{row.country}</span>
          <span className="text-neutral-400">·</span>
          <Badge tone={statusTone(row.status)}>{row.status}</Badge>
        </div>
      }
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onEdit(row)}
            className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95 active:opacity-90"
          >
            Edit
          </button>
        </div>
      }
    >
      <dl className="grid gap-4">
        <Detail label="Creator link" value={row.creatorLink} link />
        <Detail label="Product asked" value={row.productAsked} />
        <Detail label="Compensation" value={row.compensation} />
        <Detail label="Address" value={row.address} />
        <Detail label="Content type" value={row.contentType} />
        <div className="grid grid-cols-2 gap-4">
          <Detail label="Shipment id" value={row.shipmentId} />
          <Detail label="Shipment status" value={row.shipmentStatus} />
        </div>
        <Detail label="Tracking link" value={row.trackingLink} link />
        <Detail label="Asset link" value={row.assetLink} link />
        <Detail label="Payment details" value={row.paymentDetails} />
        <div className="grid grid-cols-2 gap-4">
          <Detail label="Followers" value={formatFollowers(row.followers)} />
          <Detail label="Last contact" value={row.lastContact} />
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
