import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { computeTotals } from '../dist/services/orderService.js'
import { normalizePersian, toPersianDigits, formatPrice, slugify } from '../dist/utils/helpers.js'
import { SearchService } from '../dist/services/searchService.js'
import { createJsonDataStore } from '../dist/repositories/dataStore.js'
import { BookRepository, ArticleRepository } from '../dist/repositories/index.js'

const settings = {
  siteName: 'ویراژ',
  siteNameEn: 'Viraaz',
  tagline: '',
  description: '',
  baseUrl: '',
  currency: 'تومان',
  currencyCode: 'IRR',
  freeShippingThreshold: 500000,
  shippingFee: 45000,
  taxRate: 0,
  social: {},
  contact: { email: '', phone: '', address: '' },
  demoNotice: '',
}

describe('computeTotals', () => {
  it('calculates subtotal and applies free shipping above threshold', () => {
    const items = [
      { bookId: 'bk-001', title: 'A', unitPrice: 300000, quantity: 2, lineTotal: 600000 },
    ]
    const totals = computeTotals(items, settings)
    assert.equal(totals.subtotal, 600000)
    assert.equal(totals.shipping, 0) // above 500k threshold
    assert.equal(totals.total, 600000)
  })

  it('adds shipping fee below threshold', () => {
    const items = [
      { bookId: 'bk-002', title: 'B', unitPrice: 100000, quantity: 1, lineTotal: 100000 },
    ]
    const totals = computeTotals(items, settings)
    assert.equal(totals.subtotal, 100000)
    assert.equal(totals.shipping, 45000)
    assert.equal(totals.total, 145000)
  })

  it('handles empty cart', () => {
    const totals = computeTotals([], settings)
    assert.equal(totals.subtotal, 0)
    assert.equal(totals.shipping, 0)
    assert.equal(totals.total, 0)
  })

  it('sums multiple line items correctly', () => {
    const items = [
      { bookId: 'bk-001', title: 'A', unitPrice: 148000, quantity: 2, lineTotal: 296000 },
      { bookId: 'bk-002', title: 'B', unitPrice: 210000, quantity: 1, lineTotal: 210000 },
    ]
    const totals = computeTotals(items, settings)
    assert.equal(totals.subtotal, 506000)
    assert.equal(totals.shipping, 0) // 506k >= 500k
    assert.equal(totals.total, 506000)
  })
})

describe('helpers', () => {
  it('normalizes Persian characters (ي->ی, ك->ک)', () => {
    assert.equal(normalizePersian('کتاب يک كهنه'), 'کتاب یک کهنه')
  })

  it('converts digits to Persian', () => {
    assert.equal(toPersianDigits('12345'), '۱۲۳۴۵')
    assert.equal(toPersianDigits(42), '۴۲')
  })

  it('formats price with thousand separators', () => {
    assert.equal(formatPrice(1250000), '۱,۲۵۰,۰۰۰')
  })

  it('slugifies Persian text', () => {
    const slug = slugify('شاهنامه: داستان پادشاهی')
    assert.ok(slug.length > 0)
    assert.ok(!slug.includes(' '))
  })
})

describe('SearchService', () => {
  const store = createJsonDataStore()
  const search = new SearchService(new BookRepository(store), new ArticleRepository(store))

  it('finds books and articles for a Persian query', () => {
    const result = search.search('فلسفه')
    assert.ok(result.totalBooks >= 1, 'should find at least one book')
    assert.ok(result.totalArticles >= 1, 'should find at least one article')
  })

  it('normalizes ی/ي and ک/ك in queries', () => {
    const withArabic = search.search('كهنه')
    const withPersian = search.search('کهنه')
    assert.equal(withArabic.totalBooks, withPersian.totalBooks)
  })

  it('returns empty results and suggestions for empty query', () => {
    const result = search.search('')
    assert.equal(result.totalBooks, 0)
    assert.equal(result.totalArticles, 0)
    assert.ok(result.suggestions.length > 0)
  })

  it('filters by type', () => {
    const booksOnly = search.search('تاریخ', 'book')
    assert.equal(booksOnly.articles.length, 0)
    assert.ok(booksOnly.totalBooks >= 1)

    const articlesOnly = search.search('تاریخ', 'article')
    assert.equal(articlesOnly.books.length, 0)
    assert.ok(articlesOnly.totalArticles >= 1)
  })
})
