import { useEffect, useState } from 'react'
import { Search, ListOrdered } from 'lucide-react'
import { api } from '../../services/api'
import type { Order, OrderStatus } from '../../types'
import { Pagination } from '../../components/common/Pagination'
import { EmptyState } from '../../components/common/States'
import { useToast } from '../../context/ToastContext'
import { formatPrice, toPersianDate, toPersianDigits } from '../../utils/format'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'در انتظار',
  processing: 'در حال پردازش',
  shipped: 'ارسال شده',
  delivered: 'تحویل شده',
  cancelled: 'لغو شده',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:text-amber-200',
  processing: 'bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-200',
  shipped: 'bg-accent-100 dark:bg-accent-900 text-accent-800 dark:text-accent-200',
  delivered: 'bg-emerald-100 text-emerald-800 dark:text-emerald-200',
  cancelled: 'bg-red-100 text-red-800',
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const toast = useToast()

  const load = (p = page, query = q, st = status) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: '10' })
    if (query.trim()) params.set('q', query.trim())
    if (st) params.set('status', st)
    api
      .get<{ data: Order[]; pagination: { page: number; totalPages: number; total: number } }>(
        `/api/v1/admin/orders?${params}`
      )
      .then((res) => {
        setOrders(res.data)
        setPagination(res.pagination)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status])

  const changeStatus = async (order: Order, newStatus: OrderStatus) => {
    setUpdating(order.id)
    try {
      const updated = await api.patch<Order>(`/api/v1/admin/orders/${order.id}/status`, { status: newStatus })
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)))
      toast.success(`وضعیت سفارش ${order.orderNumber} به «${STATUS_LABELS[newStatus]}» تغییر کرد`)
    } catch (err: any) {
      toast.error(err.message ?? 'خطا در تغییر وضعیت')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-ink-900 dark:text-white">مدیریت سفارش‌های آزمایشی</h1>

      <div className="card flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-52 flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(1, q, status)}
            placeholder="جست‌وجو بر اساس شماره سفارش یا نام مشتری…"
            className="input !py-2 !pe-9 !text-sm"
            aria-label="جست‌وجو در سفارش‌ها"
          />
          <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          className="input !w-auto !py-2 !text-sm"
          aria-label="فیلتر وضعیت"
        >
          <option value="">همه وضعیت‌ها</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button type="button" onClick={() => load(1, q, status)} className="btn-outline !py-2 !text-sm">
          اعمال
        </button>
        <span className="text-sm text-ink-400">{toPersianDigits(pagination.total)} سفارش</span>
      </div>

      {error && <div className="card p-4 text-sm text-red-600">خطا: {error}</div>}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState icon={ListOrdered} title="سفارشی یافت نشد" description="با تغییر فیلترها یا عبارت جست‌وجو تلاش کنید." />
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-mono text-sm font-bold text-ink-900 dark:text-white" dir="ltr">{order.orderNumber}</div>
                      <div className="mt-0.5 text-xs text-ink-400">{toPersianDate(order.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-ink-800 dark:text-ink-100">{order.customer.fullName}</div>
                      <div className="text-xs text-ink-400">{order.customer.city}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="fa-num text-base font-extrabold text-ink-900 dark:text-white">
                      {formatPrice(order.total)} <span className="text-xs font-normal text-ink-400">تومان</span>
                    </span>
                    <span className={`chip ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                    <select
                      value={order.status}
                      disabled={updating === order.id}
                      onChange={(e) => changeStatus(order, e.target.value as OrderStatus)}
                      className="input !w-auto !py-1.5 !text-xs"
                      aria-label={`تغییر وضعیت سفارش ${order.orderNumber}`}
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                      className="btn-ghost !rounded-lg !px-3 !py-1.5 !text-xs"
                    >
                      {expanded === order.id ? 'پنهان کردن' : 'جزئیات'}
                    </button>
                  </div>
                </div>

                {expanded === order.id && (
                  <div className="mt-4 border-t border-dashed border-ink-200 dark:border-ink-700 pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="mb-2 text-xs font-bold text-ink-900 dark:text-white">مشتری</h4>
                        <dl className="space-y-1 text-sm text-ink-600 dark:text-ink-300">
                          <div className="flex justify-between"><dt>نام</dt><dd>{order.customer.fullName}</dd></div>
                          <div className="flex justify-between"><dt>موبایل</dt><dd className="fa-num" dir="ltr">{order.customer.phone}</dd></div>
                          <div className="flex justify-between"><dt>ایمیل</dt><dd dir="ltr">{order.customer.email}</dd></div>
                          <div className="flex justify-between"><dt>شهر</dt><dd>{order.customer.city}</dd></div>
                          <div className="flex justify-between"><dt>کد پستی</dt><dd className="fa-num" dir="ltr">{order.customer.postalCode}</dd></div>
                          <div className="text-xs leading-5 text-ink-500 dark:text-ink-400">{order.customer.address}</div>
                        </dl>
                      </div>
                      <div>
                        <h4 className="mb-2 text-xs font-bold text-ink-900 dark:text-white">اقلام سفارش</h4>
                        <ul className="space-y-1.5 text-sm">
                          {order.items.map((item, i) => (
                            <li key={i} className="flex justify-between gap-3">
                              <span className="text-ink-700 dark:text-ink-300">
                                {item.title} <span className="text-xs text-ink-400">× {toPersianDigits(item.quantity)}</span>
                              </span>
                              <span className="fa-num shrink-0 text-ink-900 dark:text-white">{formatPrice(item.lineTotal)}</span>
                            </li>
                          ))}
                        </ul>
                        <dl className="mt-3 space-y-1 border-t border-dashed border-ink-200 dark:border-ink-700 pt-2 text-sm">
                          <div className="flex justify-between text-ink-500 dark:text-ink-400">
                            <dt>جمع اقلام</dt><dd className="fa-num">{formatPrice(order.subtotal)}</dd>
                          </div>
                          <div className="flex justify-between text-ink-500 dark:text-ink-400">
                            <dt>ارسال</dt><dd className="fa-num">{order.shipping === 0 ? 'رایگان' : formatPrice(order.shipping)}</dd>
                          </div>
                          <div className="flex justify-between font-bold text-ink-900 dark:text-white">
                            <dt>جمع نهایی</dt><dd className="fa-num text-brand-700 dark:text-brand-300">{formatPrice(order.total)}</dd>
                          </div>
                        </dl>
                        {order.note && (
                          <p className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-950 px-3 py-1.5 text-xs text-amber-800 dark:text-amber-200">{order.note}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
