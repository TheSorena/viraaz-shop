import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { orderService } from '../services'
import type { Order, OrderCustomer } from '../types'
import { Breadcrumb } from '../components/common/Breadcrumb'
import { EmptyState } from '../components/common/States'
import { useSettings } from '../context/SettingsContext'
import { formatPrice, toPersianDigits } from '../utils/format'

interface FormErrors {
  fullName?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
}

function validate(customer: OrderCustomer): FormErrors {
  const errors: FormErrors = {}
  if (!customer.fullName.trim() || customer.fullName.trim().length < 3) {
    errors.fullName = 'نام و نام خانوادگی الزامی است (حداقل ۳ حرف)'
  }
  if (!customer.phone.trim() || customer.phone.replace(/\D/g, '').length < 9) {
    errors.phone = 'شماره موبایل نامعتبر است'
  }
  if (!customer.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    errors.email = 'ایمیل نامعتبر است'
  }
  if (!customer.address.trim() || customer.address.trim().length < 5) {
    errors.address = 'نشانی کامل الزامی است'
  }
  if (!customer.city.trim()) {
    errors.city = 'شهر الزامی است'
  }
  if (!customer.postalCode.trim() || customer.postalCode.replace(/\D/g, '').length < 8) {
    errors.postalCode = 'کد پستی نامعتبر است'
  }
  return errors
}

