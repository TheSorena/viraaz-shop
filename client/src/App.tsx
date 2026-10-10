import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import { BookmarksProvider } from './context/BookmarksContext'
import { SettingsProvider } from './context/SettingsContext'
import { ThemeProvider } from './context/ThemeContext'
import { MainLayout } from './components/layout/MainLayout'
import { AdminLayout } from './components/layout/AdminLayout'
import { HomePage } from './pages/HomePage'
import { BooksPage } from './pages/BooksPage'
import { BookDetailPage } from './pages/BookDetailPage'
import { MagazinePage } from './pages/MagazinePage'
import { ArticlePage } from './pages/ArticlePage'
import { SearchPage } from './pages/SearchPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { AboutPage } from './pages/AboutPage'
import { BookmarksPage } from './pages/BookmarksPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { AdminDashboardPage } from './pages/admin/DashboardPage'
import { AdminBooksPage } from './pages/admin/BooksAdminPage'
import { AdminArticlesPage } from './pages/admin/ArticlesAdminPage'
import { AdminOrdersPage } from './pages/admin/OrdersAdminPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

function SeoManager() {
  const location = useLocation()
  useEffect(() => {
    const path = location.pathname
    let title = 'ویراژ | فروشگاه کتاب و مجله'
    let description = 'فروشگاه آنلاین کتاب و مجله ویراژ؛ تاریخ، علم، فناوری، فلسفه و دانش عمومی'
    if (path === '/books') {
      title = 'فروشگاه کتاب | ویراژ'
      description = 'مشاهده و خرید کتاب‌های تاریخ، علم، فناوری، فلسفه و دانش عمومی'
    } else if (path === '/magazine') {
      title = 'مجله ویراژ | مقالات تاریخی و علمی'
      description = 'مقالات منتخب درباره تاریخ ایران و جهان، تمدن‌ها، علم و فلسفه'
    } else if (path === '/cart') {
      title = 'سبد خرید | ویراژ'
    } else if (path === '/checkout') {
      title = 'ثبت سفارش | ویراژ'
    } else if (path === '/search') {
      title = 'جست‌وجو | ویراژ'
    } else if (path.startsWith('/admin')) {
      title = 'پنل مدیریت | ویراژ'
    }
    document.title = title
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', description)
  }, [location.pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <SettingsProvider>
        <CartProvider>
          <ToastProvider>
            <BookmarksProvider>
              <ScrollToTop />
              <SeoManager />
              <Routes>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/books" element={<BooksPage />} />
                  <Route path="/books/:slug" element={<BookDetailPage />} />
                  <Route path="/magazine" element={<MagazinePage />} />
                  <Route path="/magazine/:slug" element={<ArticlePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/bookmarks" element={<BookmarksPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="books" element={<AdminBooksPage />} />
                  <Route path="articles" element={<AdminArticlesPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                </Route>
              </Routes>
            </BookmarksProvider>
          </ToastProvider>
        </CartProvider>
      </SettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
