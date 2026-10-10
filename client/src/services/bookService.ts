import type { Book, Paginated } from '../types'
import { api } from './api'

export interface BookQuery {
  q?: string
  category?: string
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'rating'
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
  featured?: boolean
  isNew?: boolean
}

function toQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const str = search.toString()
  return str ? `?${str}` : ''
}

export const bookService = {
  list(query: BookQuery): Promise<Paginated<Book>> {
    return api.get<Paginated<Book>>(`/api/v1/books${toQueryString(query as Record<string, unknown>)}`)
  },
  getBySlug(slug: string): Promise<Book> {
    return api.get<Book>(`/api/v1/books/${slug}`)
  },
  related(slug: string): Promise<Book[]> {
    return api.get<Book[]>(`/api/v1/books/${slug}/related`)
  },
  sameAuthor(slug: string): Promise<Book[]> {
    return api.get<Book[]>(`/api/v1/books/${slug}/same-author`)
  },
  create(data: unknown): Promise<Book> {
    return api.post<Book>('/api/v1/admin/books', data)
  },
  update(id: string, data: unknown): Promise<Book> {
    return api.put<Book>(`/api/v1/admin/books/${id}`, data)
  },
  remove(id: string): Promise<void> {
    return api.delete<void>(`/api/v1/admin/books/${id}`)
  },
}
