import type { Category, Order, OrderStatus, Review, SiteSettings } from '../types'
import { api } from './api'

export const categoryService = {
  list(): Promise<Category[]> {
    return api.get<Category[]>('/api/v1/categories')
  },
}

export const orderService = {
  create(items: { bookId: string; quantity: number }[], customer: Order['customer']): Promise<Order> {
    return api.post<Order>('/api/v1/orders', { items, customer })
  },
  getByNumber(orderNumber: string): Promise<Order> {
    return api.get<Order>(`/api/v1/orders/number/${orderNumber}`)
  },
  list(params: { status?: OrderStatus; q?: string; page?: number; limit?: number }): Promise<{ data: Order[]; pagination: unknown }> {
    const search = new URLSearchParams()
    if (params.status) search.set('status', params.status)
    if (params.q) search.set('q', params.q)
    if (params.page) search.set('page', String(params.page))
    if (params.limit) search.set('limit', String(params.limit))
    const qs = search.toString()
    return api.get<{ data: Order[]; pagination: unknown }>(`/api/v1/admin/orders${qs ? `?${qs}` : ''}`)
  },
  updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return api.patch<Order>(`/api/v1/admin/orders/${id}/status`, { status })
  },
}

export const reviewService = {
  listByBook(bookId: string): Promise<Review[]> {
    return api.get<Review[]>(`/api/v1/reviews/${bookId}`)
  },
  create(bookId: string, data: { author: string; rating: number; title: string; body: string }): Promise<Review> {
    return api.post<Review>(`/api/v1/reviews/${bookId}`, data)
  },
}

export const settingsService = {
  get(): Promise<SiteSettings> {
    return api.get<SiteSettings>('/api/v1/settings')
  },
}

export const searchService = {
  search(q: string, type?: 'book' | 'article'): Promise<{
    books: import('../types').Book[]
    articles: Article[]
    totalBooks: number
    totalArticles: number
    query: string
    suggestions: string[]
  }> {
    const search = new URLSearchParams()
    if (q) search.set('q', q)
    if (type) search.set('type', type)
    const qs = search.toString()
    return api.get(`/api/v1/search${qs ? `?${qs}` : ''}`)
  },
}
