import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { EmptyState } from '../components/common/States'
import { Breadcrumb } from '../components/common/Breadcrumb'
import { useSettings } from '../context/SettingsContext'
import { formatPrice, toPersianDigits } from '../utils/format'

export function CartPage() {
  const { items, updateQuantity, removeItem, clear, subtotal, count } = useCart()
  const { settings } = useSettings()

  const freeShipping = subtotal >= settings.freeShippingThreshold
  const shipping = freeShipping || subtotal === 0 ? 0 : settings.shippingFee
  const total = subtotal + shipping
  const remaining = Math.max(0, settings.freeShippingThreshold - subtotal)

  return (
    <div className="container-x py-8">
      <Breadcrumb items={[{ label: 'خانه', href: '/' }, { label: 'سبد خرید' }]} />

      <h1 className="mt-4 text-2xl font-extrabold text-ink-900 dark:text-white">سبد خرید</h1>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={ShoppingCart}
            title="سبد خرید خالی است"
            description="هنوز کتابی به سبد اضافه نکرده‌اید. از فروشگاه، کتاب‌های مورد علاقه‌تان را انتخاب کنید."
            action={
              <Link to="/books" className="btn-primary mt-2">
                مشاهده فروشگاه
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.bookId} className="card flex gap-4 p-4">
                <Link to={`/books/${item.slug ?? item.bookId}`} className="shrink-0">
                  <img
                    src={`/images/${item.cover}`}
                    alt={item.title}
                    className="book-cover h-28 w-20 rounded-lg object-cover sm:h-32 sm:w-24"
                    loading="lazy"
                  />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/books/${item.slug ?? item.bookId}`}
                        className="text-sm font-bold leading-6 text-ink-900 dark:text-white transition-colors hover:text-brand-700 dark:hover:text-brand-300"
                      >
                        {item.title}
                      </Link>
                      <div className="mt-1 text-xs text-ink-400">
                        {formatPrice(item.price)} تومان
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.bookId)}
                      className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                      aria-label={`حذف ${item.title} از سبد`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-lg border border-ink-200 dark:border-ink-700">
                      <button
                        type="button"
                        className="p-2 text-ink-500 dark:text-ink-400 hover:text-ink-900 disabled:opacity-40"
                        onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="کاهش تعداد"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="fa-num min-w-8 text-center text-sm font-bold">
                        {toPersianDigits(item.quantity)}
                      </span>
                      <button
                        type="button"
                        className="p-2 text-ink-500 dark:text-ink-400 hover:text-ink-900 disabled:opacity-40"
                        onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        aria-label="افزایش تعداد"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-sm font-extrabold text-ink-900 dark:text-white">
                      {formatPrice(item.price * item.quantity)} <span className="text-xs font-normal text-ink-400">تومان</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={clear}
              className="btn-ghost !justify-start !text-xs !text-red-500 hover:!bg-red-50 dark:hover:!bg-red-950 dark:bg-red-950"
            >
              <Trash2 className="h-3.5 w-3.5" />
              پاک کردن سبد
            </button>
          </div>

          <aside className="card h-fit p-5 lg:sticky lg:top-24">
            <h2 className="text-base font-bold text-ink-900 dark:text-white">خلاصه سفارش</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-400">تعداد کالا</dt>
                <dd className="fa-num font-medium text-ink-900 dark:text-white">{toPersianDigits(count)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-400">جمع اقلام</dt>
                <dd className="fa-num font-medium text-ink-900 dark:text-white">{formatPrice(subtotal)} تومان</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500 dark:text-ink-400">هزینه ارسال</dt>
                <dd className="fa-num font-medium text-ink-900 dark:text-white">
                  {shipping === 0 ? 'رایگان' : `${formatPrice(shipping)} تومان`}
                </dd>
              </div>
              <div className="border-t border-dashed border-ink-200 dark:border-ink-700 pt-3">
                <div className="flex justify-between">
                  <dt className="font-bold text-ink-900 dark:text-white">جمع نهایی</dt>
                  <dd className="fa-num text-lg font-black text-brand-700 dark:text-brand-300">{formatPrice(total)} تومان</dd>
                </div>
              </div>
            </dl>

            {!freeShipping && remaining > 0 && (
              <p className="mt-4 rounded-lg bg-brand-50 dark:bg-brand-950 px-3 py-2 text-xs leading-5 text-brand-800 dark:text-brand-200">
                با خرید {formatPrice(remaining)} تومان دیگر، ارسال رایگان می‌شود.
              </p>
            )}
            {freeShipping && (
              <p className="mt-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 px-3 py-2 text-xs leading-5 text-emerald-700 dark:text-emerald-300">
                شما ارسال رایگان را دریافت کرده‌اید.
              </p>
            )}

            <Link to="/checkout" className="btn-primary mt-5 w-full">
              ادامه و ثبت سفارش
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-center text-[10px] leading-4 text-ink-400">
              سفارش‌ها در این نسخه آزمایشی هستند و هیچ پولی دریافت نمی‌شود.
            </p>
          </aside>
        </div>
      )}
    </div>
  )
}
