import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, BookOpen, Newspaper, Compass } from 'lucide-react'
import { searchService } from '../services'
import type { Article, Book } from '../types'
import { BookCard } from '../components/common/BookCard'
import { ArticleCard } from '../components/common/ArticleCard'
import { BookCardSkeleton, ArticleCardSkeleton } from '../components/common/Skeleton'
import { EmptyState } from '../components/common/States'
import { Breadcrumb } from '../components/common/Breadcrumb'
import { useDebouncedValue } from '../hooks/useLocalStorage'
import { toPersianDigits } from '../utils/format'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [results, setResults] = useState<{
    books: Book[]
    articles: Article[]
    totalBooks: number
    totalArticles: number
    query: string
    suggestions: string[]
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const q = searchParams.get('q') ?? ''
  const type = (searchParams.get('type') ?? '') as '' | 'book' | 'article'
  const [localQ, setLocalQ] = useState(q)
  const debouncedQ = useDebouncedValue(localQ, 400)

  useEffect(() => {
    setLocalQ(q)
  }, [q])

  useEffect(() => {
    if (!debouncedQ.trim()) {
      setResults(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError('')
    searchService
      .search(debouncedQ.trim(), type || undefined)
      .then((res) => {
        if (!cancelled) setResults(res)
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
  }, [debouncedQ, type])

  const setType = (t: '' | 'book' | 'article') => {
    const next = new URLSearchParams(searchParams)
    if (t === '') next.delete('type')
    else next.set('type', t)
    setSearchParams(next, { replace: true })
  }

  const total = (results?.totalBooks ?? 0) + (results?.totalArticles ?? 0)

  return (
    <div className="container-x py-8">
      <Breadcrumb items={[{ label: 'خانه', href: '/' }, { label: 'جست‌وجو' }]} />

      <h1 className="mt-4 text-2xl font-extrabold text-ink-900 dark:text-white">جست‌وجوی سراسری</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const next = new URLSearchParams(searchParams)
          if (localQ.trim()) next.set('q', localQ.trim())
          else next.delete('q')
          setSearchParams(next)
        }}
        className="mt-5"
      >
        <div className="relative max-w-xl">
          <input
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder="عنوان کتاب، نویسنده، موضوع مقاله…"
            className="input !py-3 !pe-12 !text-base"
            aria-label="جست‌وجو"
          />
          <button
            type="submit"
            className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg bg-brand-600 p-2 text-white transition-colors hover:bg-brand-700"
            aria-label="اعمال جست‌وجو"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6">
          <EmptyState icon={Search} title="خطا در جست‌وجو" description={error} />
        </div>
      )}

      {!error && !q.trim() && (
        <div className="mt-8">
          <EmptyState
            icon={Compass}
            title="چه چیزی را جست‌وجو می‌کنید؟"
            description="در کتاب‌ها و مقالات ویراژ جست‌وجو کنید. جست‌وجو با نرمال‌سازی حروف فارسی (ی/ي، ک/ك) انجام می‌شود."
          />
          {results?.suggestions && results.suggestions.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {results.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setLocalQ(s)
                    const next = new URLSearchParams(searchParams)
                    next.set('q', s)
                    setSearchParams(next)
                  }}
                  className="chip border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 transition-colors hover:border-brand-300 hover:text-brand-700 dark:hover:text-brand-300"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!error && q.trim() && (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-500 dark:text-ink-400">
              {loading
                ? 'در حال جست‌وجو…'
                : `${toPersianDigits(total)} نتیجه برای «${q}»`}
            </p>
            <div className="flex gap-1 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-1">
              {[
                { value: '', label: 'همه' },
                { value: 'book', label: 'کتاب' },
                { value: 'article', label: 'مقاله' },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value as any)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    type === t.value ? 'bg-brand-600 text-white' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="mt-6 space-y-8">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => <BookCardSkeleton key={i} />)}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
              </div>
            </div>
          ) : total === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={Search}
                title="نتیجه‌ای یافت نشد"
                description={`برای «${q}» نتیجه‌ای پیدا نشد. پیشنهادهای زیر را امتحان کنید.`}
              />
              {results?.suggestions && results.suggestions.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {results.suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setLocalQ(s)
                        const next = new URLSearchParams(searchParams)
                        next.set('q', s)
                        setSearchParams(next)
                      }}
                      className="chip border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 transition-colors hover:border-brand-300 hover:text-brand-700 dark:hover:text-brand-300"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 space-y-10">
              {(type !== 'article') && results!.totalBooks > 0 && (
                <section>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink-900 dark:text-white">
                    <BookOpen className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    کتاب‌ها ({toPersianDigits(results!.totalBooks)})
                  </h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {results!.books.map((b) => <BookCard key={b.id} book={b} />)}
                  </div>
                </section>
              )}
              {(type !== 'book') && results!.totalArticles > 0 && (
                <section>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink-900 dark:text-white">
                    <Newspaper className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    مقالات ({toPersianDigits(results!.totalArticles)})
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {results!.articles.map((a) => <ArticleCard key={a.id} article={a} />)}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
