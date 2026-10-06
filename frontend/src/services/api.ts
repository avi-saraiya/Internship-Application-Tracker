import type { Application, ApplicationInput, ApplicationSummary, Credentials, User } from '../types'

const API_BASE = '/api/v1'

export class ApiError extends Error {
  readonly status: number
  readonly detail: unknown

  constructor(status: number, detail: unknown) {
    super(ApiError.messageFrom(status, detail))
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }

  /** FastAPI returns either a string detail or a list of validation errors. */
  private static messageFrom(status: number, detail: unknown): string {
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail
        .map((err: { loc?: unknown[]; msg?: string }) => {
          const field = err.loc?.filter((part) => part !== 'body').join('.')
          return field ? `${field}: ${err.msg}` : err.msg
        })
        .join('; ')
    }
    return `Request failed (${status})`
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...init,
    headers: init.body ? { 'Content-Type': 'application/json', ...init.headers } : init.headers,
  })
  if (response.status === 204) return undefined as T

  const body = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, body?.detail)
  return body as T
}

const json = (method: string, data: unknown): RequestInit => ({
  method,
  body: JSON.stringify(data),
})

export const authApi = {
  me: () => request<User>('/auth/me'),
  login: (credentials: Credentials) => request<User>('/auth/login', json('POST', credentials)),
  register: (credentials: Credentials) =>
    request<User>('/auth/register', json('POST', credentials)),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
}

export const applicationsApi = {
  list: () => request<Application[]>('/applications'),
  get: (id: number) => request<Application>(`/applications/${id}`),
  summary: () => request<ApplicationSummary>('/applications/summary'),
  create: (data: ApplicationInput) => request<Application>('/applications', json('POST', data)),
  update: (id: number, data: Partial<ApplicationInput>) =>
    request<Application>(`/applications/${id}`, json('PATCH', data)),
  remove: (id: number) => request<void>(`/applications/${id}`, { method: 'DELETE' }),
}
