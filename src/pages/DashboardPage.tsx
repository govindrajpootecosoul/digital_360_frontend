import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useEffect, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Card, CardHeader } from '../components/ui/Card'
import type { ActivityItem, DashboardData } from '../types/data'
import { apiGet } from '../lib/api'
import { getErrorMessage } from '../lib/apiErrors'

const activityTone = (t: ActivityItem['type']) => {
  switch (t) {
    case 'deal':
      return 'success' as const
    case 'reply':
      return 'info' as const
    case 'content':
      return 'accent' as const
    case 'outreach':
      return 'warning' as const
    default:
      return 'neutral' as const
  }
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const d = await apiGet<DashboardData>('/dashboard')
        if (!cancelled) setData(d)
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, 'Could not load dashboard.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div>
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">Loading…</p>
        </header>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div>
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Dashboard</h1>
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error ?? 'Could not load dashboard.'}
          </p>
        </header>
      </div>
    )
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Team-wide pipeline health, growth, and latest activity across all accounts.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((k) => (
          <Card key={k.id} padding="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{k.label}</p>
            <div className="mt-3 flex items-end justify-between gap-2">
              <p className="text-3xl font-semibold tracking-tight text-neutral-900">{k.value}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  k.positive ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/70' : 'bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200/70'
                }`}
              >
                {k.delta}
              </span>
            </div>
          </Card>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3" padding="p-5">
          <CardHeader title="Influencer growth" subtitle="Rolling six-month pipeline" />
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.growth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.18 264)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="oklch(0.55 0.18 264)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#737373', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#737373', fontSize: 12 }} width={36} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e5e5e5',
                    boxShadow: '0 8px 24px -4px rgba(15,23,42,0.12)',
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="oklch(0.45 0.18 264)" fill="url(#gFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2" padding="p-5">
          <CardHeader title="Engagement overview" subtitle="Share of attention by platform" />
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.engagement} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={48}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#525252', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(250,250,250,0.6)' }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e5e5e5',
                    boxShadow: '0 8px 24px -4px rgba(15,23,42,0.12)',
                  }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="#171717" barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section className="mt-8">
        <Card padding="p-5">
          <CardHeader title="Recent activity" subtitle="Latest updates from all team accounts" />
          <ul className="divide-y divide-neutral-100">
            {data.activity.map((a) => (
              <li key={a.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <Badge tone={activityTone(a.type)} className="mt-0.5 shrink-0 capitalize">
                  {a.type}
                </Badge>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900">{a.title}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{a.meta}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  )
}
