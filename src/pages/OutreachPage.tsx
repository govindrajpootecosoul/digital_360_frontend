import { useMemo, useState } from 'react'
import influencersCsv from '../../instagram_influencers.csv?raw'
import { PageToolbar } from '../components/layout/PageToolbar'
import { Table, type TableColumn } from '../components/ui/Table'
import { DownloadIconButton } from '../components/ui/ActionIcons'
import { downloadCsv } from '../lib/csvDownload'

const LEDGER_PAGE_SIZE = 50

type InstagramInfluencer = {
  id: string
  username: string
  fullName: string
  followerCount: number
  followingCount: number
  mediaCount: number
  engagementRate: number
  influencerTier: string
  influencerScore: number
  isVerified: boolean
  category: string
  age: number | null
  ethnicity: string
  gender: string
  city: string
  state: string
  country: string
  biography: string
  externalUrl: string
  keywords: string
  analysis: string
}

export function OutreachPage() {
  const [country, setCountry] = useState('')
  const [category, setCategory] = useState('')
  const [minFollowers, setMinFollowers] = useState('')
  const [maxFollowers, setMaxFollowers] = useState('')
  const [appliedQuery, setAppliedQuery] = useState<{
    country: string
    category: string
    minFollowers?: number
    maxFollowers?: number
  } | null>(null)

  const [ledgerPage, setLedgerPage] = useState(1)

  const influencers = useMemo(() => {
    const rows = parseCsv(influencersCsv)
    const seen = new Set<string>()
    return rows
      .map((r, idx) => {
        const username = (r.username ?? '').trim()
        const baseId = username || `row-${idx + 1}`
        const id = seen.has(baseId) ? `${baseId}-${idx + 1}` : baseId
        seen.add(id)

        return {
          id,
          username,
          fullName: (r.fullName ?? '').trim(),
          followerCount: parseNumber(r.followerCount),
          followingCount: parseNumber(r.followingCount),
          mediaCount: parseNumber(r.mediaCount),
          engagementRate: parseNumber(r.engagementRate),
          influencerTier: (r.influencerTier ?? '').trim(),
          influencerScore: parseNumber(r.influencerScore),
          isVerified: parseBoolean(r.isVerified),
          category: (r.category ?? '').trim(),
          age: parseNullableNumber(r.age),
          ethnicity: (r.ethnicity ?? '').trim(),
          gender: (r.gender ?? '').trim(),
          city: (r.city ?? '').trim(),
          state: (r.state ?? '').trim(),
          country: (r.country ?? '').trim(),
          biography: (r.biography ?? '').trim(),
          externalUrl: (r.externalUrl ?? '').trim(),
          keywords: (r.keywords ?? '').trim(),
          analysis: (r.analysis ?? '').trim(),
        } satisfies InstagramInfluencer
      })
      .filter((r) => r.username || r.fullName)
  }, [])

  const countries = useMemo(() => Array.from(new Set(influencers.map((i) => i.country))).filter(Boolean).sort(), [influencers])
  const categories = useMemo(() => Array.from(new Set(influencers.map((i) => i.category))).filter(Boolean).sort(), [influencers])

  const influencerResults = useMemo(() => {
    if (!appliedQuery) return []
    const c = appliedQuery.country.trim().toLowerCase()
    const cat = appliedQuery.category.trim().toLowerCase()
    const min = appliedQuery.minFollowers
    const max = appliedQuery.maxFollowers

    return influencers.filter((i) => {
      const okCountry = !c || i.country.trim().toLowerCase() === c
      const okCategory = !cat || i.category.trim().toLowerCase() === cat
      const okMin = typeof min !== 'number' || i.followerCount >= min
      const okMax = typeof max !== 'number' || i.followerCount <= max
      return okCountry && okCategory && okMin && okMax
    })
  }, [appliedQuery, influencers])

  const ledgerTotalPages = useMemo(() => {
    if (influencerResults.length === 0) return 1
    return Math.ceil(influencerResults.length / LEDGER_PAGE_SIZE)
  }, [influencerResults.length])

  const safeLedgerPage = Math.min(Math.max(1, ledgerPage), ledgerTotalPages)

  const ledgerPageRows = useMemo(() => {
    const start = (safeLedgerPage - 1) * LEDGER_PAGE_SIZE
    return influencerResults.slice(start, start + LEDGER_PAGE_SIZE)
  }, [influencerResults, safeLedgerPage])

  const ledgerRangeStart = influencerResults.length === 0 ? 0 : (safeLedgerPage - 1) * LEDGER_PAGE_SIZE + 1
  const ledgerRangeEnd = Math.min(safeLedgerPage * LEDGER_PAGE_SIZE, influencerResults.length)

  const influencerColumns: TableColumn<InstagramInfluencer>[] = [
    { id: 'username', header: 'username', cell: (i) => <span className="font-medium text-neutral-900">{i.username}</span> },
    { id: 'fullName', header: 'fullName', cell: (i) => i.fullName },
    { id: 'followerCount', header: 'followerCount', cell: (i) => <span className="tabular-nums">{i.followerCount.toLocaleString()}</span> },
    { id: 'followingCount', header: 'followingCount', cell: (i) => <span className="tabular-nums">{i.followingCount.toLocaleString()}</span> },
    { id: 'mediaCount', header: 'mediaCount', cell: (i) => <span className="tabular-nums">{i.mediaCount.toLocaleString()}</span> },
    { id: 'engagementRate', header: 'engagementRate', cell: (i) => <span className="tabular-nums">{i.engagementRate.toFixed(2)}</span> },
    { id: 'influencerTier', header: 'influencerTier', cell: (i) => i.influencerTier },
    { id: 'influencerScore', header: 'influencerScore', cell: (i) => <span className="tabular-nums">{i.influencerScore.toFixed(1)}</span> },
    { id: 'isVerified', header: 'isVerified', cell: (i) => (i.isVerified ? 'True' : 'False') },
    { id: 'category', header: 'category', cell: (i) => i.category },
    { id: 'age', header: 'age', cell: (i) => (i.age === null ? '—' : <span className="tabular-nums">{i.age}</span>) },
    { id: 'ethnicity', header: 'ethnicity', cell: (i) => i.ethnicity },
    { id: 'gender', header: 'gender', cell: (i) => i.gender },
    { id: 'city', header: 'city', cell: (i) => i.city },
    { id: 'state', header: 'state', cell: (i) => i.state },
    { id: 'country', header: 'country', cell: (i) => i.country },
    {
      id: 'biography',
      header: 'biography',
      cell: (i) => <span className="text-neutral-600">{i.biography}</span>,
    },
    {
      id: 'externalUrl',
      header: 'externalUrl',
      cell: (i) =>
        i.externalUrl ? (
          <a
            href={i.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            Open
          </a>
        ) : (
          '—'
        ),
    },
    { id: 'keywords', header: 'keywords', cell: (i) => <span className="text-neutral-600">{i.keywords}</span> },
    { id: 'analysis', header: 'analysis', cell: (i) => <span className="text-neutral-600">{i.analysis}</span> },
  ]

  return (
    <div>
      <PageToolbar
        title="Influencer Finder"
        subtitle="Find influencers by country/category and follower range."
        showSearch={false}
        searchValue=""
        onSearchChange={() => {}}
        actions={
          <DownloadIconButton
            aria-label="Download influencers CSV"
            onClick={() => {
              const rowsToExport = appliedQuery ? influencerResults : influencers
              downloadCsv({
                filename: `influencer-finder-${new Date().toISOString().slice(0, 10)}.csv`,
                headers: [
                  'username',
                  'fullName',
                  'followerCount',
                  'followingCount',
                  'mediaCount',
                  'engagementRate',
                  'influencerTier',
                  'influencerScore',
                  'isVerified',
                  'category',
                  'age',
                  'ethnicity',
                  'gender',
                  'city',
                  'state',
                  'country',
                  'biography',
                  'externalUrl',
                  'keywords',
                  'analysis',
                ],
                rows: rowsToExport,
              })
            }}
          />
        }
      />

      <section className="mb-8 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SearchableField
              label="Country"
              value={country}
              onChange={setCountry}
              placeholder="Type to search…"
              listId="digital360-country-list"
              options={countries}
            />
            <SearchableField
              label="Category"
              value={category}
              onChange={setCategory}
              placeholder="Type to search…"
              listId="digital360-category-list"
              options={categories}
            />
            <InlineField label="Min influencer" value={minFollowers} onChange={setMinFollowers} placeholder="e.g. 100000" />
            <InlineField label="Max influencer" value={maxFollowers} onChange={setMaxFollowers} placeholder="e.g. 1000000" />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                const min = parseOptionalNumber(minFollowers)
                const max = parseOptionalNumber(maxFollowers)
                setLedgerPage(1)
                setAppliedQuery({
                  country,
                  category,
                  minFollowers: min,
                  maxFollowers: max,
                })
              }}
              className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95 active:opacity-90"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setCountry('')
                setCategory('')
                setMinFollowers('')
                setMaxFollowers('')
                setLedgerPage(1)
                setAppliedQuery(null)
              }}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              Reset
            </button>
          </div>
        </div>

        {appliedQuery ? (
          <div className="mt-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-neutral-500">
                Outreach ledger{' '}
                <span className="ml-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-neutral-700">
                  {influencerResults.length}
                </span>
              </p>
              {influencerResults.length > 0 ? (
                <p className="text-xs text-neutral-500">
                  Showing{' '}
                  <span className="font-semibold tabular-nums text-neutral-700">
                    {ledgerRangeStart}–{ledgerRangeEnd}
                  </span>{' '}
                  of <span className="tabular-nums text-neutral-700">{influencerResults.length}</span>
                </p>
              ) : null}
            </div>
            <Table columns={influencerColumns} rows={ledgerPageRows} emptyMessage="No influencers match this search." />
            {influencerResults.length > LEDGER_PAGE_SIZE ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4">
                <p className="text-xs text-neutral-500">
                  Page <span className="font-semibold tabular-nums text-neutral-800">{safeLedgerPage}</span> of{' '}
                  <span className="tabular-nums text-neutral-800">{ledgerTotalPages}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={safeLedgerPage <= 1}
                    onClick={() => setLedgerPage(safeLedgerPage - 1)}
                    className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={safeLedgerPage >= ledgerTotalPages}
                    onClick={() => setLedgerPage(safeLedgerPage + 1)}
                    className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-xs text-neutral-500">Pick a country/category and optional follower range, then click Search.</p>
        )}
      </section>
    </div>
  )
}

