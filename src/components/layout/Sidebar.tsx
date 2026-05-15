import type { SVGProps } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const nav = [
  { to: '/', label: 'Dashboard', icon: IconHome },
  { to: '/influencers', label: 'Influencer Manager', icon: IconUsers },
  { to: '/outreach', label: 'Influencer Finder', icon: IconMail },
  { to: '/content', label: 'Content Tracker', icon: IconFilm },
  { to: '/strategy', label: 'Strategy Library', icon: IconLayers },
  { to: '/settings', label: 'Settings', icon: IconSettings },
] as const

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const { user, logout } = useAuth()
  const w = collapsed ? 'w-[72px]' : 'w-[248px]'
  const displayName = user?.displayName?.trim()
  const primaryLabel = displayName || user?.email
  const showEmailBelow = Boolean(user?.email && displayName && displayName !== user.email)

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-svh flex-col border-r border-neutral-200/80 bg-white/90 backdrop-blur-md transition-[width] duration-300 ease-out ${w}`}
    >
      <div className={`flex h-14 items-center border-b border-neutral-100 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-neutral-200 shadow-sm">
            <img src="/influra-logo.png" alt="Digital 360 logo" className="h-full w-full object-contain" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-neutral-900">Digital 360</p>
              <p className="truncate text-[11px] text-neutral-500">Influencer OS</p>
            </div>
          ) : null}
        </div>
        {!collapsed ? (
          <button
            type="button"
            onClick={onToggle}
            className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Collapse sidebar"
          >
            <IconChevronLeft className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {collapsed ? (
        <div className="flex justify-center border-b border-neutral-100 py-2">
          <button
            type="button"
            onClick={onToggle}
            className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Expand sidebar"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
      <nav className="flex-1 space-y-0.5 p-2">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            title={item.label}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--color-accent)] text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              } ${collapsed ? 'justify-center px-2' : ''}`
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0 opacity-90" />
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
          </NavLink>
        ))}
      </nav>
      <div className={`border-t border-neutral-100 p-3 ${collapsed ? 'text-center' : ''}`}>
        {!collapsed ? (
          <div className="space-y-2">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium text-neutral-700" title={primaryLabel}>
                {primaryLabel}
              </p>
              {showEmailBelow ? (
                <p className="truncate text-[10px] text-neutral-500" title={user.email}>
                  {user.email}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className="w-full rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-[11px] font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Log out
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => logout()}
            className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 ring-1 ring-neutral-200 transition hover:bg-neutral-100 hover:text-neutral-900"
            title="Log out"
            aria-label="Log out"
          >
            <IconLogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  )
}

function IconLogOut(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M15 12H4M10 8l-4 4 4 4M20 4v16" />
    </svg>
  )
}
function IconHome(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" />
    </svg>
  )
}
function IconUsers(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={1.5} strokeLinecap="round" d="M16 11a4 4 0 10-8 0 4 4 0 008 0z" />
      <path strokeWidth={1.5} strokeLinecap="round" d="M4 20a6 6 0 0112 0M14 20a6 6 0 016-6" />
    </svg>
  )
}
function IconMail(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={1.5} strokeLinecap="round" d="M4 6h16v12H4z" />
      <path strokeWidth={1.5} strokeLinecap="round" d="M4 7l8 6 8-6" />
    </svg>
  )
}
function IconFilm(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={1.5} strokeLinecap="round" d="M4 7h16v10H4zM8 7V5M16 7V5" />
      <path strokeWidth={1.5} d="M8 17v2M16 17v2" />
    </svg>
  )
}
function IconLayers(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={1.5} strokeLinecap="round" d="M12 4l9 5-9 5-9-5 9-5zM4 13l8 5 8-5" />
    </svg>
  )
}
function IconSettings(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
      />
      <path
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
      />
    </svg>
  )
}
function IconChevronLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
    </svg>
  )
}
function IconChevronRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
    </svg>
  )
}
