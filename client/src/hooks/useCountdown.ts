import { useEffect, useState } from 'react'

/** ثانیه‌های باقی‌مانده تا پایان امروز (برای پیشنهاد شگفت‌انگیز) */
function secondsToMidnight(): number {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000))
}

export function useCountdown() {
  const [secs, setSecs] = useState(secondsToMidnight)

  useEffect(() => {
    const id = setInterval(() => setSecs(secondsToMidnight()), 1000)
    return () => clearInterval(id)
  }, [])

  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return { hours: h, minutes: m, seconds: s, total: secs }
}
