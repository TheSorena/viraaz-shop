import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dices, RefreshCw, Sparkles } from 'lucide-react'
import type { Book, Article } from '../../types'
import { bookService } from '../../services/bookService'
import { articleService } from '../../services/articleService'
import { formatPrice } from '../../utils/format'

export function TodayPick() {
  const [pick, setPick] = useState<{ type: 'book' | 'article'; book?: Book; article?: Article } | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [books, articles] = await Promise.all([
        bookService.list({ limit: 50 }),
        articleService.list({ limit: 50 }),
      ])
      const pool: Array<{ type: 'book' | 'article'; book?: Book; article?: Article }> = [
        ...books.data.map((b) => ({ type: 'book' as const, book: b })),
        ...articles.data.map((a) => ({ type: 'article' as const, article: a })),
      ]
      const random = pool[Math.floor(Math.random() * pool.length)]
      setPick(random)
    } catch {
      setPick(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <section>
        <div className="card h-40 animate-pulse" />
      </section>
    )
  }

  if (!pick) return null

  const isBook = pick.type === 'book'
  const title = isBook ? pick.book?.title : pick.article?.title
  const desc = isBook ? pick.book?.shortDescription : pick.article?.summary
  const href = isBook ? `/books/${pick.book!.slug}` : `/magazine/${pick.article!.slug}`
  const price = isBook ? (pick.book?.discountPrice ?? pick.book?.price) : undefined

  return (
    <section className="card relative overflow-hidden border-0 bg-gradient-to-l from-ink-900 via-brand-900 to-brand-800 p-0 text-white">
      <div className="absolute -end-10 -top-10 h-48 w-48 rounded-full bg-white/10" aria-hidden="true" />
      <div className="absolute -bottom-16 -start-8 h-40 w-40 rounded-full bg-accent-400/20" aria-hidden="true" />
      <div className="relative flex flex-col gap-6 p-7 sm:p-10 lg:flex-row lg:items-center">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <Dices className="h-8 w-8 text-accent-300" />
        </div>
        <div className="flex-1">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-accent-300" />
            {isBook ? 'کتاب پیشنهادی امروز' : 'مقاله پیشنهادی امروز'}
          </span>
          <h3 className="text-2xl font-black leading-snug sm:text-3xl">{title}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 sm:text-base sm:leading-8">{desc}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link to={href} className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-800 transition-transform hover:scale-105">
              {isBook ? 'مشاهده و خرید کتاب' : 'مطالعه مقاله'}
            </Link>
            {price !== undefined && (
              <div className="text-sm">
                {pick.book?.discountPrice && (
                  <span className="text-white/50 line-through">{formatPrice(pick.book.price)}</span>
                )}
                <span className="ms-2 text-xl font-black text-accent-300">{formatPrice(price)}</span>
                <span className="ms-1 text-xs text-white/70">تومان</span>
              </div>
            )}
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4" />
              پیشنهاد دیگر
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
