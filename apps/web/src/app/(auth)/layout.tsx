'use client'

import Link from 'next/link'
import { Globe, Moon, Sun, ArrowLeft } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useState, useEffect } from 'react'

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('omnidoc-theme')
    if (stored === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else if (!stored) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(prefersDark)
      if (prefersDark) {
        document.documentElement.classList.add('dark')
      }
    } else {
      setIsDark(false)
    }
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    localStorage.setItem('omnidoc-theme', newIsDark ? 'dark' : 'light')
    if (newIsDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  if (!mounted) {
    return <div className="w-9 h-9" />
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-surface-container transition-colors"
      title="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-on-surface-variant" />
      ) : (
        <Moon className="w-5 h-5 text-on-surface-variant" />
      )}
    </button>
  )
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { lang, t, toggleLang } = useI18n()

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="border-b border-outline-variant bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">
                {t('auth.backToHome')}
              </span>
            </Link>

            <Link href="/" className="text-2xl font-bold tracking-tighter text-primary">
              OmniDoc
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleLang}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-container transition-colors"
                title={t('auth.language')}
              >
                <Globe className="w-4 h-4 text-on-surface-variant" />
                <span className="text-sm font-medium uppercase">{lang}</span>
              </button>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]" />
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col justify-center px-16 text-white">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              {t('auth.heroTitle')}
            </h1>
            <p className="text-xl text-white/70 max-w-md">
              {t('auth.heroSubtitle')}
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
