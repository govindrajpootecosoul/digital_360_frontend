import { getAccessToken } from './authStorage'
import { parseApiErrorResponse } from './apiErrors'
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

function networkError(err: unknown, method: string, path: string): Error {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg === 'Failed to fetch' || err instanceof TypeError) {
    return new Error(
      `Could not reach the API (${method} ${path}). Check API_PROXY_TARGET and that the backend is running; after .env changes restart Vite.`,
    )
  }
  return err instanceof Error ? err : new Error(msg)
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${apiBase()}${path}`
  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers: mergeHeaders(body !== undefined ? { 'content-type': 'application/json' } : undefined),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    throw networkError(e, method, path)
  }

  if (!res.ok) {
    throw await parseApiErrorResponse(res)
  }

  if (res.status === 204) return undefined as T
  return parseJson<T>(res)
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = `${apiBase()}${path}`
  return dedupeGet<T>(url, () => request<T>('GET', path))
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>('POST', path, body)
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return request<T>('PATCH', path, body)
}

export async function apiDelete(path: string): Promise<void> {
  await request<void>('DELETE', path)
}

export { ApiError, getErrorMessage } from './apiErrors'
