import { Link } from 'react-router-dom'
import type { Category } from '../../types'
import { categoryIcon } from './CategoryGrid'

export function CategoryCircles({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null
  return (
    <section aria-label="دسته‌بندی‌ها">
      <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto py-2 sm:grid sm:grid-cols-8 sm:overflow-visible">
        {categories.map((c) => {
          const Icon = categoryIcon(c.icon)
          return (
            <Link
              key={c.id}
              to={`/books?category=${c.slug}`}
              className="group flex w-20 shrink-0 snap-start flex-col items-center gap-2 sm:w-auto"
            >
              <span
                className="flex h-16 w-16 items-center justify-center rounded-full shadow-soft ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-105 dark:ring-white/10 sm:h-20 sm:w-20"
                style={{ backgroundColor: `${c.color}16`, color: c.color }}
              >
                <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
              </span>
              <span className="text-center text-[11px] font-bold leading-5 text-ink-700 dark:text-ink-200 sm:text-xs">
                {c.name}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
