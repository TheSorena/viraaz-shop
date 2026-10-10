import { useEffect, useState, type FormEvent } from 'react'
import { Search, Plus, Pencil, Trash2, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react'
import { api } from '../../services/api'
import type { Book, Category } from '../../types'
import { Pagination } from '../../components/common/Pagination'
import { EmptyState } from '../../components/common/States'
import { useToast } from '../../context/ToastContext'
import { formatPrice, toPersianDigits } from '../../utils/format'

const emptyForm = {
  title: '',
  author: '',
  translator: '',
  publisher: '',
  categoryId: '',
  shortDescription: '',
  fullDescription: '',
  cover: '',
  price: '',
  discountPrice: '',
  pages: '',
  year: '',
  binding: 'جلت نرم',
  stock: '',
  isbn: '',
  featured: false,
  isNew: false,
  tags: '',
}

type FormState = typeof emptyForm

export function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Book | 'new' | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null)
  const toast = useToast()

  const load = (p = page, query = q) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: '10' })
    if (query.trim()) params.set('q', query.trim())
    api
      .get<{ data: Book[]; pagination: { page: number; totalPages: number; total: number } }>(
        `/api/v1/admin/books?${params}`
      )
      .then((res) => {
        setBooks(res.data)
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
  }, [])

  const openNew = () => {
    setForm(emptyForm)
    setEditing('new')
    setFormError('')
  }

  const openEdit = (book: Book) => {
    setForm({
      title: book.title,
      author: book.author,
      translator: book.translator ?? '',
      publisher: book.publisher,
      categoryId: book.categoryId,
      shortDescription: book.shortDescription,
      fullDescription: book.fullDescription,
      cover: book.cover,
      price: String(book.price),
      discountPrice: book.discountPrice ? String(book.discountPrice) : '',
      pages: String(book.pages),
      year: String(book.year),
      binding: book.binding,
      stock: String(book.stock),
      isbn: book.isbn,
      featured: book.featured,
      isNew: book.isNew,
      tags: book.tags.join('، '),
    })
    setEditing(book)
    setFormError('')
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      translator: form.translator.trim() || null,
      publisher: form.publisher.trim(),
      categoryId: form.categoryId,
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription.trim(),
      cover: form.cover.trim() || 'covers/book-001.svg',
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      pages: Number(form.pages),
      year: Number(form.year),
      binding: form.binding,
      stock: Number(form.stock),
      rating: editing !== 'new' ? editing.rating : 4.0,
      salesCount: editing !== 'new' ? editing.salesCount : 0,
      isbn: form.isbn.trim(),
      featured: form.featured,
      isNew: form.isNew,
      tags: form.tags.split(/[،,]/).map((t) => t.trim()).filter(Boolean),
    }
    try {
      if (editing === 'new') {
        await api.post<Book>('/api/v1/admin/books', payload)
        toast.success('کتاب با موفقیت اضافه شد')
      } else {
        await api.put<Book>(`/api/v1/admin/books/${editing.id}`, payload)
        toast.success('کتاب با موفقیت ویرایش شد')
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
      await api.delete(`/api/v1/admin/books/${deleteTarget.id}`)
      toast.success('کتاب حذف شد')
      setDeleteTarget(null)
      load()
    } catch (err: any) {
      toast.error(err.message ?? 'خطا در حذف')
    } finally {
      setSaving(false)
    }
  }

  const input = (hasError?: boolean) => `input ${hasError ? '!border-red-400' : ''}`

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-ink-900 dark:text-white">مدیریت کتاب‌ها</h1>
        <button type="button" onClick={openNew} className="btn-primary">
          <Plus className="h-4 w-4" />
          افزودن کتاب
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
            placeholder="جست‌وجو در عنوان، نویسنده، ناشر…"
            className="input !py-2 !pe-9 !text-sm"
            aria-label="جست‌وجو در کتاب‌ها"
          />
          <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        </div>
        <span className="text-sm text-ink-400">
          {toPersianDigits(pagination.total)} کتاب
        </span>
      </div>

      {error && <div className="card p-4 text-sm text-red-600">خطا: {error}</div>}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <EmptyState icon={Search} title="کتابی یافت نشد" description="با تغییر عبارت جست‌وجو تلاش کنید یا کتاب جدیدی اضافه کنید." />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 dark:border-ink-800 bg-ink-50/50 text-right text-xs text-ink-400">
                    <th className="px-4 py-3 font-medium">کتاب</th>
                    <th className="px-4 py-3 font-medium">نویسنده</th>
                    <th className="px-4 py-3 font-medium">قیمت</th>
                    <th className="px-4 py-3 font-medium">موجودی</th>
                    <th className="px-4 py-3 font-medium">فروش</th>
                    <th className="px-4 py-3 font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => (
                    <tr key={b.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={`/images/${b.cover}`} alt="" className="h-11 w-8 rounded-md object-cover" />
                          <div>
                            <div className="max-w-52 truncate font-medium text-ink-900 dark:text-white">{b.title}</div>
                            <div className="text-xs text-ink-400">{b.publisher}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{b.author}</td>
                      <td className="fa-num px-4 py-3">
                        {b.discountPrice ? (
                          <span>
                            <span className="text-xs text-ink-400 line-through">{formatPrice(b.price)}</span>{' '}
                            <span className="font-semibold text-brand-700 dark:text-brand-300">{formatPrice(b.discountPrice)}</span>
                          </span>
                        ) : (
                          formatPrice(b.price)
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`fa-num ${b.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {toPersianDigits(b.stock)}
                        </span>
                      </td>
                      <td className="fa-num px-4 py-3 text-ink-600 dark:text-ink-300">{toPersianDigits(b.salesCount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(b)}
                            className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                            aria-label={`ویرایش ${b.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(b)}
                            className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                            aria-label={`حذف ${b.title}`}
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
          <div className="card my-8 w-full max-w-2xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink-900 dark:text-white">
                {editing === 'new' ? 'افزودن کتاب جدید' : `ویرایش: ${editing.title}`}
              </h2>
              <button type="button" onClick={() => setEditing(null)} className="btn-ghost !rounded-lg !p-2" aria-label="بستن">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">عنوان *</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={input()} required />
                </div>
                <div>
                  <label className="label">نویسنده *</label>
                  <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className={input()} required />
                </div>
                <div>
                  <label className="label">مترجم</label>
                  <input value={form.translator} onChange={(e) => setForm({ ...form, translator: e.target.value })} className={input()} />
                </div>
                <div>
                  <label className="label">ناشر *</label>
                  <input value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} className={input()} required />
                </div>
                <div>
                  <label className="label">دسته‌بندی *</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={input()} required>
                    <option value="">انتخاب کنید…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">مسیر تصویر جلد</label>
                  <div className="relative">
                    <input value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} className={input() + ' !pe-9'} placeholder="covers/book-001.svg" />
                    <ImageIcon className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  </div>
                  <p className="mt-1 text-[10px] text-ink-400">فایل‌های SVG جلد در /client/public/images/covers/ قرار دارند.</p>
                </div>
                <div>
                  <label className="label">قیمت (تومان) *</label>
                  <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={input()} required />
                </div>
                <div>
                  <label className="label">قیمت تخفیف‌خورده</label>
                  <input type="number" min="0" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} className={input()} placeholder="اختیاری" />
                </div>
                <div>
                  <label className="label">تعداد صفحات</label>
                  <input type="number" min="1" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} className={input()} />
                </div>
                <div>
                  <label className="label">سال انتشار</label>
                  <input type="number" min="1000" max="2100" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={input()} />
                </div>
                <div>
                  <label className="label">نوع جلد</label>
                  <select value={form.binding} onChange={(e) => setForm({ ...form, binding: e.target.value })} className={input()}>
                    <option>جلت نرم</option>
                    <option>جلت سخت</option>
                    <option>جیبی</option>
                  </select>
                </div>
                <div>
                  <label className="label">موجودی *</label>
                  <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={input()} required />
                </div>
                <div>
                  <label className="label">شابک</label>
                  <input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} className={input()} dir="ltr" />
                </div>
                <div>
                  <label className="label">برچسب‌ها (با ، جدا شوند)</label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={input()} placeholder="تاریخ، علم" />
                </div>
              </div>

              <div>
                <label className="label">توضیحات کوتاه *</label>
                <textarea rows={2} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className={input()} required />
              </div>
              <div>
                <label className="label">توضیحات کامل *</label>
                <textarea rows={5} value={form.fullDescription} onChange={(e) => setForm({ ...form, fullDescription: e.target.value })} className={input()} required />
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-700 dark:text-ink-300">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="h-4 w-4 rounded border-ink-300 dark:border-ink-600 text-brand-600 dark:text-brand-400 accent-brand-600"
                  />
                  کتاب برگزیده
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-700 dark:text-ink-300">
                  <input
                    type="checkbox"
                    checked={form.isNew}
                    onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
                    className="h-4 w-4 rounded border-ink-300 dark:border-ink-600 text-brand-600 dark:text-brand-400 accent-brand-600"
                  />
                  کتاب جدید
                </label>
              </div>

              {formError && (
                <p className="rounded-lg bg-red-50 dark:bg-red-950 px-3 py-2 text-sm text-red-700" role="alert">{formError}</p>
              )}

              <div className="flex justify-end gap-2 border-t border-ink-100 dark:border-ink-800 pt-4">
                <button type="button" onClick={() => setEditing(null)} className="btn-ghost">انصراف</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'در حال ذخیره…' : <><CheckCircle2 className="h-4 w-4" /> ذخیره</>}
                </button>
              </div>
            </form>
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
            <h3 className="text-lg font-bold text-ink-900 dark:text-white">حذف کتاب</h3>
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
