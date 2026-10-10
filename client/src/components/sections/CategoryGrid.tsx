import { Link } from 'react-router-dom'
import { Landmark, Globe, Columns, FlaskConical, Telescope, Brain, Users, Sparkles, ArrowLeft, type LucideIcon } from 'lucide-react'
import type { Category } from '../../types'

const iconMap: Record<string, LucideIcon> = {
  landmark: Landmark,
  globe: Globe,
  columns: Columns,
  flask: FlaskConical,
  telescope: Telescope,
  brain: Brain,
  users: Users,
  sparkles: Sparkles,
}

export function categoryIcon(icon: string): LucideIcon {
  return iconMap[icon] ?? Sparkles
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-ink-900 dark:text-white sm:text-2xl">دسته‌بندی‌ها</h2>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">هر دسته‌بندی، دنیایی از دانش و داستان</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {categories.map((cat) => {
          const Icon = categoryIcon(cat.icon)
          return (
            <Link
              key={cat.id}
              to={`/books?category=${cat.slug}`}
              className="card group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div
                className="absolute -end-6 -top-6 h-20 w-20 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ backgroundColor: `${cat.color}12` }}
                aria-hidden="true"
              />
              <div
                className="relative flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="relative mt-4">
                <div className="text-sm font-bold text-ink-900 dark:text-white">{cat.name}</div>
                <div className="mt-1 line-clamp-2 text-xs leading-5 text-ink-400">{cat.description}</div>
              </div>
              <div
                className="relative mt-3 flex items-center gap-1 text-xs font-semibold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ color: cat.color }}
              >
                مشاهده
                <ArrowLeft className="h-3 w-3" />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
