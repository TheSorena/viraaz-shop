import { useEffect, useState } from 'react'
import { bookService } from '../services/bookService'
import { articleService } from '../services/articleService'
import { categoryService } from '../services'
import type { Article, Book, Category } from '../types'
import { HeroSlider } from '../components/sections/HeroSlider'
import { CategoryCircles } from '../components/sections/CategoryCircles'
import { AmazingOffers } from '../components/sections/AmazingOffers'
import { PromoBanners } from '../components/sections/PromoBanners'
import { ProductCarousel } from '../components/sections/ProductCarousel'
import { SectionHeader } from '../components/sections/HeroBanner'
import { TodayPick } from '../components/sections/TodayPick'
import { Newsletter } from '../components/sections/Newsletter'
import { ArticleCard } from '../components/common/ArticleCard'
import { ArticleCardSkeleton } from '../components/common/Skeleton'

export function HomePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [newBooks, setNewBooks] = useState<Book[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [popular, fresh, arts, cats] = await Promise.all([
          bookService.list({ sort: 'popular', limit: 10 }),
          bookService.list({ sort: 'newest', limit: 10 }),
          articleService.list({ limit: 6 }),
          categoryService.list(),
        ])
        if (cancelled) return
        setBooks(popular.data)
        setNewBooks(fresh.data)
        setArticles(arts.data)
        setCategories(cats)
      } catch {
        // keep empty states
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const allBooks = [...books, ...newBooks].filter(
    (b, i, arr) => arr.findIndex((x) => x.id === b.id) === i
  )
  const byCategory = (slug: string) => {
    const cat = categories.find((c) => c.slug === slug)
    if (!cat) return []
    return allBooks.filter((b) => b.categoryId === cat.id)
  }
  const historyBooks = byCategory('history-ir')
  const scienceBooks = byCategory('science-tech')

  return (
    <div className="space-y-6 sm:space-y-10">
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'ویراژ',
          alternateName: 'Viraaz',
          inLanguage: 'fa-IR',
          potentialAction: {
            '@type': 'SearchAction',
            target: '/search?q={query}',
            'query-input': 'required name=query',
          },
        })}
      </script>

      <div className="container-x pt-3 sm:pt-5">
        <HeroSlider />
      </div>

      <div className="container-x space-y-6 sm:space-y-10">
        <CategoryCircles categories={categories} />

        <AmazingOffers books={allBooks} />

        <PromoBanners />

        <ProductCarousel
          title="پرفروش‌ترین‌ها"
          subtitle="محبوب‌ترین انتخاب خوانندگان ویراژ"
          href="/books?sort=popular"
          books={books}
        />

        <ProductCarousel
          title="جدیدترین انتشارات"
          subtitle="تازه‌ترین کتاب‌های رسیده به ویراژ"
          href="/books?sort=newest"
          books={newBooks}
        />

        {historyBooks.length >= 3 && (
          <ProductCarousel
            title="تاریخ ایران"
            subtitle="از هخامنشیان تا معاصر"
            href="/books?category=history-ir"
            books={historyBooks}
          />
        )}

        {scienceBooks.length >= 3 && (
          <ProductCarousel
            title="علم و فناوری"
            subtitle="کشفیاتی که جهان را دگرگون کرد"
            href="/books?category=science-tech"
            books={scienceBooks}
          />
        )}

        <TodayPick />

        <section>
          <SectionHeader
            title="مقالات منتخب مجله"
            subtitle="تازه‌ترین مطالب مجله‌ی ویراژ"
            href="/magazine"
          />
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </section>

        <Newsletter />
      </div>
    </div>
  )
}
