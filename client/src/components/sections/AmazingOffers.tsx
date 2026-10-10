import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import type { Book } from '../../types'
import { formatPrice, toPersianDigits } from '../../utils/format'
import { useCountdown } from '../../hooks/useCountdown'

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="fa-num flex h-10 w-10 items-center justify-center rounded-lg bg-white text-base font-black text-red-600 shadow">
        {toPersianDigits(String(value).padStart(2, '0'))}
      </span>
      <span className="mt-1 text-[10px] text-white/80">{label}</span>
    </div>
  )
}

export function AmazingOffers({ books }: { books: Book[] }) {
  const { hours, minutes, seconds } = useCountdown()
  const scroller = useRef<HTMLDivElement>(null)
  const items = books.filter((b) => b.discountPrice != null && b.discountPrice < b.price).slice(0, 10)
  if (items.length === 0) return null

  const scrollBy = (dir: number) => {
    scroller.current?.scrollBy({ left: dir * -320, behavior: 'smooth' })
  }

  return (
    <section id="amazing" aria-label="پیشنهاد شگفت‌انگیز" className="overflow-hidden rounded-2xl bg-gradient-to-l from-red-700 via-red-600 to-red-500 p-4 sm:rounded-3xl sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Zap className="h-6 w-6 fill-amber-300 text-amber-300" />
          </span>
          <div>
            <h2 className="text-lg font-black text-white sm:text-2xl">پیشنهاد شگفت‌انگیز</h2>
            <div className="mt-1 flex items-center gap-1.5" dir="ltr" aria-label="زمان باقی‌مانده تا پایان امروز">
              <TimeBox value={hours} label="ساعت" />
              <span className="pb-5 font-black text-white">:</span>
              <TimeBox value={minutes} label="دقیقه" />
              <span className="pb-5 font-black text-white">:</span>
              <TimeBox value={seconds} label="ثانیه" />
            </div>
          </div>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button type="button" onClick={() => scrollBy(1)} className="rounded-full border border-white/30 bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/25" aria-label="قبلی">
            <ChevronRight className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => scrollBy(-1)} className="rounded-full border border-white/30 bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/25" aria-label="بعدی">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <Link to="/books" className="ms-1 rounded-xl bg-white px-4 py-2 text-xs font-bold text-red-600 transition-transform hover:scale-105">
            مشاهده همه
          </Link>
        </div>
      </div>

      <div ref={scroller} className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
        {items.map((b) => {
          const percent = Math.round(((b.price - (b.discountPrice ?? b.price)) / b.price) * 100)
          const sold = Math.min(96, Math.max(8, Math.round((b.salesCount / (b.salesCount + b.stock)) * 100)))
          return (
            <Link
              key={b.id}
              to={`/books/${b.slug}`}
              className="w-40 shrink-0 snap-start overflow-hidden rounded-2xl bg-white p-2.5 shadow-lg transition-transform hover:-translate-y-1 dark:bg-ink-900 sm:w-48"
            >
              <div className="relative overflow-hidden rounded-xl bg-ink-50 dark:bg-ink-800">
                <img src={`/images/${b.cover}`} alt={b.title} className="aspect-[3/4] w-full object-cover" loading="lazy" />
                <span className="fa-num absolute start-2 top-2 rounded-lg bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
                  {toPersianDigits(percent)}٪
                </span>
              </div>
              <p className="mt-2 line-clamp-1 text-xs font-bold text-ink-800 dark:text-ink-100">{b.title}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="fa-num text-sm font-black text-ink-900 dark:text-white">
                  {formatPrice(b.discountPrice ?? b.price)}
                </span>
                <span className="text-[10px] text-ink-400">تومان</span>
              </div>
              <div className="fa-num text-[11px] text-ink-300 line-through">{formatPrice(b.price)}</div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-700" role="progressbar" aria-valuenow={sold} aria-valuemin={0} aria-valuemax={100} aria-label="درصد فروش رفته">
                <div className="h-full rounded-full bg-red-500" style={{ width: `${sold}%` }} />
              </div>
              <p className="fa-num mt-1 text-[10px] text-red-500">{toPersianDigits(sold)}٪ فروش رفته</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
