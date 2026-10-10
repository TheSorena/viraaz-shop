import { Link } from 'react-router-dom'
import { Newspaper, Truck } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'
import { formatPrice } from '../../utils/format'

export function PromoBanners() {
  const { settings } = useSettings()
  return (
    <section className="grid gap-3 sm:grid-cols-2" aria-label="پیشنهادهای ویژه">
      <Link
        to="/books"
        className="group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-l from-amber-500 to-orange-500 p-5 text-white shadow-soft transition-transform hover:-translate-y-0.5 sm:p-6"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur transition-transform group-hover:scale-110">
          <Truck className="h-7 w-7" />
        </span>
        <span>
          <span className="block text-base font-black sm:text-lg">ارسال رایگان</span>
          <span className="fa-num mt-1 block text-xs text-white/90">
            برای سفارش‌های بالای {formatPrice(settings.freeShippingThreshold)} تومان
          </span>
        </span>
      </Link>
      <Link
        to="/magazine"
        className="group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-l from-sky-600 to-brand-700 p-5 text-white shadow-soft transition-transform hover:-translate-y-0.5 sm:p-6"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur transition-transform group-hover:scale-110">
          <Newspaper className="h-7 w-7" />
        </span>
        <span>
          <span className="block text-base font-black sm:text-lg">مجله ویراژ</span>
          <span className="mt-1 block text-xs text-white/90">هر روز یک مقاله تازه، رایگان بخوانید</span>
        </span>
      </Link>
    </section>
  )
}
