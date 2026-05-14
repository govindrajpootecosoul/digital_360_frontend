export function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`
  return String(n)
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

/** `YYYY-MM-DD` → compact locale date (e.g. "May 14"; includes year if not current UTC year). */
export function formatShortDateFromIso(iso: string): string {
  const v = iso.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return v || '—'
  const [y, m, d] = v.split('-').map((x) => Number(x))
  const dt = new Date(Date.UTC(y, m - 1, d))
  const thisYear = new Date().getUTCFullYear()
  if (y === thisYear) {
    return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })
  }
  return dt.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
