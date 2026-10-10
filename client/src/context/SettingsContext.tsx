import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { SiteSettings } from '../types'
import { settingsService } from '../services'

const defaultSettings: SiteSettings = {
  siteName: 'ویراژ',
  siteNameEn: 'Viraaz',
  tagline: 'کتاب، تاریخ، علم و دانش عمومی',
  description: '',
  baseUrl: '',
  currency: 'تومان',
  currencyCode: 'IRR',
  freeShippingThreshold: 500000,
  shippingFee: 45000,
  taxRate: 0,
  social: {},
  contact: { email: '', phone: '', address: '' },
  demoNotice: '',
}

interface SettingsContextValue {
  settings: SiteSettings
  loading: boolean
}

const SettingsContext = createContext<SettingsContextValue>({ settings: defaultSettings, loading: true })

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    settingsService
      .get()
      .then((data) => {
        if (!cancelled) setSettings(data)
      })
      .catch(() => {
        // keep defaults
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext)
}
