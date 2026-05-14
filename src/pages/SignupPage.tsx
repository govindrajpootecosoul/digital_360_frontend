import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function SignupPage() {
  const { user, loading, signup } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-neutral-50">
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setPending(true)
    try {
      await signup(email, password, displayName || undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-[400px] rounded-2xl border border-neutral-200/80 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Create account</h1>
          <p className="mt-1 text-sm text-neutral-500">Sign up for Digital 360</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <div>
            <label htmlFor="signup-name" className="mb-1 block text-xs font-medium text-neutral-600">
              Name <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2.5 text-sm outline-none ring-[var(--color-accent)]/30 transition focus:border-[var(--color-accent)] focus:bg-white focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="signup-email" className="mb-1 block text-xs font-medium text-neutral-600">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2.5 text-sm outline-none ring-[var(--color-accent)]/30 transition focus:border-[var(--color-accent)] focus:bg-white focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="mb-1 block text-xs font-medium text-neutral-600">
              Password <span className="text-neutral-400">(min 8 characters)</span>
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2.5 text-sm outline-none ring-[var(--color-accent)]/30 transition focus:border-[var(--color-accent)] focus:bg-white focus:ring-2"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-[var(--color-accent)] py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
          >
            {pending ? 'Creating account…' : 'Sign up'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[var(--color-accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
