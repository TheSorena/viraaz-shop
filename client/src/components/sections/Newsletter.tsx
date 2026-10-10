import { useState, type FormEvent } from 'react'
import { Mail, Send, Info, Bell } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('لطفاً یک ایمیل معتبر وارد کنید')
      return
    }
    setLoading(true)
    // Demo: no real email service. Simulate success.
    setTimeout(() => {
      setLoading(false)
      setEmail('')
      toast.success('ثبت‌نام نمایشی انجام شد (ارسال ایمیل در این نسخه فعال نیست)')
    }, 800)
  }

  return (
    <section className="card relative overflow-hidden border-0 bg-gradient-to-l from-brand-600 via-brand-700 to-ink-900 p-6 text-white sm:p-10">
      <div className="absolute -end-12 -top-12 h-48 w-48 rounded-full bg-white/10" aria-hidden="true" />
      <div className="absolute -bottom-16 -start-8 h-40 w-40 rounded-full bg-accent-400/20" aria-hidden="true" />
      <div className="relative max-w-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Bell className="h-6 w-6 text-accent-300" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold sm:text-2xl">خبرنامه ویراژ</h2>
            <p className="mt-0.5 text-xs text-brand-200">از انتشار کتاب‌ها و مقالات جدید باخبر شوید</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-white/85">
          این خبرنامه در نسخه نمایشی، صرفاً یک فرم آزمایشی است و ایمیلی واقعی
          ارسال نمی‌شود.
        </p>
        <form onSubmit={submit} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Mail className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="آدرس ایمیل شما"
              className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pe-4 ps-11 text-sm text-white placeholder:text-white/50 backdrop-blur focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              aria-label="آدرس ایمیل"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-800 transition-transform hover:scale-105 disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {loading ? 'در حال ثبت…' : 'عضویت'}
          </button>
        </form>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-white/60">
          <Info className="h-3.5 w-3.5" />
          آزمایشی: اطلاعات ایمیل ذخیره نمی‌شود و هیچ پیامی ارسال نمی‌گردد.
        </p>
      </div>
    </section>
  )
}
