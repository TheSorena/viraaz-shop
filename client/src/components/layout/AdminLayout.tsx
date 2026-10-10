import { Outlet, Navigate } from 'react-router-dom'
import { useState, type FormEvent } from 'react'
import { ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { api } from '../../services/api'
import { Logo } from '../common/Logo'

export function AdminLayout() {
  const [authed, setAuthed] = useState(() => Boolean(sessionStorage.getItem('viraaz-admin-token')))
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post<{ token: string; expiresInHours: number }>('/api/v1/auth/login', { password })
      sessionStorage.setItem('viraaz-admin-token', res.data.token)
      setAuthed(true)
    } catch (err: any) {
      setError(err.message ?? 'خطا در ورود')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    const token = sessionStorage.getItem('viraaz-admin-token')
    if (token) {
      api.post('/api/v1/auth/logout', {}).catch(() => {})
    }
    sessionStorage.removeItem('viraaz-admin-token')
    setAuthed(false)
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50/60 px-4 dark:bg-ink-950">
        <div className="card w-full max-w-sm p-8">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950">
              <ShieldCheck className="h-7 w-7 text-brand-600 dark:text-brand-400" />
            </div>
            <Logo size={36} />
            <p className="text-sm text-ink-500 dark:text-ink-400">ورود به پنل مدیریت (حالت توسعه)</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <div>
              <label htmlFor="admin-password" className="label">رمز عبور مدیریت</label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input !pe-10"
                  placeholder="رمز عبور را وارد کنید"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                  aria-label={showPw ? 'مخفی کردن رمز' : 'نمایش رمز'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <p className="rounded-lg bg-red-50 dark:bg-red-950 px-3 py-2 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={loading || !password} className="btn-primary w-full">
              {loading ? 'در حال ورود…' : 'ورود'}
            </button>
          </form>
          <p className="mt-5 rounded-lg bg-amber-50 dark:bg-amber-950 px-3 py-2 text-xs leading-5 text-amber-800 dark:text-amber-200">
            رمز پیش‌فرض توسعه: <code className="font-mono">dev-admin-1234</code> (فقط در محیط توسعه).
            این امنیت تولیدی نیست.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-50/60 dark:bg-ink-950">
      <div className="border-b border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900">
        <div className="container-x flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={28} withText={false} />
            <span className="text-sm font-bold text-ink-900 dark:text-white">پنل مدیریت ویراژ</span>
            <span className="chip bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">حالت آزمایشی</span>
          </div>
          <button type="button" onClick={logout} className="btn-ghost !rounded-lg !px-3 !py-1.5 !text-xs">
            خروج
          </button>
        </div>
      </div>
      <div className="container-x py-6">
        <Outlet />
      </div>
    </div>
  )
}

export function RequireAdmin() {
  const token = sessionStorage.getItem('viraaz-admin-token')
  if (!token) return <Navigate to="/admin" replace />
  return <Outlet />
}
