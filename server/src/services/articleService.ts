import type { ArticleRepository, CategoryRepository, BookRepository } from '../repositories/index.js'
import type { Book, Article, ArticleContentBlock, Paginated } from '../types.js'
import { AppError } from '../utils/errors.js'
import { normalizePersian, slugify, generateId } from '../utils/helpers.js'

export interface ArticleQuery {
  q?: string
  category?: string
  sort?: 'newest' | 'oldest' | 'popular'
  page?: number
  limit?: number
  featured?: boolean
}

function matchesQuery(article: Article, q: string): boolean {
  const haystack = normalizePersian(
    [article.title, article.summary, article.author, ...article.tags].join(' ')
  ).toLowerCase()
  const needle = normalizePersian(q).toLowerCase()
  if (!needle) return true
  return needle.split(' ').every((term) => haystack.includes(term))
}

export class ArticleService {
  constructor(
    private readonly articles: ArticleRepository,
    private readonly categories: CategoryRepository,
    private readonly books: BookRepository
  ) {}

  list(query: ArticleQuery): Paginated<Article> {
    let items = this.articles.findAll().filter((a) => a.status === 'published')

    if (query.q && query.q.trim()) {
      items = items.filter((a) => matchesQuery(a, query.q!.trim()))
    }
    if (query.category) {
      const cat = this.categories.findBySlug(query.category) ?? this.categories.findById(query.category)
      if (!cat) throw AppError.badRequest('دسته‌بندی نامعتبر است', 'INVALID_CATEGORY')
      items = items.filter((a) => a.categoryId === cat.id)
    }
    if (query.featured) items = items.filter((a) => a.featured)

    switch (query.sort) {
      case 'oldest':
        items = [...items].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))
        break
      case 'popular':
        items = [...items].sort((a, b) => b.readMinutes - a.readMinutes)
        break
      case 'newest':
      default:
        items = [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
        break
    }

    const page = Math.max(1, query.page ?? 1)
    const limit = Math.min(100, Math.max(1, query.limit ?? 9))
    const total = items.length
    const totalPages = Math.ceil(total / limit)
    const start = (page - 1) * limit

    return {
      data: items.slice(start, start + limit),
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    }
  }

  getBySlug(slug: string): Article {
    const article = this.articles.findBySlug(slug)
    if (!article || article.status !== 'published') {
      throw AppError.notFound('مقاله یافت نشد', 'ARTICLE_NOT_FOUND')
    }
    return article
  }

  getById(id: string): Article {
    const article = this.articles.findById(id)
    if (!article) throw AppError.notFound('مقاله یافت نشد', 'ARTICLE_NOT_FOUND')
    return article
  }

  related(article: Article, limit = 4): Article[] {
    const all = this.articles.findAll().filter(
      (a) => a.id !== article.id && a.status === 'published'
    )
    const sameCategory = all.filter((a) => a.categoryId === article.categoryId)
    const rest = all.filter((a) => a.categoryId !== article.categoryId)
    return [...sameCategory, ...rest].slice(0, limit)
  }

  relatedBooks(article: Article): Book[] {
    return article.relatedBookIds
      .map((id) => this.books.findById(id))
      .filter((b): b is Book => Boolean(b))
  }

  async create(input: Omit<Article, 'id' | 'slug'> & { slug?: string }): Promise<Article> {
    const existing = this.articles.findAll()
    const slug = input.slug?.trim() || slugify(input.title)
    if (!slug) throw AppError.badRequest('عنوان مقاله برای ساخت slug کافی نیست', 'INVALID_SLUG')
    if (existing.some((a) => a.slug === slug)) {
      throw AppError.conflict('slug تکراری است', 'DUPLICATE_SLUG')
    }
    const article: Article = {
      ...input,
      id: generateId('art'),
      slug,
      tags: input.tags ?? [],
      relatedBookIds: input.relatedBookIds ?? [],
      content: input.content ?? [],
    }
    this.validateArticle(article)
    await this.articles.save(article)
    return article
  }

  async update(id: string, input: Partial<Article>): Promise<Article> {
    const article = this.articles.findById(id)
    if (!article) throw AppError.notFound('مقاله یافت نشد', 'ARTICLE_NOT_FOUND')
    const merged: Article = { ...article, ...input, id: article.id }
    if (input.slug && input.slug !== article.slug) {
      if (this.articles.findBySlug(input.slug)) {
        throw AppError.conflict('slug تکراری است', 'DUPLICATE_SLUG')
      }
    }
    this.validateArticle(merged)
    await this.articles.save(merged)
    return merged
  }

  async remove(id: string): Promise<void> {
    const ok = await this.articles.remove(id)
    if (!ok) throw AppError.notFound('مقاله یافت نشد', 'ARTICLE_NOT_FOUND')
  }

  private validateArticle(article: Article) {
    if (!article.title?.trim()) throw AppError.badRequest('عنوان مقاله الزامی است', 'VALIDATION')
    if (!article.summary?.trim()) throw AppError.badRequest('خلاصه‌ی مقاله الزامی است', 'VALIDATION')
    if (!article.author?.trim()) throw AppError.badRequest('نام نویسنده الزامی است', 'VALIDATION')
    if (!Number.isFinite(article.readMinutes) || article.readMinutes < 1) {
      throw AppError.badRequest('زمان مطالعه باید حداقل ۱ دقیقه باشد', 'VALIDATION')
    }
    if (!Array.isArray(article.content)) {
      throw AppError.badRequest('محتوای مقاله باید آرایه باشد', 'VALIDATION')
    }
    for (const block of article.content as ArticleContentBlock[]) {
      if (!block || typeof block.type !== 'string') {
        throw AppError.badRequest('ساختار محتوای مقاله نامعتبر است', 'VALIDATION')
      }
    }
  }
}
