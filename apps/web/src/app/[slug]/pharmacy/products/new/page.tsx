'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { getCookie } from '@/lib/cookies'
import type { Variants } from 'framer-motion'
import { ArrowLeft, Package, CheckCircle, AlertCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 22, stiffness: 280, mass: 0.8 } },
}

export default function NewProductPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const { t } = useI18n()
  const orgSlug = getCookie('sb-org-slug') || slug
  const returnTo = searchParams.get('returnTo')

  const [commercialName, setCommercialName] = useState('')
  const [activeSubstance, setActiveSubstance] = useState('')
  const [presentation, setPresentation] = useState('')
  const [laboratory, setLaboratory] = useState('')
  const [barcode, setBarcode] = useState('')
  const [unitsPerBox, setUnitsPerBox] = useState(20)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const isFormValid = commercialName.trim() && activeSubstance.trim() && presentation.trim() && laboratory.trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || saving) return

    setSaving(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/pharmacy/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          commercialName: commercialName.trim(),
          activeSubstance: activeSubstance.trim(),
          presentation: presentation.trim(),
          laboratory: laboratory.trim(),
          barcode: barcode.trim() || undefined,
          unitsPerBox,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || t('tenant.pharmacy.library.formError'))
      }

      setSuccess(true)
      setTimeout(() => {
        if (returnTo === 'restock') {
          router.push(`/${orgSlug}/pharmacy/restock`)
        } else {
          router.push(`/${orgSlug}/pharmacy/library`)
        }
      }, 1200)
    } catch (err: any) {
      setError(err.message || t('tenant.pharmacy.library.formError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer} className="min-h-screen bg-surface flex flex-col">
      <main className="flex-1 p-6 lg:p-10 max-w-2xl mx-auto w-full">
        <motion.div variants={fadeInUp} className="mb-10">
          <Link
            href={returnTo === 'restock' ? `/${orgSlug}/pharmacy/restock` : `/${orgSlug}/pharmacy/library`}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors w-fit mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{returnTo === 'restock' ? t('common.backToHome') : t('tenant.pharmacy.library.productLibrary')}</span>
          </Link>
          <h1 className="text-4xl font-extrabold text-on-surface font-display tracking-tight mb-2">
            {t('tenant.pharmacy.library.newProduct')}
          </h1>
          <p className="text-on-surface-variant">{t('tenant.pharmacy.library.newProductDescription')}</p>
        </motion.div>

        {success ? (
          <motion.div variants={fadeInUp} className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/20">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-2">{t('tenant.pharmacy.library.formSuccess')}</h2>
            <p className="text-sm text-on-surface-variant">{t('tenant.pharmacy.library.footer')}</p>
          </motion.div>
        ) : (
          <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 space-y-6">
              <div>
                <label className="text-sm font-bold text-on-surface mb-2 block">
                  {t('tenant.pharmacy.library.formCommercialName')} <span className="text-error">*</span>
                </label>
                <input
                  className="w-full h-12 px-4 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-on-surface-variant/50"
                  placeholder={t('tenant.pharmacy.library.formCommercialNamePlaceholder')}
                  value={commercialName}
                  onChange={(e) => setCommercialName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-bold text-on-surface mb-2 block">
                  {t('tenant.pharmacy.library.formActiveSubstance')} <span className="text-error">*</span>
                </label>
                <input
                  className="w-full h-12 px-4 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-on-surface-variant/50"
                  placeholder={t('tenant.pharmacy.library.formActiveSubstancePlaceholder')}
                  value={activeSubstance}
                  onChange={(e) => setActiveSubstance(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-on-surface mb-2 block">
                    {t('tenant.pharmacy.library.formPresentation')} <span className="text-error">*</span>
                  </label>
                  <input
                    className="w-full h-12 px-4 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-on-surface-variant/50"
                    placeholder={t('tenant.pharmacy.library.formPresentationPlaceholder')}
                    value={presentation}
                    onChange={(e) => setPresentation(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-on-surface mb-2 block">
                    {t('tenant.pharmacy.library.formLaboratory')} <span className="text-error">*</span>
                  </label>
                  <input
                    className="w-full h-12 px-4 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-on-surface-variant/50"
                    placeholder={t('tenant.pharmacy.library.formLaboratoryPlaceholder')}
                    value={laboratory}
                    onChange={(e) => setLaboratory(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-on-surface mb-2 block">
                  {t('tenant.pharmacy.library.formBarcode')}
                </label>
                <input
                  className="w-full h-12 px-4 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-on-surface-variant/50 font-mono"
                  placeholder={t('tenant.pharmacy.library.formBarcodePlaceholder')}
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-on-surface mb-2 block">
                  {t('tenant.pharmacy.library.unitsPerBox')} <span className="text-error">*</span>
                </label>
                <input
                  className="w-full h-12 px-4 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-on-surface-variant/50"
                  type="number"
                  min={1}
                  value={unitsPerBox}
                  onChange={(e) => setUnitsPerBox(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={!isFormValid || saving}
                className="flex-1 h-14 bg-primary text-on-primary rounded-xl font-bold text-base shadow-lg shadow-primary/10 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                    {t('tenant.pharmacy.library.formSaving')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {t('tenant.pharmacy.library.formSave')}
                  </>
                )}
              </button>
              <Link
                href={returnTo === 'restock' ? `/${orgSlug}/pharmacy/restock` : `/${orgSlug}/pharmacy/library`}
                className="h-14 px-8 bg-surface-container-high text-on-surface-variant font-bold text-sm rounded-xl flex items-center justify-center hover:bg-surface-container-highest transition-colors"
              >
                {t('common.cancel')}
              </Link>
            </div>
          </motion.form>
        )}
      </main>

      <footer className="mt-auto border-t border-outline-variant/10 px-10 py-8 text-center">
        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
          {t('tenant.pharmacy.library.footer')}
        </p>
      </footer>
    </motion.div>
  )
}
