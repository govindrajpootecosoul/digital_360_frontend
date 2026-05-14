import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DeleteIconButton, EditIconButton } from '../components/ui/ActionIcons'
import { useContentTracker } from '../hooks/useContentTracker'
import { Card, CardHeader } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Table, type TableColumn } from '../components/ui/Table'
import type { ContentCategory } from '../types/contentTracker'

export function SettingsPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useContentTracker()
  const [addOpen, setAddOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [active, setActive] = useState<ContentCategory | null>(null)
  const [editName, setEditName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const openEdit = (c: ContentCategory) => {
    setAddOpen(false)
    setDeleteOpen(false)
    setFormError(null)
    setActive(c)
    setEditName(c.name)
    setEditOpen(true)
  }

  const openDelete = (c: ContentCategory) => {
    setAddOpen(false)
    setEditOpen(false)
    setFormError(null)
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
        <div className="flex justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
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
        <CardHeader
          title="Categories"
          subtitle="Add new categories, edit names, or remove ones you no longer use."
          action={
            <button
              type="button"
              onClick={() => {
                setNewCatName('')
                setFormError(null)
                setAddOpen(true)
              }}
              className="shrink-0 rounded-xl bg-[var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 active:opacity-90"
            >
              Add category
            </button>
          }
        />
        <Table
          columns={columns}
          rows={categories}
          emptyMessage="No categories yet. Use Add category above to create one."
        />
      </Card>

      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false)
          setFormError(null)
        }}
        title="Add category"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setAddOpen(false)
                setFormError(null)
              }}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                const t = newCatName.trim()
                if (!t) {
                  setFormError('Enter a category name.')
                  return
                }
                setFormError(null)
                setSaving(true)
                try {
                  await addCategory(t)
                  setNewCatName('')
                  setAddOpen(false)
                } catch (e) {
                  setFormError(e instanceof Error ? e.message : 'Could not create category.')
                } finally {
                  setSaving(false)
                }
              }}
              className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95 active:opacity-90 disabled:opacity-50"
            >
              Save
            </button>
          </>
        }
      >
        {formError && addOpen ? <p className="mb-3 text-sm text-red-600">{formError}</p> : null}
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

      <Modal
        open={editOpen}
        onClose={() => {
          setEditOpen(false)
          setFormError(null)
        }}
        title="Edit category"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setEditOpen(false)
                setFormError(null)
              }}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                const t = editName.trim()
                if (!t) {
                  setFormError('Enter a category name.')
                  return
                }
                if (!active?.id) {
                  setFormError('Missing category id.')
                  return
                }
                setFormError(null)
                setSaving(true)
                try {
                  await updateCategory(active.id, t)
                  setEditOpen(false)
                  setActive(null)
                } catch (e) {
                  setFormError(e instanceof Error ? e.message : 'Could not update category.')
                } finally {
                  setSaving(false)
                }
              }}
              className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95 active:opacity-90 disabled:opacity-50"
            >
              Save
            </button>
          </>
        }
      >
        {formError && editOpen ? <p className="mb-3 text-sm text-red-600">{formError}</p> : null}
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
        onClose={() => {
          setDeleteOpen(false)
          setFormError(null)
        }}
        title="Delete category"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setDeleteOpen(false)
                setFormError(null)
              }}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                if (!active?.id) {
                  setFormError('Missing category id.')
                  return
                }
                setFormError(null)
                setSaving(true)
                try {
                  await deleteCategory(active.id)
                  setDeleteOpen(false)
                  setActive(null)
                } catch (e) {
                  setFormError(e instanceof Error ? e.message : 'Could not delete category.')
                } finally {
                  setSaving(false)
                }
              }}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          </>
        }
      >
        {formError && deleteOpen ? <p className="mb-3 text-sm text-red-600">{formError}</p> : null}
        <p className="text-sm text-neutral-600">
          Delete <span className="font-semibold text-neutral-900">{active?.name}</span>? The category is removed on the
          server, and entries in Content tracker that used it disappear from the list here.
        </p>
      </Modal>
    </div>
  )
}
