import type { ApiResponse } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  public readonly status: number
  public readonly code: string
  public readonly details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`
  const isAdmin = path.startsWith('/api/v1/admin')
  const token = isAdmin ? sessionStorage.getItem('viraaz-admin-token') : null
  let res: Response
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    })
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'خطا در برقراری ارتباط با سرور')
  }

  let body: ApiResponse<T>
  try {
    body = await res.json()
  } catch {
    throw new ApiError(res.status, 'INVALID_RESPONSE', 'پاسخ نامعتبر از سرور')
  }

  if (!res.ok || body.ok === false) {
    throw new ApiError(
      res.status,
      body.error?.code ?? 'ERROR',
      body.error?.message ?? 'خطای ناشناخته',
      body.error?.details
    )
  }

  return body.data as T
}

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>(path)
  },
  post<T>(path: string, data: unknown): Promise<T> {
    return request<T>(path, { method: 'POST', body: JSON.stringify(data) })
  },
  put<T>(path: string, data: unknown): Promise<T> {
    return request<T>(path, { method: 'PUT', body: JSON.stringify(data) })
  },
  patch<T>(path: string, data: unknown): Promise<T> {
    return request<T>(path, { method: 'PATCH', body: JSON.stringify(data) })
  },
  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' })
  },
}
