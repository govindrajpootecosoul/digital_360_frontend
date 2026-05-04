import { createContext } from 'react'
import type { ContentTrackerEntry, ContentTrackerSeed } from '../types/contentTracker'

export type ContentTrackerContextValue = ContentTrackerSeed & {
  addCategory: (name: string) => void
  updateCategory: (id: string, name: string) => void
  deleteCategory: (id: string) => void
  addEntry: (entry: Omit<ContentTrackerEntry, 'id'>) => void
  updateEntry: (id: string, entry: Omit<ContentTrackerEntry, 'id'>) => void
  deleteEntry: (id: string) => void
}

export const ContentTrackerContext = createContext<ContentTrackerContextValue | null>(null)
