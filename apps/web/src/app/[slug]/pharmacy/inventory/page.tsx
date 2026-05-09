'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { getCookie } from '@/lib/cookies'
import type { Variants } from 'framer-motion'
import {
  Search,
  Plus,
  ArrowUpRight,
  Package,
  ArrowLeft,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
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

const cardHover = { scale: 1.005, transition: { type: 'spring', damping: 20, stiffness: 300 } }

interface ProductWithBatches {
  id: string
  commercialName: string
  activeSubstance: string
  presentation: string
  laboratory: string
  unitsPerBox: number
  totalStock: number
  nextExpiry: string | null
  batches: {
    id: string
    batchNumber: string
    quantity: number
    costPerBox: number | null
    expiryDate: string
    priority: string
  }[]
}

export default function PharmacyInventoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const { t } = useI18n()
  const orgSlug = getCookie('sb-org-slug') || slug

  const [products, setProducts] = useState<ProductWithBatches[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => { setCurrentPage(1) }, [searchQuery])

  const filteredProducts = searchQuery.trim()
    ? products.filter(p =>
        p.commercialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.activeSubstance.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.laboratory.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1
  const safePage = Math.min(currentPage, totalPages)
  const paginatedProducts = filteredProducts.slice((safePage - 1) * pageSize, safePage * pageSize)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_URL}/pharmacy/inventory`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
            id: item.product?.id ?? '',
            commercialName: item.product?.commercialName ?? '',
            activeSubstance: item.product?.activeSubstance ?? '',
            presentation: item.product?.presentation ?? '',
            laboratory: item.product?.laboratory ?? '',
            unitsPerBox: item.product?.unitsPerBox ?? 1,
            totalStock: item.totalStock ?? 0,
            nextExpiry: item.batches?.length
              ? item.batches.reduce((earliest: string, b: any) =>
                  b.expiryDate < earliest ? b.expiryDate : earliest,
                  item.batches[0].expiryDate
                )
              : null,
            batches: (item.batches ?? []).map((b: any) => ({
              id: b.id,
              batchNumber: b.batchNumber ?? '',
              quantity: b.quantity ?? 0,
              costPerBox: b.costPerBox ?? null,
              expiryDate: b.expiryDate ?? '',
              priority: b.priority ?? 'normal',
            })),
          }))
          setProducts(mapped)
        }
      } catch (error) {
        console.error('Error fetching inventory:', error)
      } finally {
        setLoading(false)
      }
    }

    if (orgSlug) {
      fetchData()
    }
  }, [orgSlug])

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
      <main className="flex flex-col flex-1 gap-6 p-6 lg:p-10">
        <motion.section variants={fadeInUp} className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <Link 
              href={`/${orgSlug}/pharmacy`}
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">{t('common.backToHome')}</span>
            </Link>
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">
              {t('tenant.pharmacy.inventory.operational')}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface font-display tracking-tight">
              {t('tenant.pharmacy.inventory.title')}
            </h1>
            <p className="text-on-surface-variant text-lg max-w-lg">
              {t('tenant.pharmacy.inventory.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href={`/${orgSlug}/pharmacy/library`}
              className="flex items-center gap-2 h-12 px-6 bg-surface-container-high text-on-surface rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-all"
            >
              <LayoutGrid className="w-5 h-5" />
              {t('tenant.pharmacy.inventory.viewLibrary')}
            </Link>
            <Link 
              href={`/${orgSlug}/pharmacy/restock`}
              className="flex items-center gap-2 h-12 px-8 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-all"
            >
              <Plus className="w-5 h-5" />
              {t('tenant.pharmacy.inventory.addBatch')}
            </Link>
          </div>
        </motion.section>

        <>
          <motion.section variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-primary">
                <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">{t('tenant.pharmacy.inventory.totalSkus')}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-on-surface text-3xl font-extrabold font-display">{products.length}</p>
                  <span className="text-tertiary font-bold text-sm">{products.length > 0 ? '+2.4%' : ''}</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-tertiary-container">
                <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">{t('tenant.pharmacy.inventory.activeBatches')}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-on-surface text-3xl font-extrabold font-display">{products.reduce((s, p) => s + p.batches.length, 0)}</p>
                  <span className="text-tertiary font-bold text-sm">{products.length > 0 && '+ active'}</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-error">
                <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">{t('tenant.pharmacy.inventory.criticalExpiry')}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-on-surface text-3xl font-extrabold font-display">{products.reduce((s, p) => {
                    const hasCritical = p.batches.some(b => {
                      const days = Math.ceil((new Date(b.expiryDate).getTime() - Date.now()) / (86400000))
                      return days <= 30
                    })
                    return s + (hasCritical ? 1 : 0)
                  }, 0)}</p>
                  <span className="text-error font-bold text-sm">{products.length > 0 ? 'High Risk' : ''}</span>
                </div>
              </div>
            </motion.section>

            <motion.div variants={fadeInUp} className="bg-surface-container-high rounded p-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
                <input 
                  className="w-full bg-surface-container-lowest border-none rounded-lg h-12 pl-10 pr-4 text-on-surface focus:ring-2 focus:ring-primary/20"
                  placeholder={t('tenant.pharmacy.inventory.searchPlaceholder')}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
            {filteredProducts.length === 0 && !loading ? (
              searchQuery ? (
                <motion.div variants={fadeInUp} className="text-center py-24 px-8 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/30">
                  <Package className="w-16 h-16 text-on-surface-variant/20 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-on-surface mb-2">{t('tenant.pharmacy.inventory.emptyLibraryTitle')}</h3>
                  <p className="text-sm text-on-surface-variant max-w-md mx-auto">{t('tenant.pharmacy.inventory.emptyDescription')}</p>
                </motion.div>
              ) : (
              <motion.div variants={fadeInUp} className="text-center py-24 px-8 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/30">
                <Package className="w-16 h-16 text-on-surface-variant/20 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-on-surface mb-2">{t('tenant.pharmacy.inventory.emptyTitle')}</h3>
                <p className="text-sm text-on-surface-variant max-w-md mx-auto">{t('tenant.pharmacy.inventory.emptyDescription')}</p>
                <div className="mt-8 pt-8 border-t border-outline-variant/10 max-w-sm mx-auto">
                  <p className="text-xs text-on-surface-variant/60 mb-3">
                    {t('tenant.pharmacy.inventory.emptyTip')}{' '}
<Link href={`/${orgSlug}/pharmacy/library`} className="text-primary font-bold hover:underline">
  {t('tenant.pharmacy.inventory.emptyTipLink')}
</Link>
                  </p>
                </div>
              </motion.div>
              )) : (
            <motion.div variants={fadeInUp} className="flex flex-col gap-6">
              {paginatedProducts.map((product, idx) => {
                return (
                  <motion.div key={product.id || idx} layout whileHover={cardHover} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
                    <Link href={`/${orgSlug}/pharmacy/restock/${product.id}`} className="block hover:bg-primary-container/5 transition-colors">
                      <div className="p-6 bg-surface-container-low flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-surface-container-lowest rounded-lg flex items-center justify-center shadow-sm p-1">
                            <div className="w-full h-full bg-surface-container rounded-md flex items-center justify-center">
                              <Package className="w-8 h-8 text-primary" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-on-surface text-xl font-extrabold font-display">{product.commercialName}</h3>
                            <p className="text-on-surface-variant text-sm font-medium">{product.activeSubstance} • {product.presentation} • {product.laboratory}</p>
                            <p className="text-[10px] text-on-surface-variant mt-1">
                              {Math.ceil(product.totalStock / (product.unitsPerBox || 1))} {t('tenant.pharmacy.inventory.boxes').replace('{n}', String(Math.ceil(product.totalStock / (product.unitsPerBox || 1))))}
                              {' '}({product.totalStock.toLocaleString()} {t('clinicalNotes.form.units')})
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-8 text-right">
                          <div className="flex flex-col">
                            <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">{t('tenant.pharmacy.inventory.totalStock')}</span>
                            <span className="text-on-surface text-2xl font-bold font-display">{product.totalStock.toLocaleString()} <span className="text-sm font-normal text-on-surface-variant">units</span></span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">{t('tenant.pharmacy.inventory.nextExpiry')}</span>
                            <span className="text-error text-2xl font-bold font-display">{product.nextExpiry?.split('T')[0] || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-container-low">
                            <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{t('tenant.pharmacy.inventory.priority')}</th>
                            <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{t('tenant.pharmacy.inventory.batchId')}</th>
                            <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{t('tenant.pharmacy.inventory.quantity')}</th>
                            <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{t('tenant.pharmacy.dispensing.costPerBox')}</th>
                            <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{t('tenant.pharmacy.inventory.expiryDate')}</th>
                            <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{t('tenant.pharmacy.inventory.status')}</th>
                            <th className="py-4 px-6"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container">
                          {product.batches.map((batch, bIdx) => (
                            <motion.tr
                              key={batch.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: bIdx * 0.04, type: 'spring', damping: 25, stiffness: 300 }}
                              className={`group hover:bg-surface-container transition-colors ${bIdx === 0 ? 'bg-secondary-container/20' : ''}`}>
                              <td className="py-4 px-6">
                                {bIdx === 0 ? (
                                  <div className="flex items-center gap-2 text-tertiary font-bold text-xs">
                                    <ArrowUpRight className="w-4 h-4" />
                                    {batch.priority}
                                  </div>
                                ) : (
                                  <span className="text-xs text-on-surface-variant font-medium">{batch.priority}</span>
                                )}
                              </td>
                              <td className="py-4 px-6 font-mono text-sm text-on-surface">{batch.batchNumber}</td>
                              <td className="py-4 px-6 text-sm font-bold text-on-surface">{batch.quantity.toLocaleString()} Units</td>
                              <td className="py-4 px-6 text-sm text-on-surface font-mono">
                                {batch.costPerBox != null ? `$${Number(batch.costPerBox).toFixed(2)}` : '—'}
                              </td>
                              <td className="py-4 px-6">
                                <span className={`text-sm ${bIdx === 0 ? 'font-bold text-error' : 'font-medium text-on-surface'}`}>{batch.expiryDate.split('T')[0]}</span>
                                {(() => {
                                  const days = Math.ceil((new Date(batch.expiryDate).getTime() - Date.now()) / (86400000))
                                  if (days <= 0) return <span className="block text-[10px] text-error font-medium uppercase mt-0.5">Expired</span>
                                  if (days <= 30) return <span className="block text-[10px] text-error font-medium uppercase mt-0.5">Expires in {days} days</span>
                                  return null
                                })()}
                              </td>
                              <td className="py-4 px-6">
                                {(() => {
                                  const days = Math.ceil((new Date(batch.expiryDate).getTime() - Date.now()) / (86400000))
                                  let cls = 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                                  let lbl = 'Healthy'
                                  if (days <= 30) { cls = 'bg-error-container text-on-error-container'; lbl = 'Critical' }
                                  else if (days <= 60) { cls = 'bg-secondary-container text-on-secondary-container'; lbl = 'Warning' }
                                  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${cls}`}>{lbl}</span>
                                })()}
                              </td>
                              <td className="py-4 px-6 text-right"></td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
            )}
            </AnimatePresence>

            {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="size-10 rounded-lg bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-on-surface-variant" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[40px] h-10 rounded-lg text-sm font-bold transition-colors ${
                    page === safePage
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="size-10 rounded-lg bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
            )}
          </>
      </main>

      <footer className="mt-auto border-t border-outline-variant/10 px-10 py-8 text-center">
        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
          {t('tenant.pharmacy.inventory.footer')}
        </p>
      </footer>
    </motion.div>
  )
}