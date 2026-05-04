export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent'

export const badgeToneClasses: Record<BadgeTone, string> = {
  neutral:
    'bg-neutral-100 text-neutral-700 ring-1 ring-inset ring-neutral-200/80',
  success: 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200/80',
  warning: 'bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-200/80',
  danger: 'bg-red-50 text-red-800 ring-1 ring-inset ring-red-200/80',
  info: 'bg-sky-50 text-sky-900 ring-1 ring-inset ring-sky-200/80',
  accent: 'bg-[var(--color-accent-muted)] text-[var(--color-accent)] ring-1 ring-inset ring-neutral-200/60',
}

export function statusTone(status: string): BadgeTone {
  const s = status.toLowerCase()
  if (s.includes('confirm') || s.includes('booked') || s.includes('replied')) return 'success'
  if (s.includes('negotiat') || s.includes('await')) return 'warning'
  if (s.includes('reject') || s.includes('declin')) return 'danger'
  if (s.includes('contact') || s.includes('sent')) return 'info'
  if (s.includes('not contact')) return 'neutral'
  return 'neutral'
}

export function performanceTone(p: string): BadgeTone {
  if (p === 'High' || p === 'Top' || p === 'Strong') return 'success'
  if (p === 'Medium' || p === 'Average') return 'warning'
  if (p === 'Low' || p === 'Weak') return 'danger'
  return 'neutral'
}
