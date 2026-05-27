/** Coalesce identical in-flight GETs (e.g. React remounts) into one network call. */
const inflight = new Map<string, Promise<unknown>>()

export function dedupeGet<T>(key: string, run: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key)
  if (existing) return existing as Promise<T>

  const promise = run().finally(() => {
    inflight.delete(key)
  })
  inflight.set(key, promise)
  return promise
}
