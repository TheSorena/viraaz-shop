import { Link } from 'react-router-dom'

export function Logo({ size = 40, withText = true }: { size?: number; withText?: boolean }) {
  // لوگو ترنسپرنت است و بدون هیچ بک‌گراندی نمایش داده می‌شود؛ نسبت طبیعی ۳:۲ حفظ شده
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="ویراژ — صفحه اصلی">
      <img
        src="/images/viraaz.png"
        alt="لوگوی ویراژ"
        style={{ height: size, width: 'auto' }}
        className="shrink-0 transition-all duration-300 group-hover:scale-105 dark:drop-shadow-[0_0_14px_rgba(139,92,246,0.55)]"
        loading="eager"
      />
      {withText && (
        <span className="leading-none">
          <span className="block text-xl font-black tracking-tight text-ink-900 dark:text-white">
            ویراژ
          </span>
          <span className="mt-0.5 block text-[10px] font-bold tracking-[0.2em] text-brand-600 dark:text-brand-400">
            VIRAAZ
          </span>
        </span>
      )}
    </Link>
  )
}
