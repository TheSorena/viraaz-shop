import { useEffect, useState, type FormEvent } from 'react'
import { Search, Plus, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react'
import { api } from '../../services/api'
import type { Article, Category } from '../../types'
import { Pagination } from '../../components/common/Pagination'
import { EmptyState } from '../../components/common/States'
import { useToast } from '../../context/ToastContext'
import { toPersianDate, toPersianDigits } from '../../utils/format'

interface ArticleForm {
  title: string
  summary: string
  categoryId: string
  author: string
  cover: string
  readMinutes: string
  publishedAt: string
  status: 'published' | 'draft'
  featured: boolean
  tags: string
  relatedBookIds: string
  content: string
}

const emptyForm: ArticleForm = {
  title: '',
  summary: '',
  categoryId: '',
  author: '',
  cover: '',
  readMinutes: '',
  publishedAt: new Date().toISOString().slice(0, 10),
  status: 'published',
  featured: false,
  tags: '',
  relatedBookIds: '',
  content: '',
}

// Parse simple markdown-ish content into structured blocks
function parseContent(text: string) {
  const lines = text.split('\n')
  const blocks: any[] = []
  let first = true
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3) })
    } else if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4) })
    } else if (line.startsWith('> ')) {
      blocks.push({ type: 'quote', text: line.slice(2) })
    } else if (line.startsWith('- ')) {
      const items = []
      let i = lines.indexOf(raw)
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().slice(2))
        i++
      }
      blocks.push({ type: 'ul', items })
    } else if (first) {
      blocks.push({ type: 'intro', text: line })
      first = false
    } else {
      blocks.push({ type: 'p', text: line })
    }
  }
  return blocks
}

