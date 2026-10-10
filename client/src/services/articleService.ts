import type { Article, Book, Paginated } from '../types'
import { api } from './api'

export interface ArticleQuery {
  q?: string
  category?: string
  sort?: 'newest' | 'oldest' | 'popular'
  page?: number
  limit?: number
  featured?: boolean
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

export const articleService = {
  list(query: ArticleQuery): Promise<Paginated<Article>> {
    return api.get<Paginated<Article>>(`/api/v1/articles${toQueryString(query as Record<string, unknown>)}`)
  },
  getBySlug(slug: string): Promise<{ data: Article; relatedBooks: Book[] }> {
    return api.get<{ data: Article; relatedBooks: Book[] }>(`/api/v1/articles/${slug}`)
  },
  related(slug: string): Promise<Article[]> {
    return api.get<Article[]>(`/api/v1/articles/${slug}/related`)
  },
  create(data: unknown): Promise<Article> {
    return api.post<Article>('/api/v1/admin/articles', data)
  },
  update(id: string, data: unknown): Promise<Article> {
    return api.put<Article>(`/api/v1/admin/articles/${id}`, data)
  },
  remove(id: string): Promise<void> {
    return api.delete<void>(`/api/v1/admin/articles/${id}`)
  },
}
