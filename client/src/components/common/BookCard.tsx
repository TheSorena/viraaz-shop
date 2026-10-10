import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import type { Book } from '../../types'
import { formatPrice, toPersianDigits } from '../../utils/format'
import { useCart } from '../../context/CartContext'
import { useBookmarks } from '../../context/BookmarksContext'
import { useToast } from '../../context/ToastContext'

export function BookCard({ book }: { book: Book }) {
  const { add } = useCart()
  const { toggle, has } = useBookmarks()
  const toast = useToast()
  const bookmarked = has(book.id)
  const discounted = book.discountPrice != null && book.discountPrice < book.price
  const price = book.discountPrice ?? book.price
  const discountPercent = discounted
    ? Math.round(((book.price - book.discountPrice!) / book.price) * 100)
    : 0

  return (
    <div className="card group relative flex flex-col overflow-hidden p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      {/* badges */}
      <div className="absolute start-3 top-3 z-10 flex flex-col gap-1.5">
        {discounted && (
          <span className="fa-num rounded-lg bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white shadow">
            {toPersianDigits(discountPercent)}٪ تخفیف
          </span>
        )}
        {book.isNew && (
          <span className="rounded-lg bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white shadow">
            جدید
          </span>
        )}
      </div>

      {/* bookmark */}
      <button
        type="button"
        onClick={() => {
          toggle(book.id)
          toast.success(bookmarked ? 'از علاقه‌مندی‌ها حذف شد' : 'به علاقه‌مندی‌ها اضافه شد')
        }}
        className={`absolute end-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur transition-all ${
          bookmarked
            ? 'bg-red-500 text-white shadow'
            : 'bg-white/80 dark:bg-ink-800/80 text-ink-400 hover:bg-white dark:hover:bg-ink-700 hover:text-red-500'
        }`}
        aria-label={bookmarked ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
      >
        <Heart className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
      </button>

      {/* cover */}
      <Link to={`/books/${book.slug}`} className="relative block overflow-hidden rounded-xl bg-ink-50 dark:bg-ink-800">
        <img
          src={`/images/${book.cover}`}
          alt={book.title}
          className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </Link>

      {/* info */}
      <div className="flex flex-1 flex-col px-1 pt-3">
        <Link to={`/books/${book.slug}`} className="line-clamp-2 text-sm font-bold leading-6 text-ink-900 dark:text-white transition-colors hover:text-brand-700 dark:hover:text-brand-300">
          {book.title}
        </Link>
        <p className="mt-1 truncate text-xs text-ink-500 dark:text-ink-400">{book.author}</p>

        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 text-amber-400">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="fa-num text-xs font-bold text-ink-700 dark:text-ink-300">{toPersianDigits(book.rating.toFixed(1))}</span>
          </div>
          <span className="text-[10px] text-ink-400">({toPersianDigits(book.salesCount)} فروش)</span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            {discounted && (
              <span className="fa-num text-[11px] text-ink-400 line-through">{formatPrice(book.price)}</span>
            )}
            <div className="fa-num text-base font-extrabold text-brand-700 dark:text-brand-300">
              {formatPrice(price)}
              <span className="ms-1 text-[10px] font-normal text-ink-400">تومان</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              add(book, 1)
              toast.success('به سبد خرید اضافه شد')
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white transition-all hover:bg-brand-700 hover:shadow-lg active:scale-95"
            aria-label={`افزودن ${book.title} به سبد خرید`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
