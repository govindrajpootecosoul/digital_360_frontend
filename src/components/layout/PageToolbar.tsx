import type { ReactNode } from 'react'

type SelectOption = { value: string; label: string }

export function PageToolbar({
  title,
  subtitle,
  searchPlaceholder = 'Search…',
  searchValue,
  onSearchChange,
  showSearch = true,
  filters,
  actions,
}: {
  title: string
  subtitle?: string
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (v: string) => void
  showSearch?: boolean
  filters?: ReactNode
  actions?: ReactNode
}) {
  const showToolbarRow = showSearch || !!filters || !!actions

  return (
    <div className="mb-8 w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-3xl text-sm text-neutral-500">{subtitle}</p> : null}
      </div>

      {showToolbarRow ? (
        <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
            {showSearch ? (
              <div className="relative w-full min-w-[200px] flex-1 max-w-2xl">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                    />
                  </svg>
                </span>
                <input
                  type="search"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 shadow-sm outline-none ring-0 transition placeholder:text-neutral-400 focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/5"
                />
              </div>
            ) : null}
            {filters ? (
              <div className="flex flex-wrap items-end gap-3 sm:gap-4">{filters}</div>
            ) : null}
          </div>

          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 sm:justify-end lg:justify-end">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export function ToolbarSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
}) {
  return (
    <label className="flex min-w-[min(100%,160px)] shrink-0 flex-row flex-wrap items-center gap-2 sm:min-w-[148px]">
      <span className="whitespace-nowrap text-xs font-medium text-neutral-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-[120px] flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm outline-none transition focus:border-neutral-300 focus:ring-2 focus:ring-neutral-900/5 sm:min-w-[132px] sm:flex-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
