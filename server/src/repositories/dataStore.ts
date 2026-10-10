import { readJsonFile, writeJsonFile } from '../utils/helpers.js'
import type { Book, Article, Category, Order, Review, SiteSettings } from '../types.js'

export interface DataStore {
  books(): Book[]
  articles(): Article[]
  categories(): Category[]
  orders(): Order[]
  reviews(): Review[]
  settings(): SiteSettings
  saveBooks(books: Book[]): Promise<void>
  saveArticles(articles: Article[]): Promise<void>
  saveOrders(orders: Order[]): Promise<void>
  saveReviews(reviews: Review[]): Promise<void>
  saveSettings(settings: SiteSettings): Promise<void>
}

const FILES = {
  books: 'books.json',
  articles: 'articles.json',
  categories: 'categories.json',
  orders: 'orders.json',
  reviews: 'reviews.json',
  settings: 'settings.json',
} as const

export function createJsonDataStore(): DataStore {
  return {
    books: () => readJsonFile<Book[]>(FILES.books),
    articles: () => readJsonFile<Article[]>(FILES.articles),
    categories: () => readJsonFile<Category[]>(FILES.categories),
    orders: () => readJsonFile<Order[]>(FILES.orders),
    reviews: () => readJsonFile<Review[]>(FILES.reviews),
    settings: () => readJsonFile<SiteSettings>(FILES.settings),
    saveBooks: (books) => writeJsonFile(FILES.books, books),
    saveArticles: (articles) => writeJsonFile(FILES.articles, articles),
    saveOrders: (orders) => writeJsonFile(FILES.orders, orders),
    saveReviews: (reviews) => writeJsonFile(FILES.reviews, reviews),
    saveSettings: (settings) => writeJsonFile(FILES.settings, settings),
  }
}
