import type { ReactNode } from 'react'

export function Card({
  children,
  className = '',
  padding = 'p-5',
}: {
  children: ReactNode
  className?: string
  padding?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-neutral-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-4px_rgba(15,23,42,0.08)] transition-shadow duration-300 hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_12px_32px_-6px_rgba(15,23,42,0.1)] ${padding} ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold tracking-tight text-neutral-900">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
