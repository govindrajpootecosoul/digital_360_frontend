import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DeleteIconButton, EditIconButton } from '../components/ui/ActionIcons'
import { useContentTracker } from '../hooks/useContentTracker'
import { Card, CardHeader } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Table, type TableColumn } from '../components/ui/Table'
import type { ContentCategory } from '../types/contentTracker'

export function SettingsPage() {
  const { categories, updateCategory, deleteCategory } = useContentTracker()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [active, setActive] = useState<ContentCategory | null>(null)
  const [editName, setEditName] = useState('')

  const openEdit = (c: ContentCategory) => {
    setActive(c)
    setEditName(c.name)
    setEditOpen(true)
  }

  const openDelete = (c: ContentCategory) => {
    setActive(c)
    setDeleteOpen(true)
  }

  const columns: TableColumn<ContentCategory>[] = [
    { id: 'name', header: 'Category', cell: (r) => <span className="font-medium text-neutral-900">{r.name}</span> },
    { id: 'id', header: 'Id', cell: (r) => <span className="font-mono text-xs text-neutral-500">{r.id}</span> },
    {
      id: 'actions',
      header: 'Actions',
      className: 'w-[1%] whitespace-nowrap',
      cell: (r) => (
        <div className="flex justify-end gap-0.5">
          <EditIconButton aria-label={`Edit category ${r.name}`} onClick={() => openEdit(r)} />
          <DeleteIconButton aria-label={`Delete category ${r.name}`} onClick={() => openDelete(r)} />
        </div>
      ),
    },
  ]

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage content tracker categories. Deleting a category removes its entries from the tracker.
        </p>
        <p className="mt-3 text-sm">
          <Link to="/content" className="font-medium text-[var(--color-accent)] underline-offset-2 hover:underline">
            ← Back to Content tracker
          </Link>
        </p>
      </header>

      <Card padding="p-5">
        <CardHeader title="Categories" subtitle="Edit names or remove categories you no longer use." />
        <Table columns={columns} rows={categories} emptyMessage="No categories yet. Add one from Content tracker." />
      </Card>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit category"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (active) updateCategory(active.id, editName)
                setEditOpen(false)
              }}
              className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95 active:opacity-90"
            >
              Save
            </button>
          </>
        }
      >
        <label className="block text-xs font-medium text-neutral-600">
          Name
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-neutral-900/5"
          />
        </label>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete category"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (active) deleteCategory(active.id)
                setDeleteOpen(false)
              }}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          Delete <span className="font-semibold text-neutral-900">{active?.name}</span>? All content tracker entries in
          this category will be removed from this device (local demo storage).
        </p>
      </Modal>
    </div>
  )
}
