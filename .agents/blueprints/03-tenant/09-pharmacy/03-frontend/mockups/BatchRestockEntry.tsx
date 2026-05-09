'use client'

import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { useState } from 'react'

export default function BatchRestockEntry() {
  const { t } = useI18n()
  const [quantity, setQuantity] = useState(50)

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-[1200px] mx-auto px-6 py-10"
    >
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center size-10 rounded-lg hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-primary font-headline">
              {t('pharmacy.restock.title')}
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant opacity-70">
              {t('pharmacy.restock.system')}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg transition-all">
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>help_outline</span>
            {t('pharmacy.restock.guidelines')}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Search & Entry */}
        <div className="lg:col-span-7 space-y-8">
          {/* Search/Scan Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
                {t('pharmacy.restock.step1')}
              </h2>
              <span className="text-xs text-primary font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">barcode_scanner</span>
                {t('pharmacy.restock.scannerActive')}
              </span>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-on-surface-variant">search</span>
              </div>
              <input className="w-full h-14 pl-12 pr-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-on-surface-variant/50 text-base" placeholder={t('pharmacy.restock.searchPlaceholder')} />
            </div>
          </section>

          {/* Product Selected State */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/5">
            <div className="flex gap-6">
              <div className="w-32 h-32 bg-surface-container rounded-lg overflow-hidden shrink-0">
                {/* Product image placeholder */}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      {t('pharmacy.restock.masterLibraryItem')}
                    </span>
                    <h3 className="text-xl font-bold mt-1">Epinephrine Auto-Injector 0.3mg</h3>
                    <p className="text-on-surface-variant text-sm font-medium">SKU: PHAR-EPI-9902</p>
                  </div>
                  <div className="text-right">
                    <p className="text-label-sm text-on-surface-variant uppercase">{t('pharmacy.inventory.currentInventory')}</p>
                    <p className="text-2xl font-bold text-primary">142 <span className="text-sm font-normal text-on-surface-variant">{t('pharmacy.dashboard.units')}</span></p>
                  </div>
                </div>
                <div className="mt-4 flex gap-4">
                  <div className="bg-surface-container-low px-3 py-2 rounded-lg flex-1">
                    <p className="text-[10px] uppercase text-on-surface-variant font-bold">{t('pharmacy.restock.location')}</p>
                    <p className="text-sm font-semibold">Central Cold Storage - Zone A</p>
                  </div>
                  <div className="bg-surface-container-low px-3 py-2 rounded-lg flex-1">
                    <p className="text-[10px] uppercase text-on-surface-variant font-bold">{t('pharmacy.restock.lastRestock')}</p>
                    <p className="text-sm font-semibold">Oct 12, 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Entry Form */}
          <section className="space-y-6">
            <h2 className="text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
              {t('pharmacy.restock.step2')}
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface pl-1">{t('pharmacy.restock.batchNumber')}</label>
                <input className="w-full h-12 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium" placeholder="e.g. LOT-2024-X11" />
              </div>
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-on-surface pl-1">{t('pharmacy.restock.expiryDate')}</label>
                <div className="relative">
                  <input className="w-full h-12 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium pr-10" placeholder="MM / DD / YYYY" />
                  <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant/60">calendar_today</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-semibold text-on-surface pl-1">{t('pharmacy.restock.quantity')}</label>
              <div className="flex items-center gap-4">
                <button className="size-14 rounded-xl bg-surface-container-highest flex items-center justify-center hover:bg-outline-variant/30 transition-colors">
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="flex-1 h-14 bg-surface-container-high border-none rounded-xl text-center text-xl font-bold focus:ring-0"
                />
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="size-14 rounded-xl bg-surface-container-highest flex items-center justify-center hover:bg-outline-variant/30 transition-colors"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Summary & Actions */}
        <div className="lg:col-span-5">
          <div className="sticky top-10 space-y-6">
            {/* Inventory Projection Card */}
            <div className="bg-primary text-on-primary rounded-2xl p-8 bg-gradient-to-br from-primary to-primary-container shadow-xl shadow-primary/20">
              <h3 className="text-label-sm font-bold uppercase tracking-widest opacity-70 mb-6">
                {t('pharmacy.restock.inventoryImpact')}
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-on-primary/10 pb-4">
                  <div>
                    <p className="text-xs opacity-70 mb-1">{t('pharmacy.restock.onHand')}</p>
                    <p className="text-2xl font-medium">142</p>
                  </div>
                  <span className="material-symbols-outlined opacity-30 pb-1">inventory_2</span>
                </div>
                <div className="flex justify-between items-end border-b border-on-primary/10 pb-4">
                  <div>
                    <p className="text-xs opacity-70 mb-1">{t('pharmacy.restock.addingBatch')}</p>
                    <p className="text-2xl font-bold">+ {quantity}</p>
                  </div>
                  <span className="material-symbols-outlined text-tertiary-fixed pb-1">add_circle</span>
                </div>
                <div className="pt-4">
                  <p className="text-xs opacity-70 mb-1">{t('pharmacy.restock.projectedTotal')}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold tracking-tighter">{142 + quantity}</span>
                    <span className="text-sm font-medium opacity-70">{t('pharmacy.dashboard.units')} {t('pharmacy.restock.total')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Checklist */}
            <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
              <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                {t('pharmacy.restock.complianceCheck')}
              </h4>
              <ul className="space-y-3">
                {[
                  { icon: 'check_circle', color: 'text-primary', text: t('pharmacy.restock.coldChain') },
                  { icon: 'check_circle', color: 'text-primary', text: t('pharmacy.restock.skuMatch') },
                  { icon: 'radio_button_unchecked', color: 'text-on-surface-variant opacity-40', text: t('pharmacy.restock.batchDoc') },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <span className={`material-symbols-outlined text-sm ${item.color}`} style={item.icon === 'check_circle' ? {fontVariationSettings: "'FILL' 1"} : {}}>
                      {item.icon}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Primary Action */}
            <div className="space-y-3">
              <button className="w-full h-16 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl font-bold text-lg shadow-lg shadow-primary/10 flex items-center justify-center gap-3 hover:brightness-110 transition-all">
                <span className="material-symbols-outlined">fact_check</span>
                {t('pharmacy.restock.finalize')}
              </button>
              <button className="w-full h-12 bg-transparent text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-colors rounded-lg">
                {t('pharmacy.restock.discard')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  )
}
