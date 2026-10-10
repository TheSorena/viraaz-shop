import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-50 dark:bg-brand-950">
          <FileQuestion className="h-12 w-12 text-brand-500" />
        </div>
        <h1 className="text-6xl font-black text-ink-900 dark:text-white">۴۰۴</h1>
        <h2 className="mt-3 text-xl font-bold text-ink-800 dark:text-ink-100">صفحه یافت نشد</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-ink-500 dark:text-ink-400">
          صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/" className="btn-primary">
            بازگشت به صفحه اصلی
          </Link>
          <Link to="/books" className="btn-outline">
            مشاهده فروشگاه
          </Link>
        </div>
      </div>
    </div>
  )
}
