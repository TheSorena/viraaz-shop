import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { ToastContainer } from '../common/Toast'
import { BackToTop } from '../common/BackToTop'
import { MobileBottomNav } from './MobileBottomNav'

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-ink-900 dark:bg-ink-950 dark:text-ink-100">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
      <BackToTop />
      <MobileBottomNav />
    </div>
  )
}
