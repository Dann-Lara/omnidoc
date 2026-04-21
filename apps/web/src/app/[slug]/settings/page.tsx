'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { Globe, CheckCircle, AlertCircle, Loader2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function TenantSettingsPage() {
  const { slug } = useParams()
  const router = useRouter()
  const { lang, t, setLang } = useI18n()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [currentLang, setCurrentLang] = useState<'en' | 'es'>('es')

  useEffect(() => {
    fetchOrgLang()
  }, [])

  const fetchOrgLang = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/settings/org-lang/${slug}`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setCurrentLang(data.lang)
      }
    } catch (err) {
      console.error('Error fetching org lang:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (newLang: 'en' | 'es') => {
    setIsSaving(true)
    setError('')
    setSaved(false)

    try {
      const res = await fetch(`${API_URL}/settings/org-lang/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ lang: newLang }),
      })

      if (res.ok) {
        const data = await res.json()
        setCurrentLang(data.lang)
        if (newLang !== lang) {
          setLang(newLang)
          localStorage.setItem('omnidoc-lang', newLang)
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        const data = await res.json()
        setError(data.message || 'Error saving')
      }
    } catch (err) {
      setError('Error saving language')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-24"
    >
      <div className="flex items-center gap-4">
        <Link
          href={`/${slug}/dashboard`}
          className="p-2 rounded-lg hover:bg-surface-container transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="label-sm text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
            {t('tenant.nav.settings')}
          </span>
          <h1 className="text-4xl font-extrabold text-primary tracking-tighter">
            {t('admin.settings.title') || 'Settings'}
          </h1>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-xl p-6 max-w-xl">
        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          {t('admin.settings.language') || 'Organization Language'}
        </h2>
        
        <p className="text-on-surface-variant mb-6">
          {t('admin.settings.languageDesc') || 'Set the default language for this organization. This will affect all emails sent from this tenant.'}
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => handleSave('es')}
            disabled={isSaving || currentLang === 'es'}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              currentLang === 'es'
                ? 'bg-primary text-white'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            } disabled:opacity-50`}
          >
            {currentLang === 'es' && <CheckCircle className="w-4 h-4" />}
            Español
          </button>
          
          <button
            onClick={() => handleSave('en')}
            disabled={isSaving || currentLang === 'en'}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              currentLang === 'en'
                ? 'bg-primary text-white'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            } disabled:opacity-50`}
          >
            {currentLang === 'en' && <CheckCircle className="w-4 h-4" />}
            English
          </button>
        </div>

        {saved && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-700">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">{t('common.saved') || 'Saved!'}</span>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}