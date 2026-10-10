import { NavLink } from 'react-router-dom'
import { BookOpen, Home, Newspaper, ShoppingCart } from 'lucide-react'
import { useCart } from '../../context/CartContext'

export function MobileBottomNav() {
  const { count } = useCart()
  const items = [
    { to: '/', label: 'خانه', icon: Home, end: true },
    { to: '/books', label: 'فروشگاه', icon: BookOpen, end: false },
    { to: '/magazine', label: 'مجله', icon: Newspaper, end: false },
    { to: '/cart', label: 'سبد خرید', icon: ShoppingCart, end: false, badge: count },
  ]
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md dark:border-ink-800 dark:bg-ink-950/95 lg:hidden"
      aria-label="ناوبری موبایل"
    >
      <div className="grid grid-cols-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-colors ${
                isActive ? 'text-brand-600 dark:text-brand-400' : 'text-ink-400 dark:text-ink-500'
              }`
            }
          >
            <span className="relative">
              <item.icon className="h-5 w-5" />
              {item.badge != null && item.badge > 0 && (
                <span className="fa-num absolute -end-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[9px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
