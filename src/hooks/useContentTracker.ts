import { useContext } from 'react'
import { ContentTrackerContext } from '../context/contentTrackerContext'
import type { ContentTrackerContextValue } from '../context/contentTrackerContext'

export function useContentTracker(): ContentTrackerContextValue {
  const ctx = useContext(ContentTrackerContext)
  if (!ctx) {
    throw new Error('useContentTracker must be used within ContentTrackerProvider')
  }
  return ctx
}