export function CheckoutPage() {
  const { items, subtotal, clear } = useCart()
  const { settings } = useSettings()

  const [customer, setCustomer] = useState<OrderCustomer>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null)

  const shipping = subtotal >= settings.freeShippingThreshold || subtotal === 0 ? 0 : settings.shippingFee
  const total = subtotal + shipping

  const set = (key: keyof OrderCustomer) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomer((prev) => ({ ...prev, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const validation = validate(customer)
    setErrors(validation)
    if (Object.keys(validation).length > 0) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const order = await orderService.create(
        items.map((i) => ({ bookId: i.bookId, quantity: i.quantity })),
        customer
      )
      setPlacedOrder(order)
      clear()
    } catch (err: any) {
      setSubmitError(err.message ?? 'خطا در ثبت سفارش')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (hasError?: string) =>
    `input ${hasError ? '!border-red-400 focus:!border-red-500 focus:!ring-red-100 dark:focus:!ring-red-900' : ''}`

  if (placedOrder) {
    return (
      <div className="container-x py-12">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-black text-ink-900 dark:text-white">سفارش آزمایشی ثبت شد</h1>
          <p className="mt-3 text-sm leading-7 text-ink-500 dark:text-ink-400">
            شماره سفارش شما:
          </p>
          <div className="mt-2 inline-block rounded-xl bg-ink-900 px-6 py-3 font-mono text-lg font-bold tracking-wider text-white">
            {placedOrder.orderNumber}
          </div>

          <div className="card mt-8 p-5 text-right">
            <h2 className="mb-3 text-sm font-bold text-ink-900 dark:text-white">خلاصه سفارش</h2>
            <ul className="space-y-2 text-sm">
              {placedOrder.items.map((item, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span className="text-ink-700 dark:text-ink-300">
                    {item.title} × {toPersianDigits(item.quantity)}
                  </span>
                  <span className="fa-num text-ink-900 dark:text-white">{formatPrice(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-dashed border-ink-200 dark:border-ink-700 pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-400">جمع اقلام</dt>
                <dd className="fa-num">{formatPrice(placedOrder.subtotal)} تومان</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-400">ارسال</dt>
                <dd className="fa-num">{placedOrder.shipping === 0 ? 'رایگان' : `${formatPrice(placedOrder.shipping)} تومان`}</dd>
              </div>
              <div className="flex justify-between font-bold">
                <dt>جمع نهایی</dt>
                <dd className="fa-num text-brand-700 dark:text-brand-300">{formatPrice(placedOrder.total)} تومان</dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 rounded-xl bg-amber-50 dark:bg-amber-950 px-4 py-3 text-right text-xs leading-6 text-amber-800 dark:text-amber-200">
            <ShieldAlert className="ml-1 inline h-4 w-4" />
            این یک سفارش آزمایشی است. هیچ پولی دریافت نمی‌شود و این سفارش صرفاً در فایل
            محلی JSON ذخیره شده است.
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Link to="/books" className="btn-primary">
              ادامه خرید
            </Link>
            <Link to="/" className="btn-outline">
              صفحه اصلی
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-8">
        <Breadcrumb items={[{ label: 'خانه', href: '/' }, { label: 'سبد خرید', href: '/cart' }, { label: 'ثبت سفارش' }]} />
        <div className="mt-6">
          <EmptyState
            icon={AlertCircle}
            title="سبد خرید خالی است"
            description="برای ثبت سفارش ابتدا کتابی به سبد خرید اضافه کنید."
            action={
              <Link to="/books" className="btn-primary mt-2">
                مشاهده فروشگاه
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container-x py-8">
      <Breadcrumb items={[{ label: 'خانه', href: '/' }, { label: 'سبد خرید', href: '/cart' }, { label: 'ثبت سفارش' }]} />

      <h1 className="mt-4 text-2xl font-extrabold text-ink-900 dark:text-white">ثبت سفارش آزمایشی</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
        این فرایند کاملاً آزمایشی است؛ هیچ پرداختی انجام نمی‌شود.
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="card space-y-5 p-6">
          <h2 className="text-base font-bold text-ink-900 dark:text-white">اطلاعات گیرنده و نشانی</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="label">نام و نام خانوادگی *</label>
              <input id="fullName" value={customer.fullName} onChange={set('fullName')} className={inputClass(errors.fullName)} placeholder="مثلاً: علی احمدی" />
              {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="label">شماره موبایل *</label>
              <input id="phone" dir="ltr" value={customer.phone} onChange={set('phone')} className={`${inputClass(errors.phone)} text-left`} placeholder="09120000000" />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="label">ایمیل *</label>
            <input id="email" dir="ltr" type="email" value={customer.email} onChange={set('email')} className={`${inputClass(errors.email)} text-left`} placeholder="example@email.com" />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="address" className="label">نشانی کامل *</label>
            <textarea id="address" rows={3} value={customer.address} onChange={set('address')} className={inputClass(errors.address)} placeholder="استان، شهر، خیابان، پلاک، واحد…" />
            {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="city" className="label">شهر *</label>
              <input id="city" value={customer.city} onChange={set('city')} className={inputClass(errors.city)} placeholder="تهران" />
              {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
            </div>
            <div>
              <label htmlFor="postalCode" className="label">کد پستی *</label>
              <input id="postalCode" dir="ltr" value={customer.postalCode} onChange={set('postalCode')} className={`${inputClass(errors.postalCode)} text-left`} placeholder="1234567890" />
              {errors.postalCode && <p className="mt-1 text-xs text-red-600">{errors.postalCode}</p>}
            </div>
          </div>
        </div>

        <aside className="card h-fit p-5 lg:sticky lg:top-24">
          <h2 className="text-base font-bold text-ink-900 dark:text-white">خلاصه سفارش</h2>
          <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto text-sm">
            {items.map((item) => (
              <li key={item.bookId} className="flex items-center gap-3">
                <img src={`/images/${item.cover}`} alt="" className="h-12 w-9 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-ink-800 dark:text-ink-100">{item.title}</div>
                  <div className="text-xs text-ink-400">
                    {formatPrice(item.price)} × {toPersianDigits(item.quantity)}
                  </div>
                </div>
                <div className="fa-num shrink-0 font-medium text-ink-900 dark:text-white">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-dashed border-ink-200 dark:border-ink-700 pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500 dark:text-ink-400">جمع اقلام</dt>
              <dd className="fa-num">{formatPrice(subtotal)} تومان</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500 dark:text-ink-400">ارسال</dt>
              <dd className="fa-num">{shipping === 0 ? 'رایگان' : `${formatPrice(shipping)} تومان`}</dd>
            </div>
            <div className="flex justify-between border-t border-ink-100 dark:border-ink-800 pt-2 font-bold">
              <dt>جمع نهایی</dt>
              <dd className="fa-num text-brand-700 dark:text-brand-300">{formatPrice(total)} تومان</dd>
            </div>
          </dl>

          {submitError && (
            <p className="mt-3 rounded-lg bg-red-50 dark:bg-red-950 px-3 py-2 text-xs leading-5 text-red-700" role="alert">
              {submitError}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full">
            {submitting ? 'در حال ثبت…' : 'ثبت سفارش آزمایشی'}
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-3 text-center text-[10px] leading-4 text-ink-400">
            با ثبت سفارش، اطلاعات در فایل محلی JSON سرور ذخیره می‌شود.
          </p>
        </aside>
      </form>
    </div>
  )
}
