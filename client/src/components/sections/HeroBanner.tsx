import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, Newspaper, Sparkles, TrendingUp } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'

export function HeroBanner() {
  const { settings } = useSettings()
  return (
    <section className="relative overflow-hidden bg-gradient-to-l from-brand-950 via-brand-900 to-ink-900 text-white">
      {/* decorative glows */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 40%, rgba(124,58,237,0.45) 0, transparent 45%), radial-gradient(circle at 85% 15%, rgba(37,99,235,0.35) 0, transparent 40%), radial-gradient(circle at 70% 85%, rgba(251,191,36,0.12) 0, transparent 35%)',
        }}
        aria-hidden="true"
      />
      {/* floating book silhouettes */}
      <div className="pointer-events-none absolute -top-10 end-8 hidden opacity-15 lg:block" aria-hidden="true">
        <svg width="220" height="220" viewBox="0 0 64 64" fill="none">
          <path d="M12 21C18 17.5 25 17.5 32 21.5C39 17.5 46 17.5 52 21V45C46 41.5 39 41.5 32 45.5C25 41.5 18 41.5 12 45V21Z" fill="#fff" />
          <path d="M32 21.5V45.5" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="pointer-events-none absolute -bottom-12 end-40 hidden opacity-10 lg:block" aria-hidden="true">
        <svg width="160" height="160" viewBox="0 0 64 64" fill="none">
          <path d="M12 21C18 17.5 25 17.5 32 21.5C39 17.5 46 17.5 52 21V45C46 41.5 39 41.5 32 45.5C25 41.5 18 41.5 12 45V21Z" fill="#fff" />
          <path d="M32 21.5V45.5" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>

      <div className="container-x relative py-12 sm:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_380px]">
        <div className="max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-accent-300" />
            فروشگاه کتاب و مجله
          </span>
          <h1 className="text-4xl font-black leading-[1.15] sm:text-5xl sm:leading-[1.15]">
            {settings.siteName}
            <span className="mt-3 block bg-gradient-to-l from-brand-200 via-white to-accent-200 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
              {settings.tagline}
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-brand-100 sm:text-base sm:leading-8">
            گزیده‌ای از بهترین کتاب‌ها و مقالات در حوزه‌های تاریخ، علم، فناوری،
            فلسفه و دانش عمومی. همراه با مجله‌ی ویراژ برای مطالعه‌ی روزانه.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/books"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-800 dark:text-brand-200 shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
            >
              <BookOpen className="h-4 w-4" />
              مشاهده کتاب‌ها
            </Link>
            <Link
              to="/magazine"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
            >
              <Newspaper className="h-4 w-4" />
              مطالعه مقالات
            </Link>
          </div>

          {/* mini stats */}
          <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-white/15 pt-6">
            <div>
              <div className="flex items-center gap-1.5 text-2xl font-black text-accent-300">
                <TrendingUp className="h-5 w-5" />
                ۲۰+
              </div>
              <div className="mt-1 text-xs text-brand-200">عنوان کتاب منتخب</div>
            </div>
            <div className="h-10 w-px bg-white/15" aria-hidden="true" />
            <div>
              <div className="text-2xl font-black text-accent-300">۸</div>
              <div className="mt-1 text-xs text-brand-200">حوزه‌ی محتوایی</div>
            </div>
            <div className="h-10 w-px bg-white/15" aria-hidden="true" />
            <div>
              <div className="text-2xl font-black text-accent-300">روزانه</div>
              <div className="mt-1 text-xs text-brand-200">مقالات تازه</div>
            </div>
          </div>
        </div>
        {/* Logo showcase — بدون بک‌گراند، فقط درخشش خود لوگو */}
        <div className="relative mx-auto hidden w-full max-w-[360px] lg:block">
          <img
            src="/images/viraaz.png"
            alt="لوگوی ویراژ"
            className="w-full drop-shadow-[0_0_45px_rgba(139,92,246,0.45)]"
            loading="eager"
          />
          <div className="absolute -bottom-4 start-6 end-6 flex items-center justify-between rounded-2xl bg-white/95 px-4 py-3 text-ink-900 dark:text-white shadow-xl backdrop-blur">
            <div>
              <div className="text-sm font-black">فروشگاه ویراژ</div>
              <div className="text-[11px] text-ink-500 dark:text-ink-400">ارسال سریع • ضمانت اصالت</div>
            </div>
            <Link to="/books" className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700">
              خرید کنید
            </Link>
          </div>
        </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="block h-8 w-full fill-white dark:fill-ink-950 sm:h-12" aria-hidden="true">
          <path d="M0 60 L0 30 C240 60 480 0 720 20 C960 40 1200 10 1440 30 L1440 60 Z" />
        </svg>
      </div>
    </section>
  )
}

export function SectionHeader({
  title,
  subtitle,
  href,
  hrefLabel = 'مشاهده همه',
}: {
  title: string
  subtitle?: string
  href?: string
  hrefLabel?: string
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-extrabold text-ink-900 dark:text-white sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{subtitle}</p>}
      </div>
      {href && (
        <Link
          to={href}
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-700 dark:text-brand-300 transition-colors hover:text-brand-800"
        >
          {hrefLabel}
          <ArrowLeft className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
