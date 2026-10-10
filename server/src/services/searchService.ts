import type { BookRepository, ArticleRepository } from '../repositories/index.js'
import { normalizePersian } from '../utils/helpers.js'
import type { Book, Article } from '../types.js'

export interface SearchResult {
  books: Book[]
  articles: Article[]
  totalBooks: number
  totalArticles: number
  query: string
  suggestions: string[]
}

export class SearchService {
  constructor(
    private readonly books: BookRepository,
    private readonly articles: ArticleRepository
  ) {}

  search(rawQuery: string, type?: 'book' | 'article'): SearchResult {
    const query = normalizePersian(rawQuery).trim()
    const suggestions: string[] = []

    if (!query) {
      return {
        books: [],
        articles: [],
        totalBooks: 0,
        totalArticles: 0,
        query: '',
        suggestions: ['تاریخ ایران', 'فلسفه', 'فضا', 'علم', 'تمدن باستان'],
      }
    }

    const terms = query.toLowerCase().split(' ').filter(Boolean)
    const match = (text: string) => {
      const haystack = normalizePersian(text).toLowerCase()
      return terms.every((t) => haystack.includes(t))
    }

    const allBooks = this.books.findAll()
    const allArticles = this.articles.findAll().filter((a) => a.status === 'published')

    const matchedBooks = allBooks.filter((b) =>
      match([b.title, b.author, b.publisher, b.translator ?? '', ...b.tags].join(' '))
    )
    const matchedArticles = allArticles.filter((a) =>
      match([a.title, a.summary, a.author, ...a.tags].join(' '))
    )

    // Suggestions from popular tags when results are thin
    if (matchedBooks.length + matchedArticles.length < 3) {
      const tagCounts = new Map<string, number>()
      for (const b of allBooks) for (const t of b.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
      for (const a of allArticles) for (const t of a.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
      const sorted = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t)
      suggestions.push(...sorted.slice(0, 5))
    }

    return {
      books: type === 'article' ? [] : matchedBooks,
      articles: type === 'book' ? [] : matchedArticles,
      totalBooks: matchedBooks.length,
      totalArticles: matchedArticles.length,
      query,
      suggestions,
    }
  }
}
