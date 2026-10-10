import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Star, ShoppingCart, Minus, Plus, Trash2, BookOpen, User, Printer, Calendar,
  Layers, FileText, Hash, Tag, CheckCircle2,
} from 'lucide-react'
import { bookService } from '../services/bookService'
import { reviewService, categoryService } from '../services'
import type { Book, Category, Review } from '../types'
import { BookCard } from '../components/common/BookCard'
import { BookCardSkeleton } from '../components/common/Skeleton'
import { ErrorState } from '../components/common/States'
import { Breadcrumb } from '../components/common/Breadcrumb'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useBookmarks } from '../context/BookmarksContext'
import { Bookmark } from 'lucide-react'
import {
  discountPercent, effectivePrice, formatPrice, toPersianDigits, toPersianDate,
} from '../utils/format'

export function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [book, setBook] = useState<Book | null>(null)
  const [related, setRelated] = useState<Book[]>([])
  const [sameAuthor, setSameAuthor] = useState<Book[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const { addItem } = useCart()
  const toast = useToast()
  const { isBookmarked, toggle } = useBookmarks()

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    setError('')
    setQuantity(1)
    setAdded(false)
    bookService
      .getBySlug(slug)
      .then((b) => {
        if (cancelled) return
        setBook(b)
        return Promise.all([
          bookService.related(slug),
          bookService.sameAuthor(slug),
          reviewService.listByBook(b.id),
        ])
      })
      .then(([rel, author, revs]) => {
        if (cancelled) return
        setRelated(rel)
        setSameAuthor(author)
        setReviews(revs)
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

  if (loading) {
    return (
      <div className="container-x py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <BookCardSkeleton />
          <div className="space-y-3">
            <div className="skeleton h-8 w-3/4 rounded-xl" />
            <div className="skeleton h-4 w-1/2 rounded-xl" />
            <div className="skeleton h-24 w-full rounded-xl" />
            <div className="skeleton h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="container-x py-8">
        <ErrorState
          title="کتاب یافت نشد"
          description={error || 'ممکن است این کتاب حذف شده باشد.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  const percent = discountPercent(book.price, book.discountPrice)
  const price = effectivePrice(book.price, book.discountPrice)
  const category = categories.find((c) => c.id === book.categoryId)
  const bookmarked = isBookmarked(book.id)
  const outOfStock = book.stock <= 0

  const specs = [
    { icon: User, label: 'نویسنده', value: book.author },
    ...(book.translator ? [{ icon: User, label: 'مترجم', value: book.translator }] : []),
    { icon: Printer, label: 'ناشر', value: book.publisher },
    { icon: Calendar, label: 'سال انتشار', value: toPersianDigits(book.year) },
    { icon: FileText, label: 'تعداد صفحات', value: `${toPersianDigits(book.pages)} صفحه` },
    { icon: Layers, label: 'نوع جلد', value: book.binding },
    { icon: Hash, label: 'شابک', value: book.isbn, dir: 'ltr' as const },
    ...(category ? [{ icon: Tag, label: 'دسته‌بندی', value: category.name }] : []),
  ]

  return (
    <div className="container-x py-8">
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Book',
          name: book.title,
          author: { '@type': 'Person', name: book.author },
          publisher: { '@type': 'Organization', name: book.publisher },
          isbn: book.isbn,
          bookFormat: 'https://schema.org/Paperback',
          inLanguage: 'fa',
          numberOfPages: book.pages,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: book.rating,
            reviewCount: Math.max(1, Math.round(book.salesCount / 10)),
          },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'IRT',
            price: price,
            availability:
              book.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
        })}
      </script>
      <Breadcrumb
        items={[
          { label: 'خانه', href: '/' },
          { label: 'فروشگاه', href: '/books' },
          ...(category ? [{ label: category.name, href: `/books?category=${category.slug}` }] : []),
          { label: book.title },
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[400px_1fr]">
        {/* Cover */}
        <div>
          <div className="card overflow-hidden">
            <img
              src={`/images/${book.cover}`}
              alt={`جلد کتاب ${book.title}`}
              className="book-cover aspect-[5/7] w-full object-cover"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                toggle(book.id)
                toast.info(bookmarked ? 'از نشانک‌ها حذف شد' : 'به نشانک‌ها اضافه شد')
              }}
              className={`btn-outline flex-1 ${bookmarked ? '!border-brand-400 !text-brand-700 dark:text-brand-300' : ''}`}
            >
              <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-brand-600 text-brand-600 dark:text-brand-400' : ''}`} />
              {bookmarked ? 'نشانک‌گذاری شده' : 'نشانک‌گذاری'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {percent && <span className="chip bg-red-500 text-white">{toPersianDigits(percent)}٪ تخفیف</span>}
            {book.isNew && <span className="chip bg-brand-600 text-white">جدید</span>}
            {book.tags.map((t) => (
              <span key={t} className="chip bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300">{t}</span>
            ))}
          </div>

          <h1 className="mt-3 text-2xl font-black leading-snug text-ink-900 dark:text-white sm:text-3xl">
            {book.title}
          </h1>
          <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
            {book.author}
            {book.translator && ` • ترجمه‌ی ${book.translator}`} • {book.publisher}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-0.5" aria-label={`امتیاز ${book.rating} از ۵`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(book.rating) ? 'fill-amber-400 text-amber-400' : 'text-ink-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-ink-500 dark:text-ink-400">
              {toPersianDigits(book.rating.toFixed(1))} ({toPersianDigits(book.salesCount)} فروش)
            </span>
          </div>

          <p className="mt-5 leading-8 text-ink-700 dark:text-ink-300">{book.fullDescription}</p>

          {/* Price box */}
          <div className="card mt-6 p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                {percent ? (
                  <>
                    <div className="text-sm text-ink-400 line-through">{formatPrice(book.price)} تومان</div>
                    <div className="text-3xl font-black text-brand-700 dark:text-brand-300">{formatPrice(price)}</div>
                  </>
                ) : (
                  <div className="text-3xl font-black text-ink-900 dark:text-white">{formatPrice(price)}</div>
                )}
                <div className="text-xs text-ink-400">تومان</div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-xl border border-ink-200 dark:border-ink-700">
                  <button
                    type="button"
                    className="p-2.5 text-ink-500 dark:text-ink-400 hover:text-ink-900 disabled:opacity-40"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || outOfStock}
                    aria-label="کاهش تعداد"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="fa-num min-w-10 text-center text-sm font-bold">{toPersianDigits(quantity)}</span>
                  <button
                    type="button"
                    className="p-2.5 text-ink-500 dark:text-ink-400 hover:text-ink-900 disabled:opacity-40"
                    onClick={() => setQuantity((q) => Math.min(book.stock, q + 1))}
                    disabled={quantity >= book.stock || outOfStock}
                    aria-label="افزایش تعداد"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  disabled={outOfStock || added}
                  onClick={() => {
                    addItem(book, quantity)
                    setAdded(true)
                    toast.success(`«${book.title}» به سبد اضافه شد`)
                    setTimeout(() => setAdded(false), 2000)
                  }}
                  className="btn-primary"
                >
                  {added ? <CheckCircle2 className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                  {outOfStock ? 'ناموجود' : added ? 'اضافه شد' : 'افزودن به سبد'}
                </button>
              </div>
            </div>
            <div className="mt-3 text-xs text-ink-400">
              موجودی: <span className={book.stock > 0 ? 'text-emerald-600' : 'text-red-500'}>{toPersianDigits(book.stock)} عدد</span>
              {book.stock > 0 && book.stock < 10 && ' (موجودی کم)'}
            </div>
          </div>

          {/* Specs */}
          <div className="card mt-6 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-ink-900 dark:text-white">
              <BookOpen className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              مشخصات کتاب
            </h2>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {specs.map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-3 border-b border-dashed border-ink-100 dark:border-ink-800 pb-2">
                  <dt className="flex items-center gap-1.5 text-xs text-ink-400">
                    <s.icon className="h-3.5 w-3.5" />
                    {s.label}
                  </dt>
                  <dd className={`text-sm font-medium text-ink-800 dark:text-ink-100 ${'dir' in s && s.dir === 'ltr' ? 'text-left' : 'text-right'}`} dir={'dir' in s ? s.dir : undefined}>
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-12">
        <h2 className="mb-5 text-xl font-extrabold text-ink-900 dark:text-white">دیدگاه خوانندگان</h2>
        <p className="mb-4 rounded-xl bg-amber-50 dark:bg-amber-950 px-4 py-2.5 text-xs leading-5 text-amber-800 dark:text-amber-200">
          دیدگاه‌های نمایشی هستند و صرفاً بخشی از طراحی نمونه‌کار محسوب می‌شوند.
        </p>
        {reviews.length === 0 ? (
          <p className="text-sm text-ink-400">هنوز دیدگاهی ثبت نشده است.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <article key={r.id} className="card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950 text-sm font-bold text-brand-700 dark:text-brand-300">
                      {r.author.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-ink-900 dark:text-white">{r.author}</div>
                      <div className="text-xs text-ink-400">{toPersianDate(r.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-ink-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="mt-3 text-sm font-bold text-ink-800 dark:text-ink-100">{r.title}</h3>
                <p className="mt-1 text-sm leading-7 text-ink-600 dark:text-ink-300">{r.body}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Same author */}
      {sameAuthor.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 text-xl font-extrabold text-ink-900 dark:text-white">
            آثار دیگر {book.author}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {sameAuthor.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </section>
      )}

      {/* Related */}
      <section className="mt-12">
        <h2 className="mb-5 text-xl font-extrabold text-ink-900 dark:text-white">کتاب‌های مشابه</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {related.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      </section>

      <div className="mt-10 text-center">
        <Link to="/books" className="btn-outline">
          <Trash2 className="hidden" />
          بازگشت به فروشگاه
        </Link>
      </div>
    </div>
  )
}
