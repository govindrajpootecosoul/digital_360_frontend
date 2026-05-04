export type Platform = 'YouTube' | 'Instagram' | 'TikTok' | 'X'

function normalizePlatform(p: string): Platform | null {
  const v = p.trim().toLowerCase()
  if (v === 'youtube' || v === 'yt') return 'YouTube'
  if (v === 'instagram' || v === 'ig') return 'Instagram'
  if (v === 'tiktok' || v === 'tt') return 'TikTok'
  if (v === 'x' || v === 'twitter') return 'X'
  return null
}

export function PlatformIcon({
  platform,
  size = 18,
  showLabel = false,
  className = '',
}: {
  platform: string
  size?: number
  showLabel?: boolean
  className?: string
}) {
  const p = normalizePlatform(platform)
  const label = p ?? platform

  return (
    <span
      className={`inline-flex items-center gap-2 ${className}`}
      title={label}
      aria-label={label}
    >
      <span
        className="inline-flex items-center justify-center rounded-md border border-neutral-200 bg-white shadow-sm"
        style={{ width: size + 10, height: size + 10 }}
        aria-hidden
      >
        {p === 'Instagram' ? (
          <IconInstagram styleSize={size} />
        ) : p === 'TikTok' ? (
          <IconTikTok styleSize={size} />
        ) : p === 'YouTube' ? (
          <IconYouTube styleSize={size} />
        ) : p === 'X' ? (
          <IconX styleSize={size} />
        ) : (
          <IconGeneric styleSize={size} />
        )}
      </span>
      {showLabel ? <span className="text-sm text-neutral-700">{label}</span> : null}
    </span>
  )
}

function IconInstagram({ styleSize }: { styleSize: number }) {
  return (
    <svg
      width={styleSize}
      height={styleSize}
      viewBox="0 0 24 24"
      aria-hidden
      className="text-neutral-900"
    >
      <defs>
        <linearGradient id="ig" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f58529" />
          <stop offset="40%" stopColor="#dd2a7b" />
          <stop offset="70%" stopColor="#8134af" />
          <stop offset="100%" stopColor="#515bd4" />
        </linearGradient>
      </defs>
      <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="4.2" fill="url(#ig)" />
      <circle cx="12" cy="12" r="3.5" fill="none" stroke="white" strokeWidth="1.8" />
      <circle cx="16.9" cy="7.3" r="1.1" fill="white" />
    </svg>
  )
}

function IconTikTok({ styleSize }: { styleSize: number }) {
  return (
    <svg width={styleSize} height={styleSize} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M14 5c1.1 2 2.7 3.2 5 3.4V12c-2.1 0-3.8-.7-5-1.7v5.3c0 3-2.4 5.4-5.4 5.4S3.2 18.6 3.2 15.6 5.6 10.2 8.6 10.2c.4 0 .8 0 1.2.1v3.1c-.3-.1-.6-.2-1-.2-1.3 0-2.4 1.1-2.4 2.4S7.3 18 8.6 18 11 16.9 11 15.6V5h3z"
        fill="#111827"
      />
      <path
        d="M14 5c.7 1.6 2 2.8 3.8 3.3v2.6c-1.5-.2-2.8-.8-3.8-1.6v5.9c0 3-2.4 5.4-5.4 5.4-1.8 0-3.4-.8-4.4-2.1 1 1 2.4 1.6 3.9 1.6 3 0 5.4-2.4 5.4-5.4V5h.5z"
        fill="#ef4444"
        opacity=".85"
      />
      <path
        d="M10 11.4v2.4c-.3-.1-.6-.2-1-.2-1.3 0-2.4 1.1-2.4 2.4 0 .7.3 1.3.7 1.8-1-1-1.6-2.3-1.6-3.8 0-3 2.4-5.4 5.4-5.4.3 0 .6 0 .9.1z"
        fill="#06b6d4"
        opacity=".9"
      />
    </svg>
  )
}

function IconYouTube({ styleSize }: { styleSize: number }) {
  return (
    <svg width={styleSize} height={styleSize} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M21.6 7.7a2.8 2.8 0 00-2-2C17.9 5.2 12 5.2 12 5.2s-5.9 0-7.6.5a2.8 2.8 0 00-2 2A29.4 29.4 0 002 12a29.4 29.4 0 00.4 4.3 2.8 2.8 0 002 2c1.7.5 7.6.5 7.6.5s5.9 0 7.6-.5a2.8 2.8 0 002-2A29.4 29.4 0 0022 12a29.4 29.4 0 00-.4-4.3z"
        fill="#ef4444"
      />
      <path d="M10 15.3V8.7L16 12l-6 3.3z" fill="white" />
    </svg>
  )
}

function IconX({ styleSize }: { styleSize: number }) {
  return (
    <svg width={styleSize} height={styleSize} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M18.6 3H21l-6.6 7.5L22 21h-6.2l-4.9-6.3L5.5 21H3l7.1-8.1L2 3h6.4l4.4 5.7L18.6 3zm-1.1 16h1.3L7.2 4.9H5.8L17.5 19z"
        fill="#111827"
      />
    </svg>
  )
}

function IconGeneric({ styleSize }: { styleSize: number }) {
  return (
    <svg width={styleSize} height={styleSize} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2a10 10 0 100 20 10 10 0 000-20zm5.5 10a8.1 8.1 0 01-.3 2H6.8a8.1 8.1 0 010-4h10.4c.2.6.3 1.3.3 2zm-1.2 4a8 8 0 01-2 2H9.7a8 8 0 01-2-2h8.6zM7.7 8a8 8 0 012-2h4.6a8 8 0 012 2H7.7z"
        fill="#6b7280"
      />
    </svg>
  )
}

