import { Link } from 'react-router-dom'
import {
  ArrowUp,
  BadgePercent,
  Headset,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Truck,
  Twitter,
} from 'lucide-react'
import { Logo } from '../common/Logo'
import { useSettings } from '../../context/SettingsContext'

export function Footer() {
  const { settings } = useSettings()

  const services = [
    { to: '/books', label: 'همه کتاب‌ها' },
    { to: '/books?sort=popular', label: 'پرفروش‌ترین‌ها' },
    { to: '/books?sort=newest', label: 'جدیدترین‌ها' },
    { to: '/magazine', label: 'مجله ویراژ' },
    { to: '/bookmarks', label: 'علاقه‌مندی‌ها' },
    { to: '/cart', label: 'سبد خرید' },
  ]

  const categories = [
    { to: '/books?category=history-ir', label: 'تاریخ ایران' },
    { to: '/books?category=history-world', label: 'تاریخ جهان' },
    { to: '/books?category=civilizations', label: 'تمدن‌های باستان' },
    { to: '/books?category=science-tech', label: 'علم و فناوری' },
    { to: '/books?category=space', label: 'فضا و نجوم' },
    { to: '/books?category=philosophy', label: 'فلسفه و اندیشه' },
  ]

  const help = [
    { to: '/about', label: 'درباره ویراژ' },
    { to: '/checkout', label: 'ثبت سفارش' },
    { to: '/search', label: 'جست‌وجوی کتاب' },
    { to: '/admin', label: 'پنل مدیریت' },
  ]

  const trust = [
    { icon: Truck, title: 'ارسال سریع', desc: 'به سراسر کشور' },
    { icon: ShieldCheck, title: 'ضمانت اصالت', desc: 'کتاب اصل با شابک معتبر' },
    { icon: Headset, title: 'پشتیبانی', desc: 'پاسخ‌گویی در ساعت کاری' },
    { icon: BadgePercent, title: 'تخفیف واقعی', desc: 'پیشنهادهای شگفت‌انگیز' },
  ]

  return (
    <footer className="mt-14 border-t border-ink-100 bg-white dark:border-ink-800 dark:bg-ink-900">
      {/* نوار بازگشت به بالا */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex w-full items-center justify-center gap-2 border-b border-ink-100 py-3 text-xs font-bold text-ink-500 transition-colors hover:text-brand-600 dark:border-ink-800 dark:text-ink-400 dark:hover:text-brand-400"
      >
        بازگشت به بالا
        <ArrowUp className="h-4 w-4" />
      </button>

      <div className="container-x py-8">
        {/* اعتماد */}
        <div className="grid grid-cols-2 gap-4 pb-8 lg:grid-cols-4">
          {trust.map((t) => (
            <div key={t.title} className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <t.icon className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-sm font-bold text-ink-800 dark:text-ink-100">{t.title}</span>
                <span className="mt-0.5 block text-[11px] text-ink-400">{t.desc}</span>
              </span>
            </div>
          ))}
        </div>

        {/* ستون‌ها */}
        <div className="grid gap-8 border-t border-ink-100 py-8 dark:border-ink-800 md:grid-cols-4">
          <div>
            <Logo size={44} />
            <p className="mt-3 text-xs leading-6 text-ink-500 dark:text-ink-400">{settings.tagline}</p>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li className="flex items-center gap-2 text-ink-500 dark:text-ink-400">
                <Phone className="h-3.5 w-3.5 shrink-0 text-ink-400" />
                <span className="fa-num" dir="ltr">{settings.contact.phone || '—'}</span>
              </li>
              <li className="flex items-center gap-2 text-ink-500 dark:text-ink-400">
                <Mail className="h-3.5 w-3.5 shrink-0 text-ink-400" />
                <span dir="ltr">{settings.contact.email || '—'}</span>
              </li>
              <li className="flex items-start gap-2 text-ink-500 dark:text-ink-400">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
                <span>{settings.contact.address || '—'}</span>
              </li>
            </ul>
            <div className="mt-4 flex gap-2">
              {settings.social.instagram && (
                <a href={settings.social.instagram} target="_blank" rel="noreferrer" aria-label="اینستاگرام"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 text-ink-400 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-ink-700 dark:hover:text-brand-400">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {settings.social.telegram && (
                <a href={settings.social.telegram} target="_blank" rel="noreferrer" aria-label="تلگرام"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 text-ink-400 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-ink-700 dark:hover:text-brand-400">
                  <Send className="h-4 w-4" />
                </a>
              )}
              {settings.social.twitter && (
                <a href={settings.social.twitter} target="_blank" rel="noreferrer" aria-label="توییتر"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 text-ink-400 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-ink-700 dark:hover:text-brand-400">
                  <Twitter className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {[
            { title: 'خدمات ویراژ', links: services },
            { title: 'حوزه‌های محتوایی', links: categories },
            { title: 'راهنمای خرید', links: help },
          ].map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h4 className="mb-4 text-sm font-bold text-ink-900 dark:text-white">{col.title}</h4>
              <ul className="space-y-2.5 text-[13px]">
                {col.links.map((l) => (
                  <li key={l.to + l.label}>
                    <Link to={l.to} className="text-ink-500 transition-colors hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-400">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* متن سئو */}
        <div className="border-t border-ink-100 py-6 dark:border-ink-800">
          <h4 className="text-sm font-bold text-ink-800 dark:text-ink-100">فروشگاه اینترنتی کتاب ویراژ</h4>
          <p className="mt-2 text-[11px] leading-6 text-ink-400">
            فروشگاه اینترنتی ویراژ، مرجع خرید آنلاین کتاب و مجله در حوزه‌های تاریخ ایران و جهان، تمدن‌های باستان،
            علم و فناوری، فضا و نجوم، فلسفه و دانش عمومی است. در ویراژ می‌توانید پرفروش‌ترین کتاب‌ها را با تخفیف‌های
            واقعی، ضمانت اصالت کالا و ارسال سریع به سراسر کشور تهیه کنید و هر روز یک مقاله تازه از مجله ویراژ بخوانید.
          </p>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-ink-100 pt-5 text-[11px] text-ink-400 sm:flex-row dark:border-ink-800">
          <p>© {new Date().getFullYear()} {settings.siteName} — تمامی حقوق محفوظ است.</p>
          <p className="flex items-center gap-1">
            طراحی و توسعه:
            <a href="https://shahbazteam.ir" target="_blank" rel="noreferrer" className="font-bold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
              تیم شهباز
            </a>
          </p>
          <p>نمونه‌کار نمایشی — سفارش‌ها واقعی نیستند.</p>
        </div>
      </div>
    </footer>
  )
}
