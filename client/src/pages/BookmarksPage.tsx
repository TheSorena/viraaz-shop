import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useBookmarks } from '../context/BookmarksContext'
import { bookService } from '../services/bookService'
import type { Book } from '../types'
import { BookCard } from '../components/common/BookCard'
import { BookCardSkeleton } from '../components/common/Skeleton'
import { EmptyState } from '../components/common/States'
import { Breadcrumb } from '../components/common/Breadcrumb'

export function BookmarksPage() {
  const { bookmarks } = useBookmarks()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (bookmarks.length === 0) {
        setBooks([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const res = await bookService.list({ limit: 100 })
        if (cancelled) return
        setBooks(res.data.filter((b) => bookmarks.includes(b.id)))
      } catch {
        if (!cancelled) setBooks([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [bookmarks])

  return (
    <div className="container-x py-8">
      <Breadcrumb items={[{ label: 'خانه', href: '/' }, { label: 'علاقه‌مندی‌ها' }]} />
      <h1 className="mt-4 text-2xl font-extrabold text-ink-900 dark:text-white">علاقه‌مندی‌ها</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">کتاب‌ها و مقالاتی که نشانک کرده‌اید، اینجا ذخیره می‌شوند.</p>

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : books.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="هنوز چیزی نشانک نکرده‌اید"
            description="روی قلب هر کتاب بزنید تا اینجا ذخیره شود."
            action={
              <Link to="/books" className="btn-primary mt-2">
                مشاهده فروشگاه
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {books.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
