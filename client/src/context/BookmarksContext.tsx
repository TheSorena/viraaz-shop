import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface BookmarksContextValue {
  bookmarks: string[]
  isBookmarked: (id: string) => boolean
  toggle: (id: string) => void
  /** سازگاری با کامپوننت‌های قدیمی */
  has: (id: string) => boolean
  count: number
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null)

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useLocalStorage<string[]>('viraaz-bookmarks', [])

  const toggle = useCallback(
    (id: string) => {
      setBookmarks((prev) =>
        prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
      )
    },
    [setBookmarks]
  )

  const isBookmarked = useCallback((id: string) => bookmarks.includes(id), [bookmarks])

  const value = useMemo(
    () => ({ bookmarks, isBookmarked, toggle, has: isBookmarked, count: bookmarks.length }),
    [bookmarks, isBookmarked, toggle]
  )

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>
}

export function useBookmarks(): BookmarksContextValue {
  const ctx = useContext(BookmarksContext)
  if (!ctx) throw new Error('useBookmarks must be used within BookmarksProvider')
  return ctx
}
