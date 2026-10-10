import type { LucideIcon } from 'lucide-react'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950">
        <Icon className="h-8 w-8 text-brand-500" />
      </div>
      <h3 className="text-lg font-bold text-ink-900 dark:text-white">{title}</h3>
      {description && <p className="max-w-sm text-sm leading-6 text-ink-500 dark:text-ink-400">{description}</p>}
      {action}
    </div>
  )
}

export function ErrorState({
  title = 'خطا در بارگذاری اطلاعات',
  description = 'لطفاً دوباره تلاش کنید.',
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950">
        <span className="text-2xl">⚠️</span>
      </div>
      <h3 className="text-lg font-bold text-ink-900 dark:text-white">{title}</h3>
      <p className="max-w-sm text-sm leading-6 text-ink-500 dark:text-ink-400">{description}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-outline mt-2">
          تلاش مجدد
        </button>
      )}
    </div>
  )
}
