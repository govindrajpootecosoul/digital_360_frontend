import { createContext } from 'react'
import type { StrategyCard } from '../types/data'

export type StrategyLibraryContextValue = {
  strategies: StrategyCard[]
  addStrategy: (s: Omit<StrategyCard, 'id' | 'createdAt'>) => void
  updateStrategy: (id: string, s: Omit<StrategyCard, 'id' | 'createdAt'>) => void
  deleteStrategy: (id: string) => void
}

export const StrategyLibraryContext = createContext<StrategyLibraryContextValue | null>(null)
