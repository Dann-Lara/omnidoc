'use client'

import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Product {
  id: string
  commercialName: string
  productId: string
  activeSubstance: string
  presentation: string
  laboratory: string
}

const mockProducts: Product[] = [
  { id: '1', commercialName: 'Lipitor', productId: 'MED-90210', activeSubstance: 'Atorvastatin Calcium', presentation: '10mg Tablet (30pk)', laboratory: 'Pfizer Inc.' },
  { id: '2', commercialName: 'Humira', productId: 'BIO-44521', activeSubstance: 'Adalimumab', presentation: '40mg/0.4mL Pen', laboratory: 'AbbVie' },
  { id: '3', commercialName: 'Ventolin HFA', productId: 'INH-33211', activeSubstance: 'Albuterol Sulfate', presentation: '90mcg Inhaler', laboratory: 'GSK' },
  { id: '4', commercialName: 'Januvia', productId: 'DIA-00982', activeSubstance: 'Sitagliptin', presentation: '100mg Tablet (28pk)', laboratory: 'Merck & Co.' },
]

export default function MasterProductLibrary() {
  const { t } = useI18n()
  const params = useParams()
  const slug = params.slug as string

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-8 p-4 md:px-40 py-10 max-w-[1200px] mx-auto"
    >
      {/* Title & Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap justify-between items-end gap-4"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-on-surface text-4xl font-black leading-tight tracking-[-0.033em] font-headline">
            {t('pharmacy.library.title')}
          </h1>
          <p className="text-on-surface-variant text-base font-normal leading-normal">
            {t('pharmacy.library.description')}
          </p>
        </div>
        <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-primary text-on-primary text-sm font-bold leading-normal tracking-[0.015em] shadow-sm hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined mr-2">add_circle</span>
          <span>{t('pharmacy.library.addNew')}</span>
        </button>
      </motion.div>

      {/* Breadcrumbs & Search */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2 text-sm">
          <a className="text-on-surface-variant font-medium hover:text-primary transition-colors" href="#">{t('common.backToHome')}</a>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface font-semibold underline decoration-primary-container decoration-2 underline-offset-4">
            {t('pharmacy.library.title')}
          </span>
        </div>
        <div className="flex gap-4">
          <label className="flex flex-col flex-1 h-12">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-surface-container-high transition-all focus-within:bg-surface-container-lowest focus-within:ring-1 focus-within:ring-primary/20">
              <div className="text-on-surface-variant flex items-center justify-center pl-4">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input className="w-full border-none bg-transparent focus:ring-0 text-on-surface placeholder:text-on-surface-variant/60 px-4 text-base font-normal" placeholder={t('pharmacy.library.searchPlaceholder')} />
            </div>
          </label>
          <button className="flex items-center px-4 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined">tune</span>
            <span className="ml-2 font-semibold text-sm">{t('common.filterBy')}</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="px-6 py-4 text-on-surface-variant text-xs font-bold uppercase tracking-wider">{t('pharmacy.library.commercialName')}</th>
              <th className="px-6 py-4 text-on-surface-variant text-xs font-bold uppercase tracking-wider">{t('pharmacy.library.activeSubstance')}</th>
              <th className="px-6 py-4 text-on-surface-variant text-xs font-bold uppercase tracking-wider">{t('pharmacy.library.presentation')}</th>
              <th className="px-6 py-4 text-on-surface-variant text-xs font-bold uppercase tracking-wider">{t('pharmacy.library.laboratory')}</th>
              <th className="px-6 py-4 text-on-surface-variant text-xs font-bold uppercase tracking-wider text-right">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {mockProducts.map((product, idx) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:bg-surface-container/30 transition-colors"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${idx % 2 === 0 ? 'bg-primary' : 'bg-primary/40'}`}></div>
                    <div>
                      <p className="text-on-surface font-bold text-sm">{product.commercialName}</p>
                      <p className="text-on-surface-variant text-xs">ID: {product.productId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-on-surface-variant font-medium text-sm">{product.activeSubstance}</td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-container text-on-secondary-container">
                    {product.presentation}
                  </span>
                </td>
                <td className="px-6 py-5 text-on-surface text-sm">{product.laboratory}</td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-on-primary-fixed-variant hover:bg-primary-fixed rounded-lg transition-colors" title={t('pharmacy.library.editMaster')}>
                      <span className="material-symbols-outlined">edit_note</span>
                    </button>
                    <button className="p-2 text-on-tertiary-fixed-variant hover:bg-tertiary-fixed rounded-lg transition-colors" title={t('pharmacy.library.checkStock')}>
                      <span className="material-symbols-outlined">inventory_2</span>
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center">
          <p className="text-on-surface-variant text-xs font-medium">{t('pharmacy.library.showing', { from: 1, to: 4, total: 1248 })}</p>
          <div className="flex gap-1">
            <button className="p-1 rounded hover:bg-surface-container-highest text-on-surface-variant">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded bg-primary text-on-primary text-xs font-bold">1</button>
            <button className="w-8 h-8 rounded hover:bg-surface-container-highest text-on-surface-variant text-xs font-bold">2</button>
            <button className="w-8 h-8 rounded hover:bg-surface-container-highest text-on-surface-variant text-xs font-bold">3</button>
            <button className="p-1 rounded hover:bg-surface-container-highest text-on-surface-variant">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
