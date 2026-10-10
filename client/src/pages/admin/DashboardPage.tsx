import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, Newspaper, ShoppingBag, Banknote, ArrowLeft, LayoutDashboard,
  BookMarked, ListOrdered, Settings as SettingsIcon,
} from 'lucide-react'
import { api } from '../../services/api'
import { toPersianDigits, formatPrice, toPersianDate } from '../../utils/format'

interface DashboardStats {
  booksCount: number
  articlesCount: number
  ordersCount: number
  totalSales: number
  statusCounts: Record<string, number>
  recentOrders: Array<{
    id: string
    orderNumber: string
    customer: { fullName: string }
    total: number
    status: string
    createdAt: string
  }>
  ordersByDay: Array<{ label: string; count: number; total: number }>
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار',
  processing: 'در حال پردازش',
  shipped: 'ارسال شده',
  delivered: 'تحویل شده',
  cancelled: 'لغو شده',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:text-amber-200',
  processing: 'bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-200',
  shipped: 'bg-accent-100 dark:bg-accent-900 text-accent-800 dark:text-accent-200',
  delivered: 'bg-emerald-100 text-emerald-800 dark:text-emerald-200',
  cancelled: 'bg-red-100 text-red-800',
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<DashboardStats>('/api/v1/admin/dashboard')
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const maxCount = stats ? Math.max(1, ...stats.ordersByDay.map((d) => d.count)) : 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink-900 dark:text-white">داشبورد</h1>
        <Link to="/" className="btn-ghost !rounded-lg !px-3 !py-1.5 !text-xs">
          <ArrowLeft className="h-3.5 w-3.5" />
          بازگشت به سایت
        </Link>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="card p-6 text-center text-sm text-red-600">
          خطا در بارگذاری آمار: {error}
        </div>
      )}

      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'کتاب‌ها', value: stats.booksCount, icon: BookOpen, href: '/admin/books', color: 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400' },
              { label: 'مقالات', value: stats.articlesCount, icon: Newspaper, href: '/admin/articles', color: 'bg-accent-50 dark:bg-accent-950 text-accent-600' },
              { label: 'سفارش‌های آزمایشی', value: stats.ordersCount, icon: ShoppingBag, href: '/admin/orders', color: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600' },
              { label: 'فروش آزمایشی', value: formatPrice(stats.totalSales), icon: Banknote, href: '/admin/orders', color: 'bg-amber-50 dark:bg-amber-950 text-amber-600', suffix: 'تومان' },
            ].map((card) => (
              <Link
                key={card.label}
                to={card.href}
                className="card group p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="fa-num mt-4 text-2xl font-black text-ink-900 dark:text-white">
                  {card.value}
                  {card.suffix && <span className="text-xs font-normal text-ink-400"> {card.suffix}</span>}
                </div>
                <div className="mt-1 text-sm text-ink-500 dark:text-ink-400">{card.label}</div>
              </Link>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Orders chart (deterministic from data) */}
            <div className="card p-5">
              <h2 className="mb-4 text-sm font-bold text-ink-900 dark:text-white">سفارش‌ها در ۱۴ روز گذشته</h2>
              <div className="flex h-40 items-end gap-1.5">
                {stats.ordersByDay.map((d, i) => (
                  <div key={i} className="group relative flex-1">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400 transition-all group-hover:from-brand-700 group-hover:to-brand-500"
                      style={{ height: `${Math.max(4, (d.count / maxCount) * 100)}%`, minHeight: d.count ? '8px' : '4px' }}
                    />
                    {d.count > 0 && (
                      <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-ink-900 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {toPersianDigits(d.count)} سفارش
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-ink-400">
                <span>{stats.ordersByDay[0]?.label}</span>
                <span>{stats.ordersByDay[stats.ordersByDay.length - 1]?.label}</span>
              </div>
            </div>

            {/* Status breakdown */}
            <div className="card p-5">
              <h2 className="mb-4 text-sm font-bold text-ink-900 dark:text-white">وضعیت سفارش‌ها</h2>
              <div className="space-y-3">
                {Object.entries(stats.statusCounts).map(([status, count]) => {
                  const pct = stats.ordersCount ? (count / stats.ordersCount) * 100 : 0
                  return (
                    <div key={status}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-ink-600 dark:text-ink-300">{STATUS_LABELS[status] ?? status}</span>
                        <span className="fa-num font-medium text-ink-900 dark:text-white">{toPersianDigits(count)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                        <div
                          className="h-full rounded-full bg-brand-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recent orders */}
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink-900 dark:text-white">آخرین سفارش‌ها</h2>
              <Link to="/admin/orders" className="text-xs font-semibold text-brand-700 dark:text-brand-300 hover:text-brand-800">
                مشاهده همه
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 dark:border-ink-800 text-right text-xs text-ink-400">
                    <th className="pb-2 font-medium">شماره سفارش</th>
                    <th className="pb-2 font-medium">مشتری</th>
                    <th className="pb-2 font-medium">مبلغ</th>
                    <th className="pb-2 font-medium">وضعیت</th>
                    <th className="pb-2 font-medium">تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-ink-50 last:border-0">
                      <td className="py-2.5 font-mono text-xs" dir="ltr">{o.orderNumber}</td>
                      <td className="py-2.5">{o.customer.fullName}</td>
                      <td className="fa-num py-2.5">{formatPrice(o.total)}</td>
                      <td className="py-2.5">
                        <span className={`chip ${STATUS_COLORS[o.status] ?? 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300'}`}>
                          {STATUS_LABELS[o.status] ?? o.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-xs text-ink-400">{toPersianDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shortcuts */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'مدیریت کتاب‌ها', desc: 'افزودن، ویرایش و حذف کتاب‌ها', icon: BookMarked, href: '/admin/books' },
              { label: 'مدیریت مقالات', desc: 'انتشار و ویرایش مطالب مجله', icon: Newspaper, href: '/admin/articles' },
              { label: 'مدیریت سفارش‌ها', desc: 'مشاهده و تغییر وضعیت سفارش‌ها', icon: ListOrdered, href: '/admin/orders' },
            ].map((s) => (
              <Link key={s.label} to={s.href} className="card flex items-center gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-ink-900 dark:text-white">{s.label}</div>
                  <div className="mt-0.5 text-xs text-ink-400">{s.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
