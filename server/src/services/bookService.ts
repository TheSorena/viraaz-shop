import type { BookRepository, CategoryRepository } from '../repositories/index.js'
import type { Book, Category, Paginated } from '../types.js'
import { AppError } from '../utils/errors.js'
import { normalizePersian, slugify, generateId } from '../utils/helpers.js'

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

function matchesQuery(book: Book, q: string): boolean {
  const haystack = normalizePersian(
    [book.title, book.author, book.publisher, book.translator ?? '', ...book.tags].join(' ')
  ).toLowerCase()
  const needle = normalizePersian(q).toLowerCase()
  if (!needle) return true
  return needle.split(' ').every((term) => haystack.includes(term))
}

export class BookService {
  constructor(
    private readonly books: BookRepository,
    private readonly categories: CategoryRepository
  ) {}

  list(query: BookQuery): Paginated<Book> {
    let items = this.books.findAll()

    if (query.q && query.q.trim()) {
      items = items.filter((b) => matchesQuery(b, query.q!.trim()))
    }
    if (query.category) {
      const cat = this.categories.findBySlug(query.category) ?? this.categories.findById(query.category)
      if (!cat) throw AppError.badRequest('دسته‌بندی نامعتبر است', 'INVALID_CATEGORY')
      items = items.filter((b) => b.categoryId === cat.id)
    }
    if (typeof query.minPrice === 'number' && Number.isFinite(query.minPrice)) {
      items = items.filter((b) => b.price >= query.minPrice!)
    }
    if (typeof query.maxPrice === 'number' && Number.isFinite(query.maxPrice)) {
      items = items.filter((b) => b.price <= query.maxPrice!)
    }
    if (query.featured) items = items.filter((b) => b.featured)
    if (query.isNew) items = items.filter((b) => b.isNew)

    switch (query.sort) {
      case 'price_asc':
        items = [...items].sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        items = [...items].sort((a, b) => b.price - a.price)
        break
      case 'popular':
        items = [...items].sort((a, b) => b.salesCount - a.salesCount)
        break
      case 'rating':
        items = [...items].sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
      default:
        items = [...items].sort((a, b) => b.year - a.year || b.id.localeCompare(a.id))
        break
    }

    const page = Math.max(1, query.page ?? 1)
    const limit = Math.min(100, Math.max(1, query.limit ?? 12))
    const total = items.length
    const totalPages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const data = items.slice(start, start + limit)

    return {
      data,
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    }
  }

  getBySlug(slug: string): Book {
    const book = this.books.findBySlug(slug)
    if (!book) throw AppError.notFound('کتاب یافت نشد', 'BOOK_NOT_FOUND')
    return book
  }

  getById(id: string): Book {
    const book = this.books.findById(id)
    if (!book) throw AppError.notFound('کتاب یافت نشد', 'BOOK_NOT_FOUND')
    return book
  }

  related(book: Book, limit = 6): Book[] {
    const all = this.books.findAll().filter((b) => b.id !== book.id)
    const sameCategory = all.filter((b) => b.categoryId === book.categoryId)
    const sameAuthor = all.filter((b) => b.author === book.author && b.categoryId !== book.categoryId)
    const rest = all.filter(
      (b) => b.categoryId !== book.categoryId && b.author !== book.author
    )
    return [...sameCategory, ...sameAuthor, ...rest].slice(0, limit)
  }

  sameAuthor(book: Book, limit = 4): Book[] {
    return this.books
      .findAll()
      .filter((b) => b.id !== book.id && b.author === book.author)
      .slice(0, limit)
  }

  async create(input: Omit<Book, 'id' | 'slug'> & { slug?: string }): Promise<Book> {
    const existing = this.books.findAll()
    const slug = input.slug?.trim() || slugify(input.title)
    if (!slug) throw AppError.badRequest('عنوان کتاب برای ساخت slug کافی نیست', 'INVALID_SLUG')
    if (existing.some((b) => b.slug === slug)) {
      throw AppError.conflict('slug تکراری است', 'DUPLICATE_SLUG')
    }
    const book: Book = {
      ...input,
      id: generateId('bk'),
      slug,
      discountPrice: input.discountPrice ?? null,
      tags: input.tags ?? [],
    }
    this.validateBook(book)
    await this.books.save(book)
    return book
  }

  async update(id: string, input: Partial<Book>): Promise<Book> {
    const book = this.books.findById(id)
    if (!book) throw AppError.notFound('کتاب یافت نشد', 'BOOK_NOT_FOUND')
    const merged: Book = { ...book, ...input, id: book.id }
    if (input.slug && input.slug !== book.slug) {
      if (this.books.findBySlug(input.slug)) {
        throw AppError.conflict('slug تکراری است', 'DUPLICATE_SLUG')
      }
    }
    this.validateBook(merged)
    await this.books.save(merged)
    return merged
  }

  async remove(id: string): Promise<void> {
    const ok = await this.books.remove(id)
    if (!ok) throw AppError.notFound('کتاب یافت نشد', 'BOOK_NOT_FOUND')
  }

  private validateBook(book: Book) {
    if (!book.title?.trim()) throw AppError.badRequest('عنوان کتاب الزامی است', 'VALIDATION')
    if (!book.author?.trim()) throw AppError.badRequest('نام نویسنده الزامی است', 'VALIDATION')
    if (!Number.isFinite(book.price) || book.price < 0) {
      throw AppError.badRequest('قیمت باید عددی غیرمنفی باشد', 'VALIDATION')
    }
    if (book.discountPrice != null) {
      if (!Number.isFinite(book.discountPrice) || book.discountPrice < 0) {
        throw AppError.badRequest('قیمت تخفیف‌خورده نامعتبر است', 'VALIDATION')
      }
      if (book.discountPrice > book.price) {
        throw AppError.badRequest('قیمت تخفیف‌خورده نمی‌تواند بیشتر از قیمت باشد', 'VALIDATION')
      }
    }
    if (!Number.isInteger(book.stock) || book.stock < 0) {
      throw AppError.badRequest('موجودی باید عدد صحیح غیرمنفی باشد', 'VALIDATION')
    }
  }
}
