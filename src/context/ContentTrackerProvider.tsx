import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import seed from '../data/contentTracker.json'
import type {
  ContentCategory,
  ContentTrackerEntry,
  ContentTrackerSeed,
} from '../types/contentTracker'
import { ContentTrackerContext } from './contentTrackerContext'

const STORAGE_KEY = 'influra-content-tracker-v1'

function newId(prefix: string): string {
  const c = globalThis.crypto
  if (c?.randomUUID) return `${prefix}-${c.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function readSeed(): ContentTrackerSeed {
  return seed as ContentTrackerSeed
}

function loadPayload(): ContentTrackerSeed {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return readSeed()
    const parsed = JSON.parse(raw) as ContentTrackerSeed
    if (
      Array.isArray(parsed.categories) &&
      Array.isArray(parsed.entries) &&
      parsed.categories.length > 0
    ) {
      return {
        categories: parsed.categories,
        entries: parsed.entries.map((e) => ({
          ...e,
          date: (e as unknown as { date?: string }).date ?? '—',
          day: (e as unknown as { day?: string }).day ?? '—',
          contentType: (e as unknown as { contentType?: string }).contentType ?? '—',
          campaignTheme: (e as unknown as { campaignTheme?: string }).campaignTheme ?? '—',
          idea: (e as unknown as { idea?: string }).idea ?? '—',
          copy: (e as unknown as { copy?: string }).copy ?? '—',
          designerName: (e as unknown as { designerName?: string }).designerName ?? '—',
          designerStatus: (e as unknown as { designerStatus?: string }).designerStatus ?? '—',
        })),
      }
    }
  } catch {
    /* ignore */
  }
  return readSeed()
}

export function ContentTrackerProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<ContentCategory[]>(() => loadPayload().categories)
  const [entries, setEntries] = useState<ContentTrackerEntry[]>(() => loadPayload().entries)

  useEffect(() => {
    const payload: ContentTrackerSeed = { categories, entries }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [categories, entries])

  const addCategory = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setCategories((prev) => [...prev, { id: newId('cat'), name: trimmed }])
  }, [])

  const updateCategory = useCallback((id: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name: trimmed } : c)))
  }, [])

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
    setEntries((prev) => prev.filter((e) => e.categoryId !== id))
  }, [])

  const addEntry = useCallback((entry: Omit<ContentTrackerEntry, 'id'>) => {
    setEntries((prev) => [...prev, { ...entry, id: newId('ent') }])
  }, [])

  const updateEntry = useCallback((id: string, entry: Omit<ContentTrackerEntry, 'id'>) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...entry, id } : e)))
  }, [])

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const value = useMemo(
    () => ({
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
