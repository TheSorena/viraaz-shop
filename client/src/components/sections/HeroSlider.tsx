import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronLeft, ChevronRight, Newspaper, Sparkles } from 'lucide-react'

const slides = [
  {
    id: 'books',
    badge: 'فروشگاه کتاب ویراژ',
    badgeIcon: BookOpen,
    title: 'دنیای کتاب، یک کلیک فاصله',
    desc: 'بیش از ۲۰ عنوان منتخب در تاریخ، علم، فلسفه و دانش عمومی — با تخفیف‌های واقعی و ارسال سریع.',
    cta: 'مشاهده فروشگاه',
    href: '/books',
    art: 'books',
  },
  {
    id: 'magazine',
    badge: 'مجله ویراژ',
    badgeIcon: Newspaper,
    title: 'هر روز یک مطلب تازه',
    desc: 'مقالات کوتاه و خواندنی درباره تمدن‌ها، کیهان و اندیشه — رایگان بخوانید.',
    cta: 'مطالعه مقالات',
    href: '/magazine',
    art: 'magazine',
  },
  {
    id: 'about',
    badge: 'چرا ویراژ؟',
    badgeIcon: Sparkles,
    title: 'کتاب اصل، قیمت شفاف',
    desc: 'ضمانت اصالت کالا، ارسال سریع به سراسر کشور و پشتیبانی پاسخ‌گو.',
    cta: 'درباره ما',
    href: '/about',
    art: 'trust',
  },
]

function SlideArt({ kind }: { kind: string }) {
  if (kind === 'books') {
    return (
      <div className="relative mx-auto grid w-full max-w-sm grid-cols-3 gap-3" aria-hidden="true">
        {['from-fuchsia-500 to-brand-700', 'from-sky-500 to-brand-800', 'from-amber-400 to-red-500'].map((g, i) => (
          <div
            key={i}
            className={`aspect-[3/4] rounded-2xl bg-gradient-to-br ${g} shadow-2xl ring-1 ring-white/30 ${
              i === 1 ? '-translate-y-4' : i === 2 ? 'translate-y-2' : '-translate-y-1'
            }`}
          >
            <div className="mx-2 mt-3 h-1.5 rounded-full bg-white/40" />
            <div className="mx-2 mt-1.5 h-1.5 w-2/3 rounded-full bg-white/30" />
            <div className="mx-2 mt-1.5 h-1.5 w-1/2 rounded-full bg-white/20" />
          </div>
        ))}
      </div>
    )
  }
  if (kind === 'magazine') {
    return (
      <div className="relative mx-auto w-full max-w-sm space-y-3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`rounded-2xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur ${i === 1 ? 'ms-8' : i === 2 ? 'ms-4' : ''}`}
          >
            <div className="h-2 w-3/4 rounded-full bg-white/50" />
            <div className="mt-2 h-2 w-full rounded-full bg-white/25" />
            <div className="mt-1.5 h-2 w-5/6 rounded-full bg-white/20" />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="relative mx-auto w-full max-w-xs" aria-hidden="true">
      <img
        src="/images/viraaz.png"
        alt=""
        className="w-full drop-shadow-[0_0_50px_rgba(139,92,246,0.5)]"
        loading="eager"
      />
    </div>
  )
}

export function HeroSlider() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef<number | null>(null)

  const go = useCallback((i: number) => {
    setIndex(((i % slides.length) + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    if (paused) return
    timer.current = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000)
    return () => {
      if (timer.current) window.clearInterval(timer.current)
    }
  }, [paused])

  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-brand-950 via-brand-900 to-ink-900 text-white sm:rounded-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="اسلایدر"
      aria-label="بنرهای ویژه"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 40%, rgba(124,58,237,0.45) 0, transparent 45%), radial-gradient(circle at 85% 15%, rgba(37,99,235,0.35) 0, transparent 40%), radial-gradient(circle at 70% 85%, rgba(251,191,36,0.12) 0, transparent 35%)',
        }}
        aria-hidden="true"
      />
      <div className="relative min-h-[320px] sm:min-h-[340px]">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`grid items-center gap-6 p-6 transition-all duration-500 sm:p-10 lg:grid-cols-2 ${
              i === index ? 'relative opacity-100' : 'pointer-events-none absolute inset-0 opacity-0'
            }`}
            aria-hidden={i !== index}
          >
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold backdrop-blur-sm">
                <s.badgeIcon className="h-3.5 w-3.5 text-amber-300" />
                {s.badge}
              </span>
              <h2 className="text-2xl font-black leading-snug sm:text-4xl sm:leading-snug">{s.title}</h2>
              <p className="mt-3 max-w-lg text-sm leading-7 text-brand-100 sm:text-base sm:leading-8">{s.desc}</p>
              <Link
                to={s.href}
                tabIndex={i === index ? 0 : -1}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-800 shadow-xl transition-transform hover:scale-105"
              >
                {s.cta}
              </Link>
            </div>
            <div className="hidden lg:block">
              <SlideArt kind={s.art} />
            </div>
          </div>
        ))}
      </div>

      {/* کنترل‌ها */}
      <button
        type="button"
        onClick={() => go(index - 1)}
        className="absolute start-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2 backdrop-blur transition-colors hover:bg-white/25"
        aria-label="اسلاید قبلی"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2 backdrop-blur transition-colors hover:bg-white/25"
        aria-label="اسلاید بعدی"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5" role="tablist" aria-label="انتخاب اسلاید">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`اسلاید ${i + 1}`}
            onClick={() => go(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </section>
  )
}
