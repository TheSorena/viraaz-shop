import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Book } from '../../types'
import { BookCard } from '../common/BookCard'

export function ProductCarousel({
  title,
  subtitle,
  href,
  books,
}: {
  title: string
  subtitle?: string
  href: string
  books: Book[]
}) {
  const scroller = useRef<HTMLDivElement>(null)
  if (books.length === 0) return null

  const scrollBy = (dir: number) => {
    scroller.current?.scrollBy({ left: dir * -480, behavior: 'smooth' })
  }

  return (
    <section aria-label={title}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-ink-900 dark:text-white sm:text-xl">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-ink-500 dark:text-ink-400 sm:text-sm">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden gap-1.5 sm:flex">
            <button type="button" onClick={() => scrollBy(1)} className="btn-outline !rounded-lg !p-2" aria-label="قبلی">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => scrollBy(-1)} className="btn-outline !rounded-lg !p-2" aria-label="بعدی">
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
          <Link to={href} className="flex items-center gap-1 text-xs font-bold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 sm:text-sm">
            مشاهده همه
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div ref={scroller} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {books.map((b) => (
          <div key={b.id} className="w-40 shrink-0 snap-start sm:w-52">
            <BookCard book={b} />
          </div>
        ))}
      </div>
    </section>
  )
}
