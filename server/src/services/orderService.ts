import type {
  OrderRepository,
  BookRepository,
  SettingsRepository,
  ArticleRepository,
} from '../repositories/index.js'
import type { Order, OrderCustomer, OrderItem, OrderStatus, SiteSettings } from '../types.js'
import { AppError } from '../utils/errors.js'
import { generateId, generateOrderNumber } from '../utils/helpers.js'

export interface CheckoutInput {
  items: { bookId: string; quantity: number }[]
  customer: OrderCustomer
}

export interface OrderTotals {
  subtotal: number
  discount: number
  shipping: number
  total: number
}

export function computeTotals(items: OrderItem[], settings: SiteSettings): OrderTotals {
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0)
  const shipping =
    subtotal === 0 || subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee
  return { subtotal, discount: 0, shipping, total: subtotal + shipping }
}

export class OrderService {
  constructor(
    private readonly orders: OrderRepository,
    private readonly books: BookRepository,
    private readonly settings: SettingsRepository,
    private readonly articles: ArticleRepository
  ) {}

  list(query: { status?: OrderStatus; q?: string; page?: number; limit?: number }) {
    let items = this.orders.findAll()
    if (query.status) {
      items = items.filter((o) => o.status === query.status)
    }
    if (query.q && query.q.trim()) {
      const needle = query.q.trim().toLowerCase()
      items = items.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(needle) ||
          o.customer.fullName.toLowerCase().includes(needle)
      )
    }
    const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const page = Math.max(1, query.page ?? 1)
    const limit = Math.min(100, Math.max(1, query.limit ?? 10))
    const total = sorted.length
    const totalPages = Math.ceil(total / limit)
    return {
      data: sorted.slice((page - 1) * limit, page * limit),
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    }
  }

  getById(id: string): Order {
    const order = this.orders.findById(id)
    if (!order) throw AppError.notFound('سفارش یافت نشد', 'ORDER_NOT_FOUND')
    return order
  }

  getByNumber(orderNumber: string): Order {
    const order = this.orders.findByNumber(orderNumber)
    if (!order) throw AppError.notFound('سفارش یافت نشد', 'ORDER_NOT_FOUND')
    return order
  }

  async create(input: CheckoutInput): Promise<Order> {
    const settings = this.settings.find()

    if (!input.items || input.items.length === 0) {
      throw AppError.badRequest('سبد خرید خالی است', 'EMPTY_CART')
    }

    const customer = input.customer
    if (!customer.fullName?.trim()) throw AppError.badRequest('نام و نام خانوادگی الزامی است', 'VALIDATION')
    if (!customer.phone?.trim() || customer.phone.replace(/\D/g, '').length < 9) {
      throw AppError.badRequest('شماره موبایل نامعتبر است', 'VALIDATION')
    }
    if (!customer.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      throw AppError.badRequest('ایمیل نامعتبر است', 'VALIDATION')
    }
    if (!customer.address?.trim()) throw AppError.badRequest('نشانی الزامی است', 'VALIDATION')
    if (!customer.city?.trim()) throw AppError.badRequest('شهر الزامی است', 'VALIDATION')

    // Re-validate stock and price server-side — browser data is untrusted
    const orderItems: OrderItem[] = []
    for (const item of input.items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
        throw AppError.badRequest(`تعداد نامعتبر برای کتاب ${item.bookId}`, 'INVALID_QUANTITY')
      }
      const book = this.books.findById(item.bookId)
      if (!book) throw AppError.notFound(`کتاب با شناسه ${item.bookId} یافت نشد`, 'BOOK_NOT_FOUND')
      if (book.stock < item.quantity) {
        throw AppError.badRequest(
          `موجودی کتاب «${book.title}» کافی نیست (موجودی: ${book.stock})`,
          'INSUFFICIENT_STOCK',
          { bookId: book.id, stock: book.stock, requested: item.quantity }
        )
      }
      const unitPrice = book.discountPrice ?? book.price
      orderItems.push({
        bookId: book.id,
        title: book.title,
        unitPrice,
        quantity: item.quantity,
        lineTotal: unitPrice * item.quantity,
      })
    }

    const totals = computeTotals(orderItems, settings)
    const seq = this.orders.nextSequence()

    const order: Order = {
      id: generateId('ord'),
      orderNumber: generateOrderNumber(seq),
      customer,
      items: orderItems,
      ...totals,
      status: 'pending',
      createdAt: new Date().toISOString(),
      note: 'سفارش آزمایشی — هیچ پولی دریافت نمی‌شود',
    }

    // Decrement stock for ordered books
    for (const item of orderItems) {
      const book = this.books.findById(item.bookId)
      if (book) {
        await this.books.save({ ...book, stock: Math.max(0, book.stock - item.quantity) })
      }
    }

    await this.orders.save(order)
    return order
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const valid: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!valid.includes(status)) {
      throw AppError.badRequest('وضعیت سفارش نامعتبر است', 'INVALID_STATUS')
    }
    const order = await this.orders.updateStatus(id, status)
    if (!order) throw AppError.notFound('سفارش یافت نشد', 'ORDER_NOT_FOUND')
    return order
  }

  dashboardStats() {
    const orders = this.orders.findAll()
    const books = this.books.findAll()
    const articles = this.articles.findAll()
    const totalSales = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0)
    const statusCounts: Record<OrderStatus, number> = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    }
    for (const o of orders) statusCounts[o.status] += 1

    const days: { label: string; count: number; total: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const dayOrders = orders.filter((o) => o.createdAt.startsWith(key))
      days.push({
        label: key.slice(5),
        count: dayOrders.length,
        total: dayOrders.reduce((s, o) => s + o.total, 0),
      })
    }

    return {
      booksCount: books.length,
      articlesCount: articles.length,
      ordersCount: orders.length,
      totalSales,
      statusCounts,
      recentOrders: [...orders]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5),
      ordersByDay: days,
    }
  }
}
