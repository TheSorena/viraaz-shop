import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-ink-500 dark:text-ink-400" aria-label="مسیر ناوبری">
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1">
          {idx > 0 && <ChevronLeft className="h-3.5 w-3.5 text-ink-300" />}
          {item.href ? (
            <Link to={item.href} className="transition-colors hover:text-brand-700 dark:hover:text-brand-300">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-ink-800 dark:text-ink-100" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