function parseOptionalNumber(raw: string): number | undefined {
  const v = raw.trim()
  if (!v) return undefined
  const n = Number(v.replaceAll(',', ''))
  if (!Number.isFinite(n) || n < 0) return undefined
  return n
}

function parseNumber(raw: string | undefined): number {
  const v = (raw ?? '').trim()
  if (!v) return 0
  const n = Number(v.replaceAll(',', ''))
  return Number.isFinite(n) ? n : 0
}

function parseNullableNumber(raw: string | undefined): number | null {
  const v = (raw ?? '').trim()
  if (!v) return null
  const n = Number(v.replaceAll(',', ''))
  return Number.isFinite(n) ? n : null
}

function parseBoolean(raw: string | undefined): boolean {
  const v = (raw ?? '').trim().toLowerCase()
  return v === 'true' || v === '1' || v === 'yes'
}

function parseCsv(text: string): Array<Record<string, string>> {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  const pushField = () => {
    row.push(field)
    field = ''
  }
  const pushRow = () => {
    // skip completely empty trailing line
    if (row.length === 1 && row[0] === '') {
      row = []
      return
    }
    rows.push(row)
    row = []
  }

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (ch === '"') {
      const next = text[i + 1]
      if (inQuotes && next === '"') {
        field += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (ch === ',' && !inQuotes) {
      pushField()
      continue
    }

    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && text[i + 1] === '\n') i++
      pushField()
      pushRow()
      continue
    }

    field += ch
  }

  pushField()
  if (row.length) pushRow()

  if (rows.length === 0) return []
  const header = rows[0].map((h) => h.trim())
  const out: Array<Record<string, string>> = []

  for (let r = 1; r < rows.length; r++) {
    const rec: Record<string, string> = {}
    const values = rows[r]
    for (let c = 0; c < header.length; c++) {
      rec[header[c]] = (values[c] ?? '').trim()
    }
    out.push(rec)
  }

  return out
}

function SearchableField({
  label,
  value,
  onChange,
  placeholder,
  listId,
  options,
  className = '',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  listId: string
  options: string[]
  className?: string
}) {
  return (
    <label className={`block text-xs font-medium text-neutral-600 ${className}`}>
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        list={listId}
        className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none focus:ring-2 focus:ring-neutral-900/5"
      />
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </label>
  )
}

function InlineField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  className = '',
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <label className={`block text-xs font-medium text-neutral-600 ${className}`}>
      {label}
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none disabled:bg-neutral-50 disabled:text-neutral-500 focus:ring-2 focus:ring-neutral-900/5"
      />
    </label>
  )
}
