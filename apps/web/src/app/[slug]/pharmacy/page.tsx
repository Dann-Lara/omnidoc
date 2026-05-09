'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { getCookie } from '@/lib/cookies'
import type { Variants } from 'framer-motion'
import {
  TrendingUp,
  AlertTriangle,
  Package,
  Truck,
  Filter,
  Download,
  BarChart3,
  ShieldCheck,
  Zap
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', damping: 22, stiffness: 280, mass: 0.8 }
  }
}

const cardHover = { scale: 1.01, transition: { type: 'spring', damping: 20, stiffness: 300 } }

interface DashboardSummary {
  totalValue: number
  totalValueChange: number
  expiryRisks90d: number
  securityStockAlert: number
  procurementPending: number
  procurementEta: string
}

interface ExpiringBatch {
  id: string
  productName: string
  batchNumber: string
  quantity: number
  expiryDate: string
  riskLevel: 'critical' | 'moderate' | 'stable'
  daysUntilExpiry: number
}

interface SecurityStockItem {
  productId: string
  commercialName: string
  activeSubstance: string
  currentStock: number
  securityStock: number
  isBelowThreshold: boolean
  deficit: number
}

interface ProcurementItem {
  product: {
    id: string
    commercialName: string
    activeSubstance: string
    presentation: string
    laboratory: string
  }
  batchNumber: string
  quantity: number
  expiryDate: string
  daysUntilExpiry: number
}

