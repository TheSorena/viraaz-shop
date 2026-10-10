import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-[90] flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lift transition-all hover:-translate-y-0.5 hover:bg-brand-700 active:scale-95"
      aria-label="بازگشت به بالای صفحه"
      title="بازگشت به بالا"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}
