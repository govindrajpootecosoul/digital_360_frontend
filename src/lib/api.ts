import { getAccessToken } from './authStorage'
import { dedupeGet } from './apiGetDedupe'

/**
 * API base for `fetch` — set at build/dev time from `API_PROXY_TARGET` in `.env` (see `.env.example`).
 * - Dev: `/api` (Vite proxies to `API_PROXY_TARGET`).
 * - Production: `${API_PROXY_TARGET}/api` (baked in when you run `vite build`).
 */

function apiBase(): string {
  return __API_BASE__
}

export const API_BASE = __API_BASE__

function authHeaders(): HeadersInit {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function mergeHeaders(extra?: HeadersInit): HeadersInit {
  return { ...authHeaders(), ...extra }
}

/** Prefer API `message` field when present (e.g. auth validation). */
async function errorDetail(res: Response): Promise<string> {
  const t = await res.text().catch(() => '')
  try {
    const j = JSON.parse(t) as { message?: string }
    if (typeof j.message === 'string' && j.message.trim()) return j.message.trim()
  } catch {
    /* ignore */
  }
  return t.length > 200 ? `${t.slice(0, 200)}…` : t
}

function networkError(err: unknown, method: string, path: string): Error {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg === 'Failed to fetch' || err instanceof TypeError) {
    return new Error(
      `Could not reach the API (${method} ${path}). Check API_PROXY_TARGET and that the backend is running; after .env changes restart Vite.`,
    )
  }
  return err instanceof Error ? err : new Error(msg)
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = `${apiBase()}${path}`
  return dedupeGet<T>(url, async () => {
    let res: Response
    try {
      res = await fetch(url, { method: 'GET', headers: mergeHeaders() })
    } catch (e) {
      throw networkError(e, 'GET', path)
    }
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
    return (await res.json()) as T
  })
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${apiBase()}${path}`, {
      method: 'POST',
      headers: mergeHeaders({ 'content-type': 'application/json' }),
      body: JSON.stringify(body),
    })
  } catch (e) {
    throw networkError(e, 'POST', path)
  }
  if (!res.ok) {
    const detail = await errorDetail(res)
    throw new Error(detail ? `POST ${path} failed (${res.status}): ${detail}` : `POST ${path} failed: ${res.status}`)
  }
  return (await res.json()) as T
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${apiBase()}${path}`, {
      method: 'PATCH',
      headers: mergeHeaders({ 'content-type': 'application/json' }),
      body: JSON.stringify(body),
    })
  } catch (e) {
    throw networkError(e, 'PATCH', path)
  }
  if (!res.ok) {
    const detail = await errorDetail(res)
    throw new Error(detail ? `PATCH ${path} failed (${res.status}): ${detail}` : `PATCH ${path} failed: ${res.status}`)
  }
  return (await res.json()) as T
}

export async function apiDelete(path: string): Promise<void> {
  let res: Response
  try {
    res = await fetch(`${apiBase()}${path}`, { method: 'DELETE', headers: mergeHeaders() })
  } catch (e) {
    throw networkError(e, 'DELETE', path)
  }
  if (!res.ok) {
    const detail = await errorDetail(res)
    throw new Error(detail ? `DELETE ${path} failed (${res.status}): ${detail}` : `DELETE ${path} failed: ${res.status}`)
  }
}
