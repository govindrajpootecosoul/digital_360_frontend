import type { ReactNode } from 'react'
import { useEffect } from 'react'

export function SidePanel({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  open: boolean
  title: string
  subtitle?: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close panel"
        className="absolute inset-0 bg-neutral-950/35 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col border-l border-neutral-200/90 bg-white shadow-[0_24px_80px_-12px_rgba(15,23,42,0.25)]">
        <div className="flex items-start justify-between gap-3 border-b border-neutral-100 px-6 py-5">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold tracking-tight text-neutral-900">
              {title}
            </h2>
            {subtitle ? (
              <div className="mt-1 text-sm text-neutral-500">{subtitle}</div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 text-sm text-neutral-700">
          {children}
        </div>
        {footer ? (
          <div className="border-t border-neutral-100 px-6 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  )
}

