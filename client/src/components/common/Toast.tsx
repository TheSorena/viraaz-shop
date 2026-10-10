import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const colors = {
  success: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200',
  error: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 text-red-800',
  info: 'border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950 text-brand-800 dark:text-brand-200',
}

export function ToastContainer() {
  const { toasts, dismiss } = useToast()
  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.type]
        return (
          <div
            key={toast.id}
            className={`toast-enter pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lift ${colors[toast.type]}`}
            role="alert"
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="flex-1 text-sm font-medium leading-6">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded p-0.5 hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="بستن اعلان"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
