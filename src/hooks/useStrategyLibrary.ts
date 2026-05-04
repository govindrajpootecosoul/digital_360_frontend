import { useContext } from 'react'
import { StrategyLibraryContext } from '../context/strategyLibraryContext'
import type { StrategyLibraryContextValue } from '../context/strategyLibraryContext'

export function useStrategyLibrary(): StrategyLibraryContextValue {
  const ctx = useContext(StrategyLibraryContext)
  if (!ctx) {
    throw new Error('useStrategyLibrary must be used within StrategyLibraryProvider')
  }
  return ctx
}
