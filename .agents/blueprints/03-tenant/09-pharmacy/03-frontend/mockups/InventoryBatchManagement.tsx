'use client'

import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { useState } from 'react'

// Mock data
const inventoryData = [
  {
    id: 1,
    name: 'Amoxicillin Trihydrate',
    sku: 'AMX-500-CP',
    type: 'Antibiotic • 500mg Capsules',
    totalStock: 4250,
    nextExpiry: 'Oct 12, 2024',
    batches: [
      { id: 1, batchId: '#BTH-2401-A9', quantity: 850, expiry: 'Oct 12, 2024', days: 22, priority: 'NEXT OUT', status: 'CRITICAL' },
      { id: 2, batchId: '#BTH-2403-C2', quantity: 1400, expiry: 'Jan 05, 2025', days: 60, priority: 'Secondary', status: 'HEALTHY' },
      { id: 3, batchId: '#BTH-2408-X1', quantity: 2000, expiry: 'Nov 30, 2025', days: 180, priority: 'Reserve', status: 'HEALTHY' },
    ],
  },
  {
    id: 2,
    name: 'Insulin Glargine',
    sku: 'INS-GLR-VIAL',
    type: 'Biological • 100 U/mL Injection',
    totalStock: 520,
    nextExpiry: 'Dec 20, 2024',
    batches: [
      { id: 4, batchId: '#BTH-INS-022', quantity: 520, expiry: 'Dec 20, 2024', days: 50, priority: 'NEXT OUT', status: 'WARNING' },
    ],
    lowStock: true,
  },
]

export default function InventoryBatchManagement() {
  const { t, lang } = useI18n()
  const [expandedProduct, setExpandedProduct] = useState<number | null>(1)

  const getStatusBadge = (status: string) => {
    const styles = {
      'CRITICAL': 'bg-error-container text-on-error-container',
      'WARNING': 'bg-secondary-container text-on-secondary-container',
      'HEALTHY': 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    }
    return (
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[status as keyof typeof styles]}`}>
        {status === 'CRITICAL' ? t('pharmacy.dashboard.critical') : status === 'WARNING' ? t('pharmacy.dashboard.warning') : t('pharmacy.dashboard.healthy')}
      </span>
    )
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-10"
    >
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-6 px-4 mb-10"
      >
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">
            {t('pharmacy.dashboard.operationalOverview')}
          </span>
          <h1 className="text-on-surface text-4xl md:text-5xl font-extrabold font-headline leading-tight tracking-[-0.033em]">
            {t('pharmacy.nav.inventory')}
          </h1>
          <p className="text-on-surface-variant text-lg font-normal font-body max-w-lg">
            {t('pharmacy.inventory.description')}
          </p>
        </div>
        <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center gap-2 h-12 px-8 rounded-xl font-bold text-sm tracking-wide shadow-lg hover:brightness-110 transition-all">
          <span className="material-symbols-outlined text-sm">add_circle</span>
          {t('pharmacy.nav.restock')}
        </button>
      </motion.section>

      {/* Metrics Row */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 mb-8"
      >
        {[
          { label: 'pharmacy.dashboard.totalSKUs', value: '1,240', change: '+2.4%', color: 'primary' },
          { label: 'pharmacy.dashboard.activeBatches', value: '4,892', change: '+128 new', color: 'tertiary-container' },
          { label: 'pharmacy.dashboard.criticalExpiry', value: '128', change: t('pharmacy.dashboard.highRisk'), color: 'error' },
        ].map((metric, idx) => (
          <div key={idx} className={`bg-surface-container-low rounded p-6 transition-all border-l-4 border-${metric.color}`}>
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2 font-label">{t(metric.label)}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-on-surface text-3xl font-extrabold font-headline">{metric.value}</p>
              <span className={`text-sm font-bold ${metric.color === 'error' ? 'text-error' : 'text-tertiary'}`}>{metric.change}</span>
            </div>
          </div>
        ))}
      </motion.section>

      {/* Filter Bar */}
      <div className="px-4 mb-6">
        <div className="bg-surface-container-high rounded p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input className="w-full bg-surface-container-lowest border-none rounded h-12 pl-10 pr-4 text-on-surface focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50 text-base" placeholder={t('pharmacy.search.placeholder')} />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none h-12 px-6 bg-surface-container-lowest text-on-surface font-bold text-sm rounded flex items-center justify-center gap-2 border border-outline-variant/20">
              <span className="material-symbols-outlined text-sm">filter_list</span> {t('common.filterBy')}
            </button>
            <button className="flex-1 md:flex-none h-12 px-6 bg-surface-container-lowest text-on-surface font-bold text-sm rounded flex items-center justify-center gap-2 border border-outline-variant/20">
              <span className="material-symbols-outlined text-sm">download</span> {t('common.export')}
            </button>
          </div>
        </div>
      </div>

      {/* Inventory List */}
      <div className="px-4 flex flex-col gap-6">
        {inventoryData.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm ${product.lowStock ? 'opacity-90 grayscale-[0.2]' : ''}`}
          >
            {/* Product Header */}
            <div className="p-6 bg-surface-container-low flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center shadow-sm p-1">
                  {/* Image placeholder */}
                </div>
                <div>
                  <h3 className="text-on-surface text-xl font-extrabold font-headline">{product.name}</h3>
                  <p className="text-on-surface-variant text-sm font-medium">{product.type} • SKU: {product.sku}</p>
                </div>
              </div>
              <div className="flex gap-8 text-right">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest font-label">{t('pharmacy.inventory.totalStock')}</span>
                  <span className={`text-on-surface text-2xl font-bold font-headline ${product.lowStock ? 'text-error' : ''}`}>
                    {product.totalStock.toLocaleString()} <span className="text-sm font-normal text-on-surface-variant">{t('pharmacy.dashboard.units')}</span>
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest font-label">{t('pharmacy.inventory.nextExpiry')}</span>
                  <span className={`text-on-surface text-2xl font-bold font-headline ${product.lowStock ? 'text-error' : ''}`}>
                    {product.nextExpiry}
                  </span>
                </div>
              </div>
            </div>

            {/* Batch Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-container-highest">
                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant font-label">{t('pharmacy.inventory.fefoPriority')}</th>
                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant font-label">Batch ID</th>
                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant font-label">{t('pharmacy.dashboard.unitCount')}</th>
                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant font-label">{t('pharmacy.inventory.expiryDate')}</th>
                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant font-label">{t('common.status')}</th>
                    <th className="py-4 px-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {product.batches.map((batch) => (
                    <tr key={batch.id} className="group hover:bg-surface-container-low transition-colors">
                      <td className="py-4 px-6">
                        <div className={`flex items-center gap-2 ${batch.priority === 'NEXT OUT' ? 'text-tertiary font-bold text-xs' : 'text-on-surface-variant text-xs'}`}>
                          {batch.priority === 'NEXT OUT' && <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>priority_high</span>}
                          {batch.priority}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-sm text-on-surface">{batch.batchId}</td>
                      <td className="py-4 px-6 text-sm font-bold text-on-surface">{batch.quantity} {t('pharmacy.dashboard.units')}</td>
                      <td className="py-4 px-6">
                        <span className={`text-sm font-medium ${batch.days <= 30 ? 'text-error font-bold' : 'text-on-surface'}`}>
                          {batch.expiry}
                        </span>
                        {batch.days <= 30 && (
                          <span className="block text-[10px] text-error font-medium uppercase mt-0.5">
                            {t('pharmacy.dashboard.expiresIn', { days: batch.days })}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(batch.status)}</td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-primary font-bold text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                          {t('pharmacy.inventory.adjust')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.main>
  )
}
