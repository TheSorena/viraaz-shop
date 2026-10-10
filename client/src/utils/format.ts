const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)])
}

export function formatPrice(value: number): string {
  return toPersianDigits(value.toLocaleString('en-US'))
}

export function formatPriceWithCurrency(value: number, currency = 'تومان'): string {
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

export function discountPercent(price: number, discountPrice: number | null): number | null {
  if (!discountPrice || discountPrice >= price) return null
  return Math.round(((price - discountPrice) / price) * 100)
}

export function effectivePrice(price: number, discountPrice: number | null): number {
  return discountPrice && discountPrice < price ? discountPrice : price
}
