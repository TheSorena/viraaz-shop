import { Link } from 'react-router-dom'
import { BookOpen, Truck, ShieldCheck, Headset } from 'lucide-react'
import { Breadcrumb } from '../components/common/Breadcrumb'

export function AboutPage() {
  return (
    <div className="container-x py-8">
      <Breadcrumb items={[{ label: 'خانه', href: '/' }, { label: 'درباره ما' }]} />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="card overflow-hidden">
            <div className="relative bg-ink-950 p-8 text-white sm:p-10">
              <img
                src="/images/viraaz.png"
                alt="لوگوی ویراژ"
                className="absolute end-6 top-6 h-14 w-auto drop-shadow-[0_0_18px_rgba(139,92,246,0.5)]"
                loading="lazy"
              />
              <h1 className="text-2xl font-black sm:text-3xl">درباره ویراژ</h1>
              <p className="mt-2 text-sm text-white/70">فروشگاه آنلاین کتاب و مجله — تاریخ، علم، فناوری، فلسفه و دانش عمومی</p>
            </div>
            <div className="prose-fa p-6 sm:p-8">
              <p>
                ویراژ یک فروشگاه آنلاین کتاب و مجله است که با وسواس، بهترین عنوان‌ها را در حوزه‌های
                تاریخ ایران و جهان، تمدن‌های باستان، علم و فناوری، فضا و نجوم، فلسفه و فرهنگ عمومی
                گلچین می‌کند. هدف ما این است که خرید کتاب، ساده، سریع و لذت‌بخش باشد.
              </p>
              <h2>چرا ویراژ؟</h2>
              <ul>
                <li>گلچین تخصصی کتاب‌ها با توضیحات دقیق و شفاف</li>
                <li>قیمت‌گذاری شفاف، تخفیف‌های واقعی و ارسال سریع به سراسر کشور</li>
                <li>مجله ویراژ با مقالات کوتاه و خواندنی برای مطالعه روزانه</li>
                <li>پشتیبانی پاسخ‌گو در ساعت کاری</li>
              </ul>
              <h2>سفارش آزمایشی</h2>
              <p>
                این نسخه نمایشی است؛ سفارش‌ها صرفاً برای تست جریان خرید ثبت می‌شوند و هیچ پولی
                دریافت نمی‌شود. برای مدیریت فروشگاه به بخش <Link to="/admin">پنل مدیریت</Link> بروید.
              </p>
            </div>
          </div>
        </div>
        <aside className="space-y-4">
          {[
            { icon: Truck, title: 'ارسال سریع', desc: 'ارسال به سراسر کشور با پست و پیک. ارسال رایگان برای خریدهای بالای سقف مشخص.' },
            { icon: ShieldCheck, title: 'ضمانت اصالت', desc: 'تمامی کتاب‌ها اصل و دارای شابک معتبر هستند.' },
            { icon: Headset, title: 'پشتیبانی', desc: 'پاسخ‌گویی در ساعت کاری از طریق ایمیل و تلفن.' },
            { icon: BookOpen, title: 'مجله ویراژ', desc: 'مقالات منتخب تاریخی و علمی، هر روز یک مطلب تازه.' },
          ].map((f) => (
            <div key={f.title} className="card flex items-start gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                <f.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-ink-900 dark:text-white">{f.title}</h3>
                <p className="mt-1 text-sm leading-6 text-ink-500 dark:text-ink-400">{f.desc}</p>
              </div>
            </div>
          ))}
          <Link to="/books" className="btn-primary w-full">
            مشاهده فروشگاه
          </Link>
        </aside>
      </div>
    </div>
  )
}
