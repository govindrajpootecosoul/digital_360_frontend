import type { ButtonHTMLAttributes, SVGProps } from 'react'

/** Shared row / card actions — blue edit, red delete (use across the app). */
const editIconButtonClass =
  'inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35'

const deleteIconButtonClass =
  'inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-red-600 transition hover:bg-red-50 hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/35'

const downloadIconButtonClass =
  'inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-orange-600 transition hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/35'

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
  className?: string
  'aria-label': string
}

export function EditIconButton({ className = '', ...props }: IconButtonProps) {
  return (
    <button type="button" className={`${editIconButtonClass} ${className}`} {...props}>
      <IconEditGlyph className="h-4 w-4" />
    </button>
  )
}

export function DeleteIconButton({ className = '', ...props }: IconButtonProps) {
  return (
    <button type="button" className={`${deleteIconButtonClass} ${className}`} {...props}>
      <IconDeleteGlyph className="h-4 w-4" />
    </button>
  )
}

export function DownloadIconButton({ className = '', ...props }: IconButtonProps) {
  return (
    <button type="button" className={`${downloadIconButtonClass} ${className}`} {...props}>
      <IconDownloadGlyph className="h-4 w-4" />
    </button>
  )
}

export function IconEditGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden {...props}>
      <path
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L8 18l-4 1 1-4L16.5 3.5z"
      />
    </svg>
  )
}

export function IconDeleteGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden {...props}>
      <path
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"
      />
    </svg>
  )
}

export function IconDownloadGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden {...props}>
      <path
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v10m0 0l4-4m-4 4l-4-4M4 17v3h16v-3"
      />
    </svg>
  )
}
