import { createContext } from 'react'
import type { ContentTrackerEntry, ContentTrackerSeed } from '../types/contentTracker'

export type ContentTrackerContextValue = ContentTrackerSeed & {
  loading: boolean
  loadError: string | null
  addCategory: (name: string) => Promise<void>
  updateCategory: (id: string, name: string) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  addEntry: (entry: Omit<ContentTrackerEntry, 'id'>) => void
  updateEntry: (id: string, entry: Omit<ContentTrackerEntry, 'id'>) => void
  deleteEntry: (id: string) => void
}

export const ContentTrackerContext = createContext<ContentTrackerContextValue | null>(null)
