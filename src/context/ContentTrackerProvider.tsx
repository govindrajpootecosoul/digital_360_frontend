import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ContentCategory, ContentTrackerEntry } from '../types/contentTracker'
import { ContentTrackerContext } from './contentTrackerContext'
import { apiDelete, apiGet, apiPatch, apiPost } from '../lib/api'

type ListResponse<T> = { items: T[] }

function categoryIdFromApi(row: { id?: unknown; _id?: unknown }): string {
  if (row.id != null && String(row.id).trim() !== '') return String(row.id)
  if (row._id != null && String(row._id).trim() !== '') return String(row._id)
  return ''
}

type ContentTrackerProviderProps = {
  children: ReactNode
  /** Settings: load category names only (skip heavy records list). */
  categoriesOnly?: boolean
}

export function ContentTrackerProvider({ children, categoriesOnly = false }: ContentTrackerProviderProps) {
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<ContentCategory[]>([])
  const [entries, setEntries] = useState<ContentTrackerEntry[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const cats = await apiGet<ListResponse<{ id: string; name: string }>>('/content/categories')
        if (cancelled) return
        setCategories(
          cats.items
            .map((c) => {
              const id = categoryIdFromApi(c as { id?: unknown; _id?: unknown })
              const name = typeof (c as { name?: unknown }).name === 'string' ? (c as { name: string }).name : ''
              return id && name ? { id, name } : null
            })
            .filter((c): c is ContentCategory => c != null),
        )
        if (categoriesOnly) {
          setEntries([])
          return
        }
        const recs = await apiGet<ListResponse<any>>('/records?limit=200')
        if (cancelled) return
        setEntries(
          recs.items.map((r) => ({
            id: r.id ?? String(r._id),
            categoryId: r.categoryId,
            subCategory: r.subCategory,
            country: r.country,
            date: r.date,
            day: r.day,
            contentType: r.contentType,
            campaignTheme: r.campaignTheme,
            idea: r.idea,
            copy: r.copy,
            designerName: r.designerName,
            designerStatus: r.designerStatus,
            platform: r.platform,
            topic: r.topic,
            scripts: r.scripts,
            hook: r.hook,
            isOwn: Boolean(r.isOwn),
            postLink: r.postLink,
            referenceLink: r.referenceLink,
            views: r.views ?? 0,
            likes: r.likes ?? 0,
            comments: r.comments != null ? String(r.comments) : '0',
          })) satisfies ContentTrackerEntry[],
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [categoriesOnly])

  const addCategory = useCallback((name: string): Promise<void> => {
    const trimmed = name.trim()
    if (!trimmed) return Promise.resolve()
    return (async () => {
      const created = await apiPost<any>('/content/categories', { name: trimmed })
      const id = categoryIdFromApi(created)
      if (!id) return
      const nextName = typeof created?.name === 'string' && created.name.trim() ? created.name.trim() : trimmed
      setCategories((prev) => [...prev, { id, name: nextName }])
    })()
  }, [])

  const updateCategory = useCallback((id: string, name: string): Promise<void> => {
    const trimmed = name.trim()
    if (!trimmed) return Promise.resolve()
    const safeId = encodeURIComponent(id)
    return (async () => {
      const updated = await apiPatch<any>(`/content/categories/${safeId}`, { name: trimmed })
      const nextId = categoryIdFromApi(updated) || id
      const nextName = typeof updated?.name === 'string' && updated.name.trim() ? updated.name.trim() : trimmed
      setCategories((prev) => prev.map((c) => (c.id === id ? { id: nextId, name: nextName } : c)))
    })()
  }, [])

  const deleteCategory = useCallback((id: string): Promise<void> => {
    const cid = id?.trim()
    if (!cid) return Promise.resolve()
    const safeId = encodeURIComponent(cid)
    return (async () => {
      await apiDelete(`/content/categories/${safeId}`)
      setCategories((prev) => prev.filter((c) => c.id !== cid))
      setEntries((prev) => prev.filter((e) => e.categoryId !== cid))
    })()
  }, [])

  const addEntry = useCallback((entry: Omit<ContentTrackerEntry, 'id'>) => {
    ;(async () => {
      const created = await apiPost<any>('/records', entry)
      const id = created.id ?? String(created._id)
      setEntries((prev) => [...prev, { ...entry, id }])
    })()
  }, [])

  const updateEntry = useCallback((id: string, entry: Omit<ContentTrackerEntry, 'id'>) => {
    ;(async () => {
      await apiPatch<any>(`/records/${id}`, entry)
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...entry, id } : e)))
    })()
  }, [])

  const deleteEntry = useCallback((id: string) => {
    ;(async () => {
      await apiDelete(`/records/${id}`)
      setEntries((prev) => prev.filter((e) => e.id !== id))
    })()
  }, [])

  const value = useMemo(
    () => ({
      loading,
      categories,
      entries,
      addCategory,
      updateCategory,
      deleteCategory,
      addEntry,
      updateEntry,
      deleteEntry,
    }),
    [
      loading,
      categories,
      entries,
      addCategory,
      updateCategory,
      deleteCategory,
      addEntry,
      updateEntry,
      deleteEntry,
    ],
  )

  return <ContentTrackerContext.Provider value={value}>{children}</ContentTrackerContext.Provider>
}
