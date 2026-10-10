import { Link } from 'react-router-dom'
import { ArrowLeft, Clock, Eye } from 'lucide-react'
import type { Article } from '../../types'
import { toPersianDate, toPersianDigits } from '../../utils/format'

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      to={`/magazine/${article.slug}`}
      className="card group flex h-full flex-col overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative overflow-hidden">
        <img
          src={`/images/${article.cover}`}
          alt={article.title}
          className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {article.featured && (
          <span className="absolute start-3 top-3 rounded-lg bg-brand-600 px-2 py-0.5 text-[11px] font-bold text-white shadow">
            منتخب
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-3 text-[11px] text-ink-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {toPersianDigits(article.readMinutes)} دقیقه مطالعه
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {toPersianDate(article.publishedAt)}
          </span>
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-6 text-ink-900 dark:text-white transition-colors group-hover:text-brand-700">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-ink-500 dark:text-ink-400">{article.summary}</p>
        <div className="mt-auto flex items-center gap-1 pt-3 text-xs font-semibold text-brand-700 dark:text-brand-300">
          مطالعه مقاله
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
        </div>
      </div>
    </Link>
  )
}
