import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import seed from '../data/strategies.json'
import type { StrategyCard } from '../types/data'
import { StrategyLibraryContext } from './strategyLibraryContext'

const STORAGE_KEY = 'influra-strategy-library-v1'

function newId(): string {
  const c = globalThis.crypto
  if (c?.randomUUID) return `str-${c.randomUUID()}`
  return `str-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function normalizeCreatedAt(raw?: string): string {
  const v = (raw ?? '').trim()
  if (!v || v === '—') return todayIso()
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  return todayIso()
}

function loadStrategies(): StrategyCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return (seed as StrategyCard[]).map((s) => ({
        ...s,
        createdAt: normalizeCreatedAt((s as unknown as { createdAt?: string }).createdAt),
      }))
    }
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed) && parsed.length > 0) {
      return (parsed as StrategyCard[]).map((s) => ({
        ...s,
        createdAt: normalizeCreatedAt((s as unknown as { createdAt?: string }).createdAt),
      }))
    }
  } catch {
    /* ignore */
  }
  return (seed as StrategyCard[]).map((s) => ({
    ...s,
    createdAt: normalizeCreatedAt((s as unknown as { createdAt?: string }).createdAt),
  }))
}

export function StrategyLibraryProvider({ children }: { children: ReactNode }) {
  const [strategies, setStrategies] = useState<StrategyCard[]>(loadStrategies)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(strategies))
  }, [strategies])

  const addStrategy = useCallback((s: Omit<StrategyCard, 'id' | 'createdAt'>) => {
    setStrategies((prev) => [...prev, { ...s, id: newId(), createdAt: todayIso() }])
  }, [])

  const updateStrategy = useCallback((id: string, s: Omit<StrategyCard, 'id' | 'createdAt'>) => {
    setStrategies((prev) =>
      prev.map((x) => (x.id === id ? { ...s, id, createdAt: x.createdAt } : x)),
    )
  }, [])

  const deleteStrategy = useCallback((id: string) => {
    setStrategies((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const value = useMemo(
    () => ({
      strategies,
      addStrategy,
      updateStrategy,
      deleteStrategy,
    }),
    [strategies, addStrategy, updateStrategy, deleteStrategy],
  )

  return <StrategyLibraryContext.Provider value={value}>{children}</StrategyLibraryContext.Provider>
}
