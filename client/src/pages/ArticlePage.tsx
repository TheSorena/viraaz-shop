import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Clock, Calendar, User, Share2, Link2, Bookmark, Tag, ArrowLeft, BookOpen,
} from 'lucide-react'
import { articleService } from '../services/articleService'
import type { Article, ArticleContentBlock, Book } from '../types'
import { ArticleCard } from '../components/common/ArticleCard'
import { BookCard } from '../components/common/BookCard'
import { ErrorState } from '../components/common/States'
import { Breadcrumb } from '../components/common/Breadcrumb'
import { useReadingProgress } from '../hooks/useReadingProgress'
import { useBookmarks } from '../context/BookmarksContext'
import { useToast } from '../context/ToastContext'
import { toPersianDate, toPersianDigits } from '../utils/format'

function ContentBlock({ block }: { block: ArticleContentBlock }) {
  switch (block.type) {
    case 'intro':
      return <p className="mb-6 text-lg font-medium leading-9 text-ink-800 dark:text-ink-100">{block.text}</p>
    case 'h2':
      return <h2 className="mt-10 mb-4 text-2xl font-bold text-ink-900 dark:text-white">{block.text}</h2>
    case 'h3':
      return <h3 className="mt-8 mb-3 text-xl font-bold text-ink-800 dark:text-ink-100">{block.text}</h3>
    case 'p':
      return <p className="mb-5 leading-8 text-ink-700 dark:text-ink-300">{block.text}</p>
    case 'quote':
      return (
        <blockquote className="my-6 border-r-4 border-brand-500 bg-brand-50 dark:bg-brand-950 px-6 py-4 text-ink-700 dark:text-ink-300 italic">
          {block.text}
        </blockquote>
      )
    case 'ul':
      return (
        <ul className="my-5 list-disc space-y-2 pr-6 text-ink-700 dark:text-ink-300">
          {block.items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      )
    case 'ol':
      return (
        <ol className="my-5 list-decimal space-y-2 pr-6 text-ink-700 dark:text-ink-300">
          {block.items.map((item, i) => <li key={i}>{item}</li>)}
        </ol>
      )
    case 'image':
      return (
        <figure className="my-6">
          <img src={block.src} alt={block.alt} className="w-full rounded-2xl object-cover" loading="lazy" />
          <figcaption className="mt-2 text-center text-xs text-ink-400">{block.alt}</figcaption>
        </figure>
      )
    case 'link':
      return (
        <p className="my-4">
          <a href={block.href} target="_blank" rel="noreferrer" className="text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-4">
            {block.text}
          </a>
        </p>
      )
    default:
      return null
  }
}

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const progress = useReadingProgress()
  const { isBookmarked, toggle } = useBookmarks()
  const toast = useToast()

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    setError('')
    articleService
      .getBySlug(slug)
      .then((res) => {
        if (cancelled) return
        setArticle(res.data)
        setRelatedBooks(res.relatedBooks)
        return articleService.related(slug)
      })
      .then((rel) => {
        if (!cancelled) setRelatedArticles(rel)
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
  }, [slug])

  const headings = useMemo(() => {
    if (!article) return []
    return article.content
      .filter((b): b is Extract<ArticleContentBlock, { type: 'h2' }> => b.type === 'h2')
      .map((b, i) => ({ id: `section-${i}`, text: b.text }))
  }, [article])

  // Track heading index as we render content blocks
  let headingIndex = -1

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast.success('لینک مقاله کپی شد')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('کپی لینک امکان‌پذیر نبود')
    }
  }

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: article?.title, url: window.location.href })
        return
      } catch {
        // user cancelled
      }
    }
    copyLink()
  }

  if (loading) {
    return (
      <div className="container-x py-8">
        <div className="skeleton mx-auto mb-6 h-4 w-64 rounded-xl" />
        <div className="skeleton mx-auto mb-4 h-10 w-3/4 rounded-xl" />
        <div className="skeleton mx-auto mb-8 h-4 w-1/2 rounded-xl" />
        <div className="skeleton mb-8 aspect-[16/9] w-full rounded-2xl" />
        <div className="mx-auto max-w-3xl space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-4 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="container-x py-8">
        <ErrorState
          title="مقاله یافت نشد"
          description={error || 'ممکن است این مقاله حذف شده باشد.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  const bookmarked = isBookmarked(article.id)

  return (
    <div>
      {/* Reading progress bar */}
      <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-ink-100 dark:bg-ink-800">
        <div
          className="reading-progress h-full transition-[width] duration-150"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <article className="container-x py-8">
        <Breadcrumb
          items={[
            { label: 'خانه', href: '/' },
            { label: 'مجله', href: '/magazine' },
            { label: article.title },
          ]}
        />

        <header className="mx-auto mt-6 max-w-3xl text-center">
          <span className="chip mb-3 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">محتوای آزمایشی</span>
          <h1 className="text-2xl font-black leading-snug text-ink-900 dark:text-white sm:text-4xl sm:leading-snug">
            {article.title}
          </h1>
          <p className="mt-4 text-base leading-8 text-ink-500 dark:text-ink-400">{article.summary}</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm text-ink-400">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {toPersianDate(article.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {toPersianDigits(article.readMinutes)} دقیقه مطالعه
            </span>
          </div>
          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={share}
              className="btn-outline !rounded-lg !px-3 !py-1.5 !text-xs"
            >
              <Share2 className="h-3.5 w-3.5" />
              اشتراک‌گذاری
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="btn-outline !rounded-lg !px-3 !py-1.5 !text-xs"
            >
              <Link2 className="h-3.5 w-3.5" />
              {copied ? 'کپی شد' : 'کپی لینک'}
            </button>
            <button
              type="button"
              onClick={() => {
                toggle(article.id)
                toast.info(bookmarked ? 'از نشانک‌ها حذف شد' : 'به نشانک‌ها اضافه شد')
              }}
              className={`btn-outline !rounded-lg !px-3 !py-1.5 !text-xs ${bookmarked ? '!border-brand-400 !text-brand-700 dark:text-brand-300' : ''}`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${bookmarked ? 'fill-brand-600 text-brand-600 dark:text-brand-400' : ''}`} />
              {bookmarked ? 'نشانک‌گذاری شده' : 'نشانک'}
            </button>
          </div>
        </header>

        <div className="mx-auto mt-8 max-w-3xl">
          <img
            src={`/images/${article.cover}`}
            alt={article.title}
            className="w-full rounded-3xl object-cover shadow-soft"
            loading="lazy"
          />
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-10 lg:grid-cols-[220px_1fr]">
          {/* Table of contents */}
          {headings.length > 0 && (
            <aside className="hidden lg:block">
              <nav className="card sticky top-24 p-4" aria-label="فهرست مطالب">
                <h2 className="mb-3 text-sm font-bold text-ink-900 dark:text-white">فهرست مطالب</h2>
                <ul className="space-y-2">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        className="text-sm leading-6 text-ink-500 dark:text-ink-400 transition-colors hover:text-brand-700 dark:hover:text-brand-300"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}

          {/* Content */}
          <div className="prose-fa max-w-none">
            {article.content.map((block, i) => {
              if (block.type === 'h2') headingIndex += 1
              return (
                <div key={i} id={block.type === 'h2' ? `section-${headingIndex}` : undefined}>
                  <ContentBlock block={block} />
                </div>
              )
            })}

            <div className="mt-8 flex flex-wrap gap-2 border-t border-ink-100 dark:border-ink-800 pt-6">
              {article.tags.map((t) => (
                <span key={t} className="chip bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300">
                  <Tag className="h-3 w-3" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Related books */}
        {relatedBooks.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-extrabold text-ink-900 dark:text-white">
              <BookOpen className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              کتاب‌های مرتبط با این موضوع
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {relatedBooks.map((b) => <BookCard key={b.id} book={b} />)}
            </div>
          </section>
        )}

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 text-xl font-extrabold text-ink-900 dark:text-white">مقالات مرتبط</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((a) => <ArticleCard key={a.id} article={a} />)}
            </div>
          </section>
        )}

        <div className="mt-10 text-center">
          <Link to="/magazine" className="btn-outline">
            <ArrowLeft className="h-4 w-4" />
            بازگشت به مجله
          </Link>
        </div>
      </article>
    </div>
  )
}
