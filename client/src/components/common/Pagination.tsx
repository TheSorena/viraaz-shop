import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toPersianDigits } from '../../utils/format'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: (number | 'ellipsis')[] = []
  const push = (p: number | 'ellipsis') => {
    if (pages[pages.length - 1] !== p) pages.push(p)
  }

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) push(i)
  } else {
    push(1)
    if (page > 3) push('ellipsis')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) push(i)
    if (page < totalPages - 2) push('ellipsis')
    push(totalPages)
  }

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="صفحه‌بندی">
      <button
        type="button"
        className="btn-ghost !rounded-lg !p-2"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="صفحه قبل"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      {pages.map((p, idx) =>
        p === 'ellipsis' ? (
          <span key={`e-${idx}`} className="px-1 text-ink-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`btn !rounded-lg !px-3 !py-1.5 !text-sm ${
              p === page
                ? 'bg-brand-600 text-white shadow-sm'
                : 'border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-700 dark:text-ink-300 hover:border-brand-300 hover:text-brand-700 dark:hover:text-brand-300'
            }`}
            aria-current={p === page ? 'page' : undefined}
          >
            {toPersianDigits(p)}
          </button>
        )
      )}
      <button
        type="button"
        className="btn-ghost !rounded-lg !p-2"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="صفحه بعد"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    </nav>
  )
}
