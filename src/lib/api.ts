/**
 * Base URL for `fetch` — set `VITE_API_URL` in `.env` (see `.env.example`).
 * - Dev: `/api` + `API_PROXY_TARGET` in `.env` uses the Vite proxy (no hardcoded host in code).
 * - Or set full URL, e.g. `http://127.0.0.1:4100/api` (whatever URL the backend prints).
 * - Value must end with `/api` (no trailing slash after `api`).
 */
const envBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim()?.replace(/\/$/, '')

function apiBase(): string {
  if (envBase) return envBase
  if (import.meta.env.DEV) return '/api'
  throw new Error(
    'VITE_API_URL is not set for this production build. In Vercel: Project → Settings → Environment Variables → add VITE_API_URL (full URL ending in /api, e.g. https://api.example.com/api), then redeploy.',
  )
}

/** Resolved API origin; in dev without .env this is `/api` (Vite proxy). */
export const API_BASE = envBase || (import.meta.env.DEV ? '/api' : '')

async function readErrorBody(res: Response): Promise<string> {
  const t = await res.text().catch(() => '')
  return t.length > 200 ? `${t.slice(0, 200)}…` : t
}

function networkError(err: unknown, method: string, path: string): Error {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg === 'Failed to fetch' || err instanceof TypeError) {
    return new Error(
      `Could not reach the API (${method} ${path}). Check VITE_API_URL and that the backend is running; after .env changes restart Vite.`,
    )
  }
  return err instanceof Error ? err : new Error(msg)
}

export async function apiGet<T>(path: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${apiBase()}${path}`, { method: 'GET' })
  } catch (e) {
    throw networkError(e, 'GET', path)
  }
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return (await res.json()) as T
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${apiBase()}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (e) {
    throw networkError(e, 'POST', path)
  }
  if (!res.ok) {
    const detail = await readErrorBody(res)
    throw new Error(detail ? `POST ${path} failed (${res.status}): ${detail}` : `POST ${path} failed: ${res.status}`)
  }
  return (await res.json()) as T
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${apiBase()}${path}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (e) {
    throw networkError(e, 'PATCH', path)
  }
  if (!res.ok) {
    const detail = await readErrorBody(res)
    throw new Error(detail ? `PATCH ${path} failed (${res.status}): ${detail}` : `PATCH ${path} failed: ${res.status}`)
  }
  return (await res.json()) as T
}

export async function apiDelete(path: string): Promise<void> {
  let res: Response
  try {
    res = await fetch(`${apiBase()}${path}`, { method: 'DELETE' })
  } catch (e) {
    throw networkError(e, 'DELETE', path)
  }
  if (!res.ok) {
    const detail = await readErrorBody(res)
    throw new Error(detail ? `DELETE ${path} failed (${res.status}): ${detail}` : `DELETE ${path} failed: ${res.status}`)
  }
}