export function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [books, setBooks] = useState<{ id: string; title: string }[]>([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Article | 'new' | null>(null)
  const [form, setForm] = useState<ArticleForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null)
  const [preview, setPreview] = useState(false)
  const toast = useToast()

  const load = (p = page, query = q) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: '10' })
    if (query.trim()) params.set('q', query.trim())
    api
      .get<{ data: Article[]; pagination: { page: number; totalPages: number; total: number } }>(
        `/api/v1/admin/articles?${params}`
      )
      .then((res) => {
        setArticles(res.data)
        setPagination(res.pagination)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q])

  useEffect(() => {
    api.get<Category[]>('/api/v1/categories').then(setCategories).catch(() => {})
    api.get<{ data: { id: string; title: string }[] }>('/api/v1/books?limit=100').then((res) => {
      setBooks(res.data.map((b) => ({ id: b.id, title: b.title })))
    }).catch(() => {})
  }, [])

  const openNew = () => {
    setForm(emptyForm)
    setEditing('new')
    setFormError('')
  }

  const openEdit = (article: Article) => {
    setForm({
      title: article.title,
      summary: article.summary,
      categoryId: article.categoryId,
      author: article.author,
      cover: article.cover,
      readMinutes: String(article.readMinutes),
      publishedAt: article.publishedAt.slice(0, 10),
      status: article.status,
      featured: article.featured,
      tags: article.tags.join('، '),
      relatedBookIds: article.relatedBookIds.join(', '),
      content: article.content
        .map((b) => {
          if (b.type === 'h2') return `## ${b.text}`
          if (b.type === 'h3') return `### ${b.text}`
          if (b.type === 'quote') return `> ${b.text}`
          if (b.type === 'ul') return b.items.map((i) => `- ${i}`).join('\n')
          return b.text
        })
        .join('\n\n'),
    })
    setEditing(article)
    setFormError('')
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim(),
      categoryId: form.categoryId,
      author: form.author.trim(),
      cover: form.cover.trim() || 'covers/article-001.svg',
      readMinutes: Number(form.readMinutes) || 5,
      publishedAt: new Date(form.publishedAt).toISOString(),
      status: form.status,
      featured: form.featured,
      tags: form.tags.split(/[،,]/).map((t) => t.trim()).filter(Boolean),
      relatedBookIds: form.relatedBookIds.split(',').map((s) => s.trim()).filter(Boolean),
      content: parseContent(form.content),
    }
    try {
      if (editing === 'new') {
        await api.post<Article>('/api/v1/admin/articles', payload)
        toast.success('مقاله با موفقیت اضافه شد')
      } else {
        await api.put<Article>(`/api/v1/admin/articles/${editing.id}`, payload)
        toast.success('مقاله با موفقیت ویرایش شد')
      }
      setEditing(null)
      load()
    } catch (err: any) {
      setFormError(err.message ?? 'خطا در ذخیره')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    try {
      await api.delete(`/api/v1/admin/articles/${deleteTarget.id}`)
      toast.success('مقاله حذف شد')
      setDeleteTarget(null)
      load()
    } catch (err: any) {
      toast.error(err.message ?? 'خطا در حذف')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-ink-900 dark:text-white">مدیریت مقالات</h1>
        <button type="button" onClick={openNew} className="btn-primary">
          <Plus className="h-4 w-4" />
          افزودن مقاله
        </button>
      </div>

      <div className="card flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-52 flex-1">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
            placeholder="جست‌وجو در عنوان، نویسنده…"
            className="input !py-2 !pe-9 !text-sm"
            aria-label="جست‌وجو در مقالات"
          />
          <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        </div>
        <span className="text-sm text-ink-400">{toPersianDigits(pagination.total)} مقاله</span>
      </div>

      {error && <div className="card p-4 text-sm text-red-600">خطا: {error}</div>}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <EmptyState icon={Search} title="مقاله‌ای یافت نشد" description="با تغییر عبارت جست‌وجو تلاش کنید یا مقاله جدیدی اضافه کنید." />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 dark:border-ink-800 bg-ink-50/50 text-right text-xs text-ink-400">
                    <th className="px-4 py-3 font-medium">مقاله</th>
                    <th className="px-4 py-3 font-medium">نویسنده</th>
                    <th className="px-4 py-3 font-medium">تاریخ</th>
                    <th className="px-4 py-3 font-medium">وضعیت</th>
                    <th className="px-4 py-3 font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((a) => (
                    <tr key={a.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={`/images/${a.cover}`} alt="" className="h-11 w-16 rounded-md object-cover" />
                          <div>
                            <div className="max-w-52 truncate font-medium text-ink-900 dark:text-white">{a.title}</div>
                            <div className="text-xs text-ink-400">{toPersianDigits(a.readMinutes)} دقیقه مطالعه</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{a.author}</td>
                      <td className="px-4 py-3 text-xs text-ink-500 dark:text-ink-400">{toPersianDate(a.publishedAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`chip ${a.status === 'published' ? 'bg-emerald-100 text-emerald-800 dark:text-emerald-200' : 'bg-amber-100 text-amber-800 dark:text-amber-200'}`}>
                          {a.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(a)}
                            className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                            aria-label={`ویرایش ${a.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(a)}
                            className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                            aria-label={`حذف ${a.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
        </>
      )}

      {/* Add/Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-ink-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="card my-8 w-full max-w-3xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink-900 dark:text-white">
                {editing === 'new' ? 'افزودن مقاله جدید' : `ویرایش: ${editing.title}`}
              </h2>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPreview((v) => !v)}
                  className="btn-ghost !rounded-lg !p-2"
                  aria-label="پیش‌نمایش محتوا"
                >
                  {preview ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <button type="button" onClick={() => setEditing(null)} className="btn-ghost !rounded-lg !p-2" aria-label="بستن">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {preview ? (
              <div className="prose-fa max-w-none rounded-xl bg-ink-50 dark:bg-ink-800 p-6">
                {parseContent(form.content).map((b, i) => {
                  if (b.type === 'h2') return <h2 key={i}>{b.text}</h2>
                  if (b.type === 'h3') return <h3 key={i}>{b.text}</h3>
                  if (b.type === 'quote') return <blockquote key={i}>{b.text}</blockquote>
                  if (b.type === 'ul') return <ul key={i}>{b.items.map((it: string, j: number) => <li key={j}>{it}</li>)}</ul>
                  return <p key={i}>{b.text}</p>
                })}
              </div>
            ) : (
              <form onSubmit={save} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">عنوان *</label>
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" required />
                  </div>
                  <div>
                    <label className="label">نویسنده *</label>
                    <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="input" required />
                  </div>
                  <div>
                    <label className="label">دسته‌بندی *</label>
                    <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input" required>
                      <option value="">انتخاب کنید…</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">زمان مطالعه (دقیقه)</label>
                    <input type="number" min="1" value={form.readMinutes} onChange={(e) => setForm({ ...form, readMinutes: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="label">تاریخ انتشار</label>
                    <input type="date" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="label">مسیر تصویر شاخص</label>
                    <input value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} className="input" placeholder="covers/article-001.svg" />
                  </div>
                  <div>
                    <label className="label">وضعیت</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="input">
                      <option value="published">منتشر شده</option>
                      <option value="draft">پیش‌نویس</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">شناسه کتاب‌های مرتبط (با کاما)</label>
                    <input value={form.relatedBookIds} onChange={(e) => setForm({ ...form, relatedBookIds: e.target.value })} className="input" placeholder="bk-001, bk-002" dir="ltr" />
                  </div>
                </div>

                <div>
                  <label className="label">خلاصه *</label>
                  <textarea rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className="input" required />
                </div>

                <div>
                  <label className="label">محتوا *</label>
                  <textarea
                    rows={14}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="input font-mono !text-xs leading-6"
                    placeholder={'اولین خط = مقدمه\n\n## تیتر اصلی\n\nمتن پاراگراف…\n\n> نقل‌قول\n\n- آیتم ۱\n- آیتم ۲'}
                    required
                  />
                  <p className="mt-1 text-[10px] leading-4 text-ink-400">
                    قالب ساده: اولین پاراگراف «مقدمه»، <code>## تیتر</code>، <code>&gt; نقل‌قول</code>، <code>- آیتم</code> برای فهرست.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">برچسب‌ها (با ، جدا شوند)</label>
                    <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input" placeholder="تاریخ، علم" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-700 dark:text-ink-300">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                        className="h-4 w-4 rounded border-ink-300 dark:border-ink-600 text-brand-600 dark:text-brand-400 accent-brand-600"
                      />
                      مقاله منتخب
                    </label>
                  </div>
                </div>

                {formError && (
                  <p className="rounded-lg bg-red-50 dark:bg-red-950 px-3 py-2 text-sm text-red-700" role="alert">{formError}</p>
                )}

                <div className="flex justify-end gap-2 border-t border-ink-100 dark:border-ink-800 pt-4">
                  <button type="button" onClick={() => setEditing(null)} className="btn-ghost">انصراف</button>
                  <button type="submit" disabled={saving} className="btn-primary">
                    {saving ? 'در حال ذخیره…' : 'ذخیره'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true">
          <div className="card w-full max-w-sm p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950">
              <Trash2 className="h-7 w-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-ink-900 dark:text-white">حذف مقاله</h3>
            <p className="mt-2 text-sm leading-6 text-ink-500 dark:text-ink-400">
              آیا از حذف «{deleteTarget.title}» مطمئن هستید؟ این عمل قابل بازگشت نیست.
            </p>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="btn-outline flex-1">انصراف</button>
              <button type="button" onClick={confirmDelete} disabled={saving} className="flex-1 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50">
                {saving ? 'در حال حذف…' : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
