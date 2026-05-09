'use client'

import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts'

// Mock data - replace with API data
const kpiData = {
  totalValue: '$1,240,500',
  totalValueChange: '+2.4%',
  expiryRisks: 142,
  securityStock: 18,
  procurementPending: 5,
}

const expiringBatches = [
  { id: 1, name: 'Amoxicillin 500mg', batch: 'BTCH-29831-A', quantity: 1200, expiry: 'Oct 12, 2024', days: 22, risk: 'CRITICAL' },
  { id: 2, name: 'Lisinopril 10mg', batch: 'BTCH-88211-C', quantity: 4500, expiry: 'Nov 28, 2024', days: 60, risk: 'MODERATE' },
  { id: 3, name: 'Atorvastatin 20mg', batch: 'BTCH-55102-K', quantity: 2100, expiry: 'Dec 15, 2024', days: 90, risk: 'STABLE' },
]

const stockData = [
  { category: 'ANTIBIOTICS', actual: 90, safety: 40 },
  { category: 'CARDIAC', actual: 30, safety: 40 },
  { category: 'ANALGESICS', actual: 85, safety: 40 },
  { category: 'DIABETIC', actual: 75, safety: 40 },
  { category: 'OTHERS', actual: 50, safety: 40 },
]

export default function ClinicalInventoryDashboard() {
  const { t, lang } = useI18n()

  const getRiskBadge = (risk: string, days: number) => {
    if (risk === 'CRITICAL') {
      return (
        <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-error-container text-on-error-container">
          {t('pharmacy.dashboard.critical')} ({days}d)
        </span>
      )
    } else if (risk === 'MODERATE') {
      return (
        <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-secondary-container text-on-secondary-container">
          {t('pharmacy.dashboard.moderate')} ({days}d)
        </span>
      )
    } else {
      return (
        <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-surface-container-highest text-on-surface-variant">
          {t('pharmacy.dashboard.stable')} ({days}d)
        </span>
      )
    }
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-1 p-8 lg:p-12 space-y-8 bg-surface"
    >
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-4"
      >
        <div className="max-w-2xl">
          <span className="text-label-sm font-label uppercase tracking-widest text-on-surface-variant text-[10px] bg-surface-container-high px-2 py-1 rounded">
            {t('pharmacy.dashboard.systemStatus')}: {t('common.active')}
          </span>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-on-surface mt-3">
            {t('pharmacy.dashboard.title')}
          </h1>
          <p className="text-on-surface-variant font-body text-lg mt-2">
            {t('pharmacy.dashboard.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 text-sm font-bold rounded bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-lg hover:scale-[1.02] transition-all">
            {t('pharmacy.dashboard.downloadReport')}
          </button>
          <button className="px-6 py-2.5 text-sm font-bold rounded bg-surface-container-highest text-on-surface hover:bg-surface-container transition-colors">
            {t('common.settings')}
          </button>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t('pharmacy.dashboard.totalValue'), value: kpiData.totalValue, change: kpiData.totalValueChange, color: 'primary', icon: 'trending_up' },
          { label: t('pharmacy.dashboard.expiryRisks'), value: kpiData.expiryRisks, sub: 'Items', color: 'error', icon: 'warning' },
          { label: t('pharmacy.dashboard.securityStock'), value: kpiData.securityStock, sub: 'SKU', color: 'secondary', icon: 'inventory_2' },
          { label: t('pharmacy.dashboard.procurement'), value: kpiData.procurementPending, sub: 'Active', color: 'tertiary', icon: 'local_shipping' },
        ].map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-surface-container-lowest p-6 rounded-xl border-l-4 border-${kpi.color} shadow-sm flex flex-col justify-between h-40`}
          >
            <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">{kpi.label}</p>
            <h3 className="text-3xl font-extrabold text-on-surface mt-1">{kpi.value}</h3>
            <div className={`flex items-center gap-2 text-${kpi.color}`}>
              <span className="material-symbols-outlined text-sm">{kpi.icon}</span>
              <span className="text-sm font-medium">{kpi.change || kpi.sub}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expiring Batches Table */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-8"
        >
          <div className="bg-surface-container-low rounded-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl font-bold">{t('pharmacy.dashboard.expiringSurveillance')}</h2>
              <span className="text-sm text-on-surface-variant underline cursor-pointer">{t('common.viewAll')}</span>
            </div>
            <div className="overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-on-surface-variant text-[10px] uppercase tracking-widest border-b border-outline-variant/20">
                    <th className="pb-4 font-semibold">{t('pharmacy.dashboard.medicationBatch')}</th>
                    <th className="pb-4 font-semibold">{t('pharmacy.dashboard.unitCount')}</th>
                    <th className="pb-4 font-semibold">{t('pharmacy.dashboard.expiryDate')}</th>
                    <th className="pb-4 font-semibold">{t('pharmacy.dashboard.riskLevel')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {expiringBatches.map((batch) => (
                    <motion.tr
                      key={batch.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group hover:bg-surface-container transition-colors"
                    >
                      <td className="py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-on-surface">{batch.name}</span>
                          <span className="text-xs text-on-surface-variant">{batch.batch}</span>
                        </div>
                      </td>
                      <td className="py-5 text-sm font-medium">{batch.quantity} {t('pharmacy.dashboard.units')}</td>
                      <td className="py-5 text-sm">{batch.expiry}</td>
                      <td className="py-5">{getRiskBadge(batch.risk, batch.days)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Editorial Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="bg-primary text-on-primary rounded-xl overflow-hidden shadow-xl">
            <div className="p-8">
              <h3 className="font-display text-xl font-bold leading-tight">{t('pharmacy.dashboard.monthlySummary')}</h3>
              <p className="text-on-primary-container text-sm mt-4 opacity-90 leading-relaxed">
                {t('pharmacy.dashboard.monthlySummaryDesc')}
              </p>
              <div className="mt-8 pt-6 border-t border-on-primary/10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-widest">{t('pharmacy.dashboard.efficiencyRating')}</span>
                  <span className="text-2xl font-bold">94.2%</span>
                </div>
              </div>
            </div>
            <div className="h-32 bg-primary-container/20">
              {/* Image placeholder - use actual image component */}
            </div>
          </div>

          <div className="bg-surface-container-high rounded-xl p-6">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.2em] text-on-surface-variant mb-4">{t('pharmacy.dashboard.stockInsights')}</h4>
            <ul className="space-y-6">
              {[
                { icon: 'analytics', color: 'text-primary', title: 'Market Price Shift', desc: 'Generic Ibuprofen up 12%' },
                { icon: 'verified_user', color: 'text-secondary', title: 'FDA Compliance', desc: 'Batch audits completed' },
                { icon: 'bolt', color: 'text-tertiary', title: 'Auto-Procure', desc: '5 Critical SKUs added' },
              ].map((item, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className={`size-10 rounded bg-surface-container-lowest flex items-center justify-center ${item.color}`}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface leading-snug">{t(`pharmacy.dashboard.${item.title.toLowerCase().replace(' ', '')}`)}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Security Stock Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10"
      >
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="font-display text-2xl font-bold">{t('pharmacy.dashboard.securityStockVariance')}</h2>
            <p className="text-sm text-on-surface-variant mt-1">{t('pharmacy.dashboard.securityStockDesc')}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-xs font-medium">{t('pharmacy.dashboard.actual')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary-fixed-dim"></div>
              <span className="text-xs font-medium">{t('pharmacy.dashboard.safetyLine')}</span>
            </div>
          </div>
        </div>
        <div className="h-64">
          <BarChart width={800} height={250} data={stockData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-outline-variant/20" />
            <XAxis dataKey="category" className="text-[10px] fill-on-surface-variant" />
            <YAxis className="text-[10px] fill-on-surface-variant" />
            <Tooltip />
            <Bar dataKey="actual" fill="var(--color-primary)" name={t('pharmacy.dashboard.actual')} />
            <Bar dataKey="safety" fill="var(--color-secondary-fixed-dim)" name={t('pharmacy.dashboard.safetyLine')} />
            <ReferenceLine y={40} stroke="var(--color-secondary-fixed-dim)" strokeDasharray="3 3" />
          </BarChart>
        </div>
      </motion.div>
    </motion.main>
  )
}