export default function PharmacyDashboardPage() {
  const params = useParams()
  const slug = params.slug as string
  const { t } = useI18n()
  const orgSlug = getCookie('sb-org-slug') || slug

  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [expiringBatches, setExpiringBatches] = useState<ExpiringBatch[]>([])
  const [securityStockItems, setSecurityStockItems] = useState<SecurityStockItem[]>([])
  const [procurementItems, setProcurementItems] = useState<ProcurementItem[]>([])
  const [orgCurrency, setOrgCurrency] = useState('USD')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes, expiringRes, securityRes, procurementRes, currencyRes] = await Promise.all([
          fetch(`${API_URL}/pharmacy/dashboard/summary`, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }),
          fetch(`${API_URL}/pharmacy/batches/expiring?days=90`, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }),
          fetch(`${API_URL}/pharmacy/dashboard/security-stock-list`, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }),
          fetch(`${API_URL}/pharmacy/dashboard/procurement`, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }),
          fetch(`${API_URL}/settings/org-currency/${orgSlug}`, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }),
        ])
        
        if (currencyRes.ok) {
          const data = await currencyRes.json()
          setOrgCurrency(data.currency || 'USD')
        }

        if (summaryRes.ok) {
          const data = await summaryRes.json()
          setSummary(data)
        }

        if (expiringRes.ok) {
          const data = await expiringRes.json()
          setExpiringBatches(data.slice(0, 5))
        }

        if (securityRes.ok) {
          const data = await securityRes.json()
          setSecurityStockItems(data)
        }

        if (procurementRes.ok) {
          const data = await procurementRes.json()
          setProcurementItems(data)
        }
      } catch (error) {
        console.error('Error fetching pharmacy data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (orgSlug) {
      fetchData()
    }
  }, [orgSlug])

  const formatCurrency = (value: number) => {
    const locale = orgCurrency === 'MXN' ? 'es-MX' : orgCurrency === 'EUR' ? 'de-DE' : 'en-US'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: orgCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const riskLevelBadge: Record<string, { class: string; label: string }> = {
    critical: { class: 'bg-error-container text-on-error-container', label: 'CRITICAL' },
    moderate: { class: 'bg-secondary-container text-on-secondary-container', label: 'MODERATE' },
    stable: { class: 'bg-surface-container-highest text-on-surface-variant', label: 'STABLE' },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      variants={staggerContainer}
      className="flex flex-col min-h-screen bg-surface"
    >
      <main className="flex-1 p-6 lg:p-10 space-y-8">
        <motion.div variants={fadeInUp} className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-4">
          <div className="max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-surface-container-high px-3 py-1.5 rounded text-on-surface-variant">
              {t('tenant.pharmacy.dashboard.status')}: {t('tenant.pharmacy.dashboard.active')}
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mt-4 font-display">
              {t('tenant.pharmacy.dashboard.title')}
            </h1>
            <p className="text-on-surface-variant text-lg mt-2">
              {t('tenant.pharmacy.dashboard.subtitle')}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/${orgSlug}/pharmacy/dispensing`}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-lg hover:opacity-90 transition-opacity"
            >
              <Download className="w-4 h-4" />
              {t('tenant.nav.dispensingNav')}
            </Link>
            <Link 
              href={`/${orgSlug}/pharmacy/inventory`}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-surface-container-highest text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <Filter className="w-4 h-4" />
              {t('tenant.pharmacy.dashboard.viewAll')}
            </Link>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div layout whileHover={cardHover} className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-primary shadow-sm flex flex-col justify-between h-40">
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">{t('tenant.pharmacy.dashboard.totalValue')}</p>
              <h3 className="text-3xl font-extrabold text-on-surface mt-1">{summary ? formatCurrency(summary.totalValue) : '—'}</h3>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">{summary?.totalValueChange ?? 0}% {t('tenant.pharmacy.dashboard.vsLastMonth')}</span>
            </div>
          </motion.div>

          <motion.div layout whileHover={cardHover} className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-error shadow-sm flex flex-col justify-between h-40">
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">{t('tenant.pharmacy.dashboard.expiryRisks')}</p>
              <h3 className="text-3xl font-extrabold text-on-surface mt-1">{summary?.expiryRisks90d ?? 0} {t('tenant.pharmacy.dashboard.items')}</h3>
            </div>
            <div className="flex items-center gap-2 text-error">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{t('tenant.pharmacy.dashboard.criticalFocus')}</span>
            </div>
          </motion.div>

          <motion.div layout whileHover={cardHover} className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-secondary shadow-sm flex flex-col justify-between h-40">
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">{t('tenant.pharmacy.dashboard.securityStock')}</p>
              <h3 className="text-3xl font-extrabold text-on-surface mt-1">{summary?.securityStockAlert ?? 0} SKU</h3>
            </div>
            <div className="flex items-center gap-2 text-on-secondary-container">
              <Package className="w-4 h-4" />
              <span className="text-sm font-medium">{t('tenant.pharmacy.dashboard.belowThreshold')}</span>
            </div>
          </motion.div>

          <motion.div layout whileHover={cardHover} className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-tertiary shadow-sm flex flex-col justify-between h-40">
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">{t('tenant.pharmacy.dashboard.procurement')}</p>
              <h3 className="text-3xl font-extrabold text-on-surface mt-1">{summary?.procurementPending ?? 0} {t('tenant.pharmacy.dashboard.active')}</h3>
            </div>
            <div className="flex items-center gap-2 text-tertiary">
              <Truck className="w-4 h-4" />
              <span className="text-sm font-medium">{t('tenant.pharmacy.dashboard.eta')}: {summary?.procurementEta ?? '—'}</span>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-8">
            <div className="bg-surface-container-low rounded-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-2xl font-bold">{t('tenant.pharmacy.dashboard.expiringBatches')}</h2>
                <span className="text-sm text-on-surface-variant underline cursor-pointer hover:text-primary transition-colors">{t('tenant.pharmacy.dashboard.viewAll')}</span>
              </div>
              <div className="overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant text-[10px] uppercase tracking-widest">
                      <th className="py-4 px-6 font-semibold">{t('tenant.pharmacy.dashboard.medication')}</th>
                      <th className="py-4 px-6 font-semibold">{t('tenant.pharmacy.dashboard.unitCount')}</th>
                      <th className="py-4 px-6 font-semibold">{t('tenant.pharmacy.dashboard.expiryDate')}</th>
                      <th className="py-4 px-6 font-semibold">{t('tenant.pharmacy.dashboard.riskLevel')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {expiringBatches.length > 0 ? expiringBatches.map((batch) => {
                      const badge = riskLevelBadge[batch.riskLevel] ?? riskLevelBadge.stable
                      return (
                        <motion.tr
                          key={batch.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                          className="group hover:bg-surface-container transition-colors"
                        >
                          <td className="py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-on-surface">{batch.productName}</span>
                              <span className="text-xs text-on-surface-variant">{batch.batchNumber}</span>
                            </div>
                          </td>
                          <td className="py-5 text-sm font-medium">{batch.quantity.toLocaleString()} units</td>
                          <td className="py-5 text-sm">{batch.expiryDate}</td>
                          <td className="py-5">
                            <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${badge.class}`}>
                              {badge.label} ({batch.daysUntilExpiry}d)
                            </span>
                          </td>
                        </motion.tr>
                      )
                    }                      ) : (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-on-surface-variant text-sm">
                            {t('tenant.pharmacy.dashboard.noExpiringBatches')}
                          </td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <motion.div variants={fadeInUp} className="bg-surface-container-low rounded-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-2xl font-bold">{t('tenant.pharmacy.dashboard.securityStockVariance')}</h2>
                <span className="text-xs text-on-surface-variant font-medium">
                  {securityStockItems.filter(i => i.isBelowThreshold).length} {t('tenant.pharmacy.inventory.criticalExpiry')}
                </span>
              </div>
              <div className="space-y-5">
                {(securityStockItems.length > 0 ? securityStockItems : []).slice(0, 6).map(item => (
                  <div key={item.productId}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-bold text-on-surface">{item.commercialName}</span>
                      <span className="text-xs font-medium text-on-surface-variant">
                        {item.currentStock} / {item.securityStock} {t('clinicalNotes.form.units')}
                      </span>
                    </div>
                    <div className="h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          item.isBelowThreshold ? 'bg-error' : 'bg-tertiary'
                        }`}
                        style={{ width: `${Math.min(100, (item.currentStock / Math.max(item.securityStock, 1)) * 100)}%` }}
                      />
                    </div>
                    {item.isBelowThreshold && (
                      <p className="text-[10px] text-error font-bold mt-1">
                        {t('tenant.pharmacy.dashboard.belowThreshold')}: {item.deficit} {t('clinicalNotes.form.units')}
                      </p>
                    )}
                  </div>
                ))}
                {securityStockItems.length === 0 && (
                  <p className="text-center text-sm text-on-surface-variant py-8">{t('tenant.pharmacy.dashboard.noExpiringBatches')}</p>
                )}
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-surface-container-low rounded-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-2xl font-bold">{t('tenant.pharmacy.dashboard.procurement')}</h2>
                <span className="text-xs text-on-surface-variant font-medium">
                  {procurementItems.length} {t('tenant.pharmacy.dashboard.items')}
                </span>
              </div>
              {procurementItems.length > 0 ? (
                <div className="space-y-4">
                  {procurementItems.map((item, idx) => (
                    <div key={`${item.product?.id}-${idx}`} className="flex items-center justify-between p-4 bg-surface-container-high rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-on-surface">{item.product?.commercialName}</p>
                        <p className="text-xs text-on-surface-variant">{item.batchNumber} • {item.quantity} {t('clinicalNotes.form.units')}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.daysUntilExpiry <= 0
                            ? 'bg-error-container text-on-error-container'
                            : item.daysUntilExpiry <= 3
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-surface-container-highest text-on-surface-variant'
                        }`}>
                          {item.daysUntilExpiry <= 0 ? 'EXPIRED' : `${item.daysUntilExpiry}d`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-on-surface-variant py-8">{t('tenant.pharmacy.dashboard.noExpiringBatches')}</p>
              )}
            </motion.div>
          </motion.div>

          <motion.div variants={fadeInUp} className="space-y-8">
            <div className="bg-primary text-on-primary rounded-xl overflow-hidden shadow-xl">
              <div className="p-8">
                <h3 className="font-display text-xl font-bold leading-tight">{t('tenant.pharmacy.dashboard.monthlySummary')}</h3>
                <p className="text-on-primary-container text-sm mt-4 opacity-90 leading-relaxed">
                  {t('tenant.pharmacy.dashboard.summaryText')}
                </p>
                <div className="mt-8 pt-6 border-t border-on-primary/10">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest">{t('tenant.pharmacy.dashboard.efficiencyRating')}</span>
                    <span className="text-2xl font-bold">94.2%</span>
                  </div>
                </div>
              </div>
              <div className="h-32 bg-primary-container/20">
                <div className="w-full h-full bg-gradient-to-br from-primary-container/30 to-transparent"></div>
              </div>
            </div>

            <div className="bg-surface-container-high rounded-xl p-6">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.2em] text-on-surface-variant mb-6">{t('tenant.pharmacy.dashboard.stockInsights')}</h4>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="size-10 rounded bg-surface-container-lowest flex items-center justify-center text-primary">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface leading-snug">{t('tenant.pharmacy.dashboard.marketPrice')}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{t('tenant.pharmacy.dashboard.marketPriceDesc')}</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="size-10 rounded bg-surface-container-lowest flex items-center justify-center text-secondary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface leading-snug">{t('tenant.pharmacy.dashboard.fdaCompliance')}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{t('tenant.pharmacy.dashboard.fdaComplianceDesc')}</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="size-10 rounded bg-surface-container-lowest flex items-center justify-center text-tertiary">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface leading-snug">{t('tenant.pharmacy.dashboard.autoProcurement')}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{t('tenant.pharmacy.dashboard.autoProcurementDesc')}</p>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="mt-auto border-t border-outline-variant/10 px-10 py-8 text-center">
        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
          {t('tenant.pharmacy.dashboard.footer')}
        </p>
      </footer>
    </motion.div>
  )
}