'use client'

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react'
import { Lang, t as translate } from '@/lib/i18n/translations'

const API_URL = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') : ''

interface I18nContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
  t: (path: string) => string
  mounted: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const STORAGE_KEY = 'omnidoc-lang'

async function fetchGlobalLang(): Promise<Lang> {
  try {
    const res = await fetch(`${API_URL}/settings/global-lang`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (res.ok) {
      const data = await res.json()
      return data.lang as Lang
    }
  } catch (err) {
    console.error('Failed to fetch global lang:', err)
  }
  return 'es'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    async function initLang() {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'en' || stored === 'es') {
        setLangState(stored as Lang)
      } else {
        const globalLang = await fetchGlobalLang()
        setLangState(globalLang)
        localStorage.setItem(STORAGE_KEY, globalLang)
      }
      setMounted(true)
    }
    initLang()
  }, [])

  const setLang = useCallback((newLang: Lang) => {
    localStorage.setItem(STORAGE_KEY, newLang)
    setLangState(newLang)
    document.documentElement.lang = newLang
  }, [])

  const toggleLang = useCallback(() => {
    const newLang = lang === 'en' ? 'es' : 'en'
    setLang(newLang)
  }, [lang, setLang])

  const t = useCallback((path: string) => {
    return translate(path, lang)
  }, [lang])

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLang, t, mounted }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
