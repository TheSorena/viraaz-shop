import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Newspaper, SlidersHorizontal } from 'lucide-react'
import { articleService } from '../services/articleService'
import { categoryService } from '../services'
import type { Article, Category } from '../types'
import { ArticleCard } from '../components/common/ArticleCard'
import { ArticleCardSkeleton } from '../components/common/Skeleton'
import { EmptyState } from '../components/common/States'
import { Pagination } from '../components/common/Pagination'
import { Breadcrumb } from '../components/common/Breadcrumb'
import { useDebouncedValue } from '../hooks/useLocalStorage'
import { toPersianDigits } from '../utils/format'

const SORT_OPTIONS = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'oldest', label: 'قدیمی‌ترین' },
  { value: 'popular', label: 'پرطرفدار' },
] as const

export function MagazinePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const q = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const sort = searchParams.get('sort') ?? 'newest'
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
    articleService
      .list({
        q: debouncedQ || undefined,
        category: category || undefined,
        sort: sort as any,
        page,
        limit: 9,
      })
      .then((res) => {
        if (cancelled) return
        setArticles(res.data)
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
  }, [debouncedQ, category, sort, page])

  const updateParams = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams)
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === '') next.delete(k)
      else next.set(k, v)
    }
    if (patch.page === undefined) next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const activeCategory = categories.find((c) => c.slug === category)

  return (
    <div className="container-x py-8">
      <Breadcrumb items={[{ label: 'خانه', href: '/' }, { label: 'مجله' }]} />

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-extrabold text-ink-900 dark:text-white">
          {activeCategory ? `دسته‌بندی: ${activeCategory.name}` : 'مجله ویراژ'}
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          تاریخ، علم، فلسفه و دانستنی‌های جذاب — همه‌ی مقالات محتوای آزمایشی هستند.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}>
          <div className="card space-y-6 p-5">
            <div>
              <h3 className="mb-3 text-sm font-bold text-ink-900 dark:text-white">جست‌وجو</h3>
              <div className="relative">
                <input
                  value={localQ}
                  onChange={(e) => setLocalQ(e.target.value)}
                  placeholder="عنوان، نویسنده…"
                  className="input !py-2 !pe-9 !text-sm"
                  aria-label="جست‌وجو در مقالات"
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
            {(category || q) && (
              <button
                type="button"
                onClick={() => updateParams({ category: undefined, q: undefined })}
                className="btn-ghost w-full !justify-start !text-xs"
              >
                پاک کردن فیلترها
              </button>
            )}
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              className="btn-outline lg:hidden"
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              فیلترها
            </button>
            <span className="text-sm text-ink-500 dark:text-ink-400">
              {loading ? 'در حال بارگذاری…' : `${toPersianDigits(pagination.total)} مقاله`}
            </span>
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="input !w-auto !py-2 !text-sm"
              aria-label="مرتب‌سازی"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {error ? (
            <EmptyState icon={Newspaper} title="خطا در بارگذاری" description={error} />
          ) : loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
            </div>
          ) : articles.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title="مقاله‌ای یافت نشد"
              description="با تغییر کلمات جست‌وجو یا حذف فیلترها، نتایج بیشتری را ببینید."
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
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
