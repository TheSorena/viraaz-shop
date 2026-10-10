import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { bookService } from '../services/bookService'
import { categoryService } from '../services'
import type { Book, Category } from '../types'
import { BookCard } from '../components/common/BookCard'
import { BookCardSkeleton } from '../components/common/Skeleton'
import { EmptyState } from '../components/common/States'
import { Pagination } from '../components/common/Pagination'
import { Breadcrumb } from '../components/common/Breadcrumb'
import { useDebouncedValue } from '../hooks/useLocalStorage'
import { toPersianDigits } from '../utils/format'

const SORT_OPTIONS = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'popular', label: 'محبوبیت' },
  { value: 'price_asc', label: 'قیمت: کم به زیاد' },
  { value: 'price_desc', label: 'قیمت: زیاد به کم' },
  { value: 'rating', label: 'بیشترین امتیاز' },
] as const

export function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const q = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const sort = searchParams.get('sort') ?? 'newest'
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
  const page = Number(searchParams.get('page') ?? '1')

  const [localQ, setLocalQ] = useState(q)
  const debouncedQ = useDebouncedValue(localQ, 400)

  useEffect(() => {
    setLocalQ(q)
  }, [q])

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    bookService
      .list({
        q: debouncedQ || undefined,
        category: category || undefined,
        sort: sort as any,
        minPrice,
        maxPrice,
        page,
        limit: 12,
      })
      .then((res) => {
        if (cancelled) return
        setBooks(res.data)
        setPagination(res.pagination)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedQ, category, sort, minPrice, maxPrice, page])

  const updateParams = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams)
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === '') next.delete(k)
      else next.set(k, v)
    }
    if (patch.page === undefined) next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const activeCategory = useMemo(
    () => categories.find((c) => c.slug === category),
    [categories, category]
  )

  const priceBands = [
    { label: 'زیر ۱۵۰ هزار تومان', min: undefined, max: 150000 },
    { label: '۱۵۰ تا ۲۰۰ هزار تومان', min: 150000, max: 200000 },
    { label: 'بالای ۲۰۰ هزار تومان', min: 200000, max: undefined },
  ]

  return (
    <div className="container-x py-8">
      <Breadcrumb items={[{ label: 'خانه', href: '/' }, { label: 'فروشگاه' }]} />

      <div className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900 dark:text-white">
            {activeCategory ? `دسته‌بندی: ${activeCategory.name}` : 'فروشگاه کتاب'}
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            {loading ? 'در حال بارگذاری…' : `${toPersianDigits(pagination.total)} کتاب`}
          </p>
        </div>
        <button
          type="button"
          className="btn-outline lg:hidden"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          فیلترها
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Sidebar filters */}
        <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}>
          <div className="card space-y-6 p-5">
            <div>
              <h3 className="mb-3 text-sm font-bold text-ink-900 dark:text-white">جست‌وجو</h3>
              <div className="relative">
                <input
                  value={localQ}
                  onChange={(e) => setLocalQ(e.target.value)}
                  placeholder="عنوان، نویسنده، ناشر…"
                  className="input !py-2 !pe-9 !text-sm"
                  aria-label="جست‌وجو در کتاب‌ها"
                />
                <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold text-ink-900 dark:text-white">دسته‌بندی</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={() => updateParams({ category: undefined })}
                    className={`w-full rounded-lg px-3 py-2 text-right text-sm transition-colors ${
                      !category ? 'bg-brand-50 dark:bg-brand-950 font-semibold text-brand-700 dark:text-brand-300' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800'
                    }`}
                  >
                    همه
                  </button>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => updateParams({ category: c.slug })}
                      className={`w-full rounded-lg px-3 py-2 text-right text-sm transition-colors ${
                        category === c.slug
                          ? 'bg-brand-50 dark:bg-brand-950 font-semibold text-brand-700 dark:text-brand-300'
                          : 'text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800'
                      }`}
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold text-ink-900 dark:text-white">بازه قیمت</h3>
              <ul className="space-y-1">
                {priceBands.map((band) => {
                  const active = minPrice === band.min && maxPrice === band.max
                  return (
                    <li key={band.label}>
                      <button
                        type="button"
                        onClick={() =>
                          updateParams({
                            minPrice: band.min === undefined ? undefined : String(band.min),
                            maxPrice: band.max === undefined ? undefined : String(band.max),
                          })
                        }
                        className={`w-full rounded-lg px-3 py-2 text-right text-sm transition-colors ${
                          active ? 'bg-brand-50 dark:bg-brand-950 font-semibold text-brand-700 dark:text-brand-300' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800'
                        }`}
                      >
                        {band.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            {(category || minPrice !== undefined || maxPrice !== undefined || q) && (
              <button
                type="button"
                onClick={() =>
                  updateParams({ category: undefined, minPrice: undefined, maxPrice: undefined, q: undefined })
                }
                className="btn-ghost w-full !justify-start !text-xs"
              >
                <X className="h-3.5 w-3.5" />
                پاک کردن فیلترها
              </button>
            )}
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="relative flex-1 sm:hidden">
              <input
                value={localQ}
                onChange={(e) => setLocalQ(e.target.value)}
                placeholder="جست‌وجو…"
                className="input !py-2 !pe-9 !text-sm"
                aria-label="جست‌وجو"
              />
              <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            </div>
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="input !w-auto !py-2 !text-sm"
              aria-label="مرتب‌سازی"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {error ? (
            <EmptyState
              icon={Search}
              title="خطا در بارگذاری"
              description={error}
            />
          ) : loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <BookCardSkeleton key={i} />)}
            </div>
          ) : books.length === 0 ? (
            <EmptyState
              icon={Search}
              title="کتابی یافت نشد"
              description="با تغییر کلمات جست‌وجو یا حذف فیلترها، نتایج بیشتری را ببینید."
              action={
                <button
                  type="button"
                  className="btn-outline mt-2"
                  onClick={() =>
                    updateParams({ category: undefined, minPrice: undefined, maxPrice: undefined, q: undefined })
                  }
                >
                  پاک کردن فیلترها
                </button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {books.map((b) => <BookCard key={b.id} book={b} />)}
              </div>
              <div className="mt-8">
                <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={(p) => updateParams({ page: String(p) })} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
