import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { StrategyCard } from '../types/data'
import { StrategyLibraryContext } from './strategyLibraryContext'
import { apiDelete, apiGet, apiPatch, apiPost } from '../lib/api'

const DEFAULT_STATUS: StrategyCard['status'] = 'WIP'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function normalizeCreatedAt(raw?: string): string {
  const v = (raw ?? '').trim()
  if (!v || v === '—') return todayIso()
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  return todayIso()
}

function normalizeStatus(raw?: string): StrategyCard['status'] {
  const v = (raw ?? '').trim()
  if (v === 'Approved' || v === 'Under Review' || v === 'WIP' || v === 'Rejected') return v
  return DEFAULT_STATUS
}

type ListResponse<T> = { items: T[] }

export function StrategyLibraryProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [strategies, setStrategies] = useState<StrategyCard[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await apiGet<ListResponse<any>>('/strategies?limit=200')
        if (cancelled) return
        setStrategies(
          res.items.map((s) => ({
            id: s.id ?? String(s._id),
            category: s.category,
            platform: s.platform,
            hook: s.hook,
            scriptPreview: s.scriptPreview,
            referenceLink: s.referenceLink,
            createdAt: normalizeCreatedAt(s.createdAt),
            status: normalizeStatus(s.status),
          })) satisfies StrategyCard[],
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const addStrategy = useCallback((s: Omit<StrategyCard, 'id' | 'createdAt'>) => {
    ;(async () => {
      const created = await apiPost<any>('/strategies', {
        ...s,
        status: s.status ?? DEFAULT_STATUS,
        createdAt: todayIso(),
      })
      setStrategies((prev) => [
        ...prev,
        {
          id: created.id ?? String(created._id),
          category: created.category,
          platform: created.platform,
          hook: created.hook,
          scriptPreview: created.scriptPreview,
          referenceLink: created.referenceLink,
          createdAt: normalizeCreatedAt(created.createdAt),
          status: normalizeStatus(created.status),
        },
      ])
    })()
  }, [])

  const updateStrategy = useCallback((id: string, s: Omit<StrategyCard, 'id' | 'createdAt'>) => {
    ;(async () => {
      const updated = await apiPatch<any>(`/strategies/${id}`, s)
      setStrategies((prev) =>
        prev.map((x) =>
          x.id === id
            ? {
                id,
                category: updated.category ?? s.category,
                platform: updated.platform ?? s.platform,
                hook: updated.hook ?? s.hook,
                scriptPreview: updated.scriptPreview ?? s.scriptPreview,
                referenceLink: updated.referenceLink ?? s.referenceLink,
                createdAt: x.createdAt,
                status: normalizeStatus(updated.status ?? s.status ?? x.status ?? DEFAULT_STATUS),
              }
            : x,
        ),
      )
    })()
  }, [])

  const deleteStrategy = useCallback((id: string) => {
    ;(async () => {
      await apiDelete(`/strategies/${id}`)
      setStrategies((prev) => prev.filter((x) => x.id !== id))
    })()
  }, [])

  const value = useMemo(
    () => ({
      loading,
      strategies,
      addStrategy,
      updateStrategy,
      deleteStrategy,
    }),
    [loading, strategies, addStrategy, updateStrategy, deleteStrategy],
  )

  return <StrategyLibraryContext.Provider value={value}>{children}</StrategyLibraryContext.Provider>
}
