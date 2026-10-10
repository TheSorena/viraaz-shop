import type { DataStore } from './dataStore.js'
import type { Book, Article, Category, Order, Review, SiteSettings } from '../types.js'

export class BookRepository {
  constructor(private readonly store: DataStore) {}

  findAll(): Book[] {
    return this.store.books()
  }

  findById(id: string): Book | undefined {
    return this.store.books().find((b) => b.id === id)
  }

  findBySlug(slug: string): Book | undefined {
    return this.store.books().find((b) => b.slug === slug)
  }

  async save(book: Book): Promise<void> {
    const books = this.store.books()
    const idx = books.findIndex((b) => b.id === book.id)
    if (idx >= 0) books[idx] = book
    else books.push(book)
    await this.store.saveBooks(books)
  }

  async remove(id: string): Promise<boolean> {
    const books = this.store.books()
    const next = books.filter((b) => b.id !== id)
    if (next.length === books.length) return false
    await this.store.saveBooks(next)
    return true
  }
}

export class ArticleRepository {
  constructor(private readonly store: DataStore) {}

  findAll(): Article[] {
    return this.store.articles()
  }

  findById(id: string): Article | undefined {
    return this.store.articles().find((a) => a.id === id)
  }

  findBySlug(slug: string): Article | undefined {
    return this.store.articles().find((a) => a.slug === slug)
  }

  async save(article: Article): Promise<void> {
    const articles = this.store.articles()
    const idx = articles.findIndex((a) => a.id === article.id)
    if (idx >= 0) articles[idx] = article
    else articles.push(article)
    await this.store.saveArticles(articles)
  }

  async remove(id: string): Promise<boolean> {
    const articles = this.store.articles()
    const next = articles.filter((a) => a.id !== id)
    if (next.length === articles.length) return false
    await this.store.saveArticles(next)
    return true
  }
}

export class CategoryRepository {
  constructor(private readonly store: DataStore) {}

  findAll(): Category[] {
    return this.store.categories()
  }

  findById(id: string): Category | undefined {
    return this.store.categories().find((c) => c.id === id)
  }

  findBySlug(slug: string): Category | undefined {
    return this.store.categories().find((c) => c.slug === slug)
  }
}

export class OrderRepository {
  constructor(private readonly store: DataStore) {}

  findAll(): Order[] {
    return this.store.orders()
  }

  findById(id: string): Order | undefined {
    return this.store.orders().find((o) => o.id === id)
  }

  findByNumber(orderNumber: string): Order | undefined {
    return this.store.orders().find((o) => o.orderNumber === orderNumber)
  }

  nextSequence(): number {
    const orders = this.store.orders()
    if (orders.length === 0) return 1
    const max = orders.reduce((acc, o) => {
      const num = parseInt(o.orderNumber.replace(/\D/g, ''), 10)
      return Number.isFinite(num) && num > acc ? num : acc
    }, 100000)
    return max - 100000 + 1
  }

  async save(order: Order): Promise<void> {
    const orders = this.store.orders()
    const idx = orders.findIndex((o) => o.id === order.id)
    if (idx >= 0) orders[idx] = order
    else orders.push(order)
    await this.store.saveOrders(orders)
  }

  async updateStatus(id: string, status: Order['status']): Promise<Order | null> {
    const orders = this.store.orders()
    const order = orders.find((o) => o.id === id)
    if (!order) return null
    order.status = status
    await this.store.saveOrders(orders)
    return order
  }
}

export class ReviewRepository {
  constructor(private readonly store: DataStore) {}

  findAll(): Review[] {
    return this.store.reviews()
  }

  findByBookId(bookId: string): Review[] {
    return this.store.reviews().filter((r) => r.bookId === bookId)
  }

  async save(review: Review): Promise<void> {
    const reviews = this.store.reviews()
    const idx = reviews.findIndex((r) => r.id === review.id)
    if (idx >= 0) reviews[idx] = review
    else reviews.push(review)
    await this.store.saveReviews(reviews)
  }
}

export class SettingsRepository {
  constructor(private readonly store: DataStore) {}

  find(): SiteSettings {
    return this.store.settings()
  }

  async save(settings: SiteSettings): Promise<void> {
    await this.store.saveSettings(settings)
  }
}
