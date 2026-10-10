import { Link } from 'react-router-dom'
import { History, FlaskConical, ArrowLeft, Compass } from 'lucide-react'
import { ArticleCard } from '../common/ArticleCard'
import { SectionHeader } from './HeroBanner'
import type { Article } from '../../types'

export function HistorySpotlight({ articles }: { articles: Article[] }) {
  const featured = articles.filter((a) => a.featured).slice(0, 3)
  if (featured.length === 0) return null
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-ink-900 via-ink-800 to-brand-950 p-6 text-white sm:p-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 85% 20%, rgba(124,58,237,0.4) 0, transparent 45%), radial-gradient(circle at 10% 90%, rgba(37,99,235,0.3) 0, transparent 40%)',
        }}
        aria-hidden="true"
      />
      <div className="relative">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <History className="h-6 w-6 text-brand-300" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold sm:text-2xl">سفر به تاریخ و تمدن‌ها</h2>
            <p className="mt-0.5 text-sm text-ink-300">از هخامنشیان تا تمدن‌های کهن جهان</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {featured.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
            >
              <ArticleCard article={a} />
            </div>
          ))}
        </div>
        <Link
          to="/magazine?category=history-ir"
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-brand-200 backdrop-blur transition-colors hover:bg-white/20"
        >
          <Compass className="h-4 w-4" />
          مطالعه بیشتر درباره تاریخ
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

export function ScienceSpotlight({ articles }: { articles: Article[] }) {
  const science = articles
    .filter((a) => a.categoryId === 'cat-science-tech' || a.categoryId === 'cat-space')
    .slice(0, 3)
  if (science.length === 0) return null
  return (
    <section>
      <SectionHeader
        title="دانستنی‌های علمی"
        subtitle="مطالب جذاب علمی و فناوری برای کنجکاوی‌های شما"
        href="/magazine?category=science-tech"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {science.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-accent-100 dark:border-accent-900 bg-accent-50 dark:bg-accent-950 p-4 text-sm leading-6 text-accent-800 dark:text-accent-200">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-100 dark:bg-accent-900">
          <FlaskConical className="h-5 w-5" />
        </div>
        <p>
          محتوای علمی ویراژ بر اساس منابع معتبر تهیه شده و همه‌ی مقالات با برچسب
          «محتوای آزمایشی» مشخص می‌شوند.
        </p>
      </div>
    </section>
  )
}
