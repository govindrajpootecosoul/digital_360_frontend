export type ApiErrorBody = {
  error?: string
  message?: string
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error && err.message.trim()) return err.message
  if (typeof err === 'string' && err.trim()) return err
  return fallback
}

export async function parseApiErrorResponse(res: Response): Promise<ApiError> {
  const text = await res.text().catch(() => '')
  let message = text.length > 200 ? `${text.slice(0, 200)}…` : text
  let code: string | undefined

  if (text) {
    try {
      const j = JSON.parse(text) as ApiErrorBody
      if (typeof j.message === 'string' && j.message.trim()) message = j.message.trim()
      if (typeof j.error === 'string' && j.error.trim()) code = j.error.trim()
    } catch {
      /* use raw text */
    }
  }

  if (!message.trim()) {
    message = `Request failed (${res.status})`
  }

  return new ApiError(res.status, message, code)
}
