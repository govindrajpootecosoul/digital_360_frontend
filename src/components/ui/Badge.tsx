import type { ReactNode } from 'react'
import { badgeToneClasses, type BadgeTone } from '../../lib/badgeTones'

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-tight transition-colors ${badgeToneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
