import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Resolve data dir: default to <project-root>/src/data (works for both src and dist runs)
const projectRoot = path.resolve(__dirname, '..', '..')
export const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(projectRoot, 'src', 'data')

export function readJsonFile<T>(fileName: string): T {
  // Serverless fallback: prefer in-memory state written earlier in this instance
  if (memFallback.has(fileName)) return memFallback.get(fileName) as T
  const filePath = path.join(DATA_DIR, fileName)
  let raw: string
  try {
    raw = fs.readFileSync(filePath, 'utf-8')
  } catch (err: any) {
    throw new Error(`فایل داده‌ی ${fileName} یافت نشد: ${err.message}`)
  }
  try {
    return JSON.parse(raw) as T
  } catch (err: any) {
    throw new Error(`فایل داده‌ی ${fileName} خراب است و قابل خواندن نیست: ${err.message}`)
  }
}

// In-memory fallback for read-only filesystems (e.g. Vercel serverless):
// writes are kept for the lifetime of the warm instance instead of failing.
const memFallback = new Map<string, unknown>()

// Simple write queue to serialize concurrent writes per file
const writeQueues = new Map<string, Promise<void>>()

export function writeJsonFile(fileName: string, data: unknown): Promise<void> {
  const filePath = path.join(DATA_DIR, fileName)
  const job = async () => {
    const tmpPath = `${filePath}.tmp`
    const payload = JSON.stringify(data, null, 2)
    // Atomic write: write to temp file then rename
    try {
      await fs.promises.writeFile(tmpPath, payload, 'utf-8')
      await fs.promises.rename(tmpPath, filePath)
      memFallback.delete(fileName)
    } catch (err: any) {
      // Read-only filesystem (serverless): keep in memory for this instance
      memFallback.set(fileName, data)
      console.warn(`[data] filesystem is read-only, using in-memory fallback for ${fileName}: ${err?.message ?? err}`)
    }
  }
  const prev = writeQueues.get(fileName) ?? Promise.resolve()
  const next = prev.then(job, job)
  writeQueues.set(fileName, next)
  return next
}

export function normalizePersian(text: string): string {
  return text
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim()
}

export function toPersianDigits(input: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(input).replace(/[0-9]/g, (d) => persianDigits[Number(d)])
}

export function formatPrice(value: number): string {
  return toPersianDigits(value.toLocaleString('en-US'))
}

export function formatPriceWithCurrency(value: number, currency: string): string {
  return `${formatPrice(value)} ${currency}`
}

export function toPersianDate(iso: string): string {
  try {
    const date = new Date(iso)
    const jd = toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate())
    return `${toPersianDigits(jd[0])}/${toPersianDigits(String(jd[1]).padStart(2, '0'))}/${toPersianDigits(String(jd[2]).padStart(2, '0'))}`
  } catch {
    return iso
  }
}

// Gregorian to Jalali conversion (standard algorithm)
function toJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  let gy2 = gy
  if (gm > 2) gy2 += 1
  let days = 355666 + 365 * gy2 + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1]
  let jy = -1595 + 33 * Math.floor(days / 12053)
  days %= 12053
  jy += 4 * Math.floor(days / 1461)
  days %= 1461
  if (days > 365) {
    jy += Math.floor((days - 1) / 365)
    days = (days - 1) % 365
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30)
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30)
  return [jy, jm, jd]
}

export function slugify(text: string): string {
  return normalizePersian(text)
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
}

export function generateId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8)
  const time = Date.now().toString(36).slice(-4)
  return `${prefix}-${rand}${time}`
}

export function generateOrderNumber(seq: number): string {
  return `VZ-${String(100000 + seq).slice(0, 7)}`
}

export function param(value: string | string[] | undefined, fallback = ''): string {
  if (Array.isArray(value)) return value[0] ?? fallback
  return value ?? fallback
}
