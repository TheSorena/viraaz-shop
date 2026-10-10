import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  BadgePercent,
  Flame,
  Heart,
  LayoutGrid,
  Menu,
  Moon,
  Newspaper,
  Search,
  ShoppingCart,
  Sun,
  Truck,
  X,
} from 'lucide-react'
import { Logo } from '../common/Logo'
import { useCart } from '../../context/CartContext'
import { useBookmarks } from '../../context/BookmarksContext'
import { useSettings } from '../../context/SettingsContext'
import { useTheme } from '../../context/ThemeContext'
import { categoryService } from '../../services'
import type { Category } from '../../types'
import { categoryIcon } from '../sections/CategoryGrid'
import { formatPrice } from '../../utils/format'

const quickLinks = [
  { to: '/books?sort=popular', label: 'پرفروش‌ترین‌ها', icon: Flame },
  { to: '/books', label: 'تخفیف‌ها', icon: BadgePercent },
  { to: '/magazine', label: 'مجله', icon: Newspaper },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [q, setQ] = useState('')
  const [cats, setCats] = useState<Category[]>([])
  const navigate = useNavigate()
  const { count } = useCart()
  const { count: bookmarkCount } = useBookmarks()
  const { settings } = useSettings()
  const { isDark, toggle: toggleTheme } = useTheme()
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    categoryService.list().then(setCats).catch(() => {})
  }, [])

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`)
      setMenuOpen(false)
    }
  }

  const searchBox = (id: string, auto = false) => (
    <form onSubmit={submitSearch} className="relative w-full" role="search">
      <input
        id={id}
        ref={auto ? searchRef : undefined}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="جست‌وجو در ویراژ…"
        className="w-full rounded-xl border border-transparent bg-ink-100/80 py-2.5 pe-11 ps-4 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 dark:bg-ink-800 dark:text-ink-100 dark:placeholder:text-ink-500 dark:focus:bg-ink-900 dark:focus:ring-brand-900"
        aria-label="جست‌وجو در ویراژ"
      />
      <button
        type="submit"
        className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-400 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
        aria-label="جست‌وجو"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100 bg-white/95 backdrop-blur-md dark:border-ink-800 dark:bg-ink-950/95">
      <div className="container-x">
        {/* ردیف اصلی: لوگو، جست‌وجو، اکشن‌ها */}
        <div className="flex items-center gap-3 py-3 lg:gap-6">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="btn-ghost shrink-0 !rounded-lg !p-2 lg:hidden"
            aria-label={menuOpen ? 'بستن منو' : 'باز کردن منو'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Logo size={40} />

          <div className="hidden max-w-2xl flex-1 lg:block">{searchBox('search-desktop')}</div>

          <div className="ms-auto flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="btn-ghost !rounded-lg !p-2"
              aria-label={isDark ? 'تغییر به تم روشن' : 'تغییر به تم شب'}
              title={isDark ? 'تم روشن' : 'تم شب'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link
              to="/bookmarks"
              className="btn-ghost relative hidden !rounded-lg !p-2 sm:flex"
              aria-label={`علاقه‌مندی‌ها (${bookmarkCount})`}
            >
              <Heart className="h-5 w-5" />
              {bookmarkCount > 0 && (
                <span className="fa-num absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">
                  {bookmarkCount}
                </span>
              )}
            </Link>
            <span className="hidden h-6 w-px bg-ink-200 dark:bg-ink-700 sm:block" aria-hidden="true" />
            <Link
              to="/cart"
              className="btn-outline relative !rounded-lg !px-3 !py-2"
              aria-label={`سبد خرید (${count})`}
            >
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="fa-num absolute -end-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white shadow">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* جست‌وجوی موبایل */}
        <div className="pb-3 lg:hidden">{searchBox('search-mobile')}</div>
      </div>

      {/* ردیف دوم دسکتاپ: مگامنو + لینک‌ها */}
      <div className="hidden border-t border-ink-100 dark:border-ink-800 lg:block">
        <div className="container-x flex items-center gap-1 py-1.5">
          {/* مگامنوی دسته‌بندی */}
          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900 dark:text-ink-200 dark:hover:bg-ink-800 dark:hover:text-white"
              aria-haspopup="true"
            >
              <LayoutGrid className="h-4 w-4" />
              دسته‌بندی کالاها
            </button>
            <div className="invisible absolute start-0 top-full z-50 w-72 translate-y-2 pt-1 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="card max-h-[70vh] overflow-y-auto p-2 shadow-lift">
                {cats.map((c) => {
                  const Icon = categoryIcon(c.icon)
                  return (
                    <Link
                      key={c.id}
                      to={`/books?category=${c.slug}`}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-ink-50 dark:hover:bg-ink-800"
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${c.color}18`, color: c.color }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block font-bold text-ink-800 dark:text-ink-100">{c.name}</span>
                        <span className="mt-0.5 line-clamp-1 block text-[11px] text-ink-400">{c.description}</span>
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          <span className="mx-1 h-5 w-px bg-ink-200 dark:bg-ink-700" aria-hidden="true" />

          <nav className="flex items-center gap-1" aria-label="دسترسی سریع">
            {quickLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-white"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/about"
              className="rounded-lg px-3 py-2 text-[13px] font-medium text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-white"
            >
              درباره ما
            </NavLink>
          </nav>

          <div className="ms-auto flex items-center gap-1.5 text-[11px] text-ink-400">
            <Truck className="h-4 w-4 text-brand-500" />
            ارسال رایگان سفارش‌های بالای {formatPrice(settings.freeShippingThreshold)} تومان
          </div>
        </div>
      </div>

      {/* منوی موبایل */}
      {menuOpen && (
        <div className="border-t border-ink-100 bg-white dark:border-ink-800 dark:bg-ink-950 lg:hidden">
          <nav className="container-x max-h-[70vh] overflow-y-auto py-3" aria-label="منوی موبایل">
            <p className="px-4 pb-2 text-xs font-bold text-ink-400">دسته‌بندی‌ها</p>
            {cats.map((c) => {
              const Icon = categoryIcon(c.icon)
              return (
                <Link
                  key={c.id}
                  to={`/books?category=${c.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${c.color}18`, color: c.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {c.name}
                </Link>
              )
            })}
            <div className="my-2 border-t border-ink-100 dark:border-ink-800" />
            {quickLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800"
              >
                <item.icon className="h-4 w-4 text-ink-400" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
