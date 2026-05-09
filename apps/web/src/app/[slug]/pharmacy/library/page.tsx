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
  Edit,
  Package,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
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

interface ProductMaster {
  id: string
  commercialName: string
  activeSubstance: string
  presentation: string
  laboratory: string
  barcode?: string | null
}

export default function PharmacyLibraryPage() {
  const params = useParams()
  const slug = params.slug as string
  const { t } = useI18n()
  const orgSlug = getCookie('sb-org-slug') || slug

  const [products, setProducts] = useState<ProductMaster[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${API_URL}/pharmacy/products`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        if (res.ok) {
          const body = await res.json()
          setProducts(body.data ?? body)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    if (orgSlug) {
      fetchProducts()
    }
  }, [orgSlug])

  useEffect(() => { setCurrentPage(1) }, [searchQuery])

  const filteredProducts = searchQuery
    ? products.filter(p => 
        p.commercialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.activeSubstance.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.laboratory.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products

  const pageSize = 10
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1
  const safePage = Math.min(currentPage, totalPages)
  const paginatedProducts = filteredProducts.slice((safePage - 1) * pageSize, safePage * pageSize)
  const from = filteredProducts.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, filteredProducts.length)

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
      <main className="flex flex-col flex-1 gap-8 p-6 lg:p-10">
        <motion.div variants={fadeInUp} className="flex flex-wrap justify-between items-end gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black text-on-surface font-display tracking-tight">
              {t('tenant.pharmacy.library.title')}
            </h1>
            <p className="text-on-surface-variant text-base">
              {t('tenant.pharmacy.library.subtitle')}
            </p>
          </div>
          <Link href={`/${orgSlug}/pharmacy/products/new`} className="flex items-center justify-center gap-2 h-12 px-6 bg-primary text-on-primary text-sm font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity">
            <Plus className="w-5 h-5" />
            {t('tenant.pharmacy.library.addNew')}
          </Link>
        </motion.div>

        <motion.div variants={fadeInUp} className="flex flex-col gap-4">
          <Link
            href={`/${orgSlug}/pharmacy/inventory`}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t('tenant.pharmacy.library.backToInventory')}</span>
          </Link>

          <div className="flex gap-4">
            <div className="flex flex-1 h-12 items-stretch rounded-lg bg-surface-container-high transition-all focus-within:bg-surface-container-lowest focus-within:ring-1 focus-within:ring-primary/20">
              <div className="flex items-center justify-center pl-4 text-on-surface-variant">
                <Search className="w-5 h-5" />
              </div>
              <input 
                className="w-full border-none bg-transparent focus:ring-0 text-on-surface placeholder:text-on-surface-variant/60 px-4 text-base font-normal"
                placeholder={t('tenant.pharmacy.library.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </motion.div>

        {products.length === 0 ? (
          <motion.div
            key="empty"
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-24 px-8 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/30"
          >
            <Package className="w-16 h-16 text-on-surface-variant/20 mx-auto mb-6" />
            <h2 className="text-xl font-bold text-on-surface mb-2">{t('tenant.pharmacy.library.emptyTitle')}</h2>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto">{t('tenant.pharmacy.library.emptyDescription')}</p>
          </motion.div>
        ) : (
          <motion.div
            key="table"
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -10 }}
            className="overflow-hidden rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm"
          >
            <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-6 py-4 text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                  {t('tenant.pharmacy.library.commercialName')}
                </th>
                <th className="px-6 py-4 text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                  {t('tenant.pharmacy.library.activeSubstance')}
                </th>
                <th className="px-6 py-4 text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                  {t('tenant.pharmacy.library.presentation')}
                </th>
                <th className="px-6 py-4 text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                  {t('tenant.pharmacy.library.laboratory')}
                </th>
                <th className="px-6 py-4 text-on-surface-variant text-xs font-bold uppercase tracking-wider text-right">
                  {t('tenant.pharmacy.library.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {paginatedProducts.map((product, idx) => (
                <motion.tr
                  key={product.id}
                  whileHover={{ backgroundColor: 'rgba(var(--surface-container), 0.7)', transition: { duration: 0.15 } }}
                  layout
                  className="hover:bg-surface-container/30 transition-colors"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-8 rounded-full ${idx % 2 === 0 ? 'bg-primary' : 'bg-primary/40'}`}></div>
                      <div>
                        <p className="text-on-surface font-bold text-sm">{product.commercialName}</p>
                        {product.barcode && <p className="text-on-surface-variant text-xs">{t('tenant.pharmacy.library.formBarcode')}: {product.barcode}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-on-surface-variant font-medium text-sm">
                    {product.activeSubstance}
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-container text-on-secondary-container">
                      {product.presentation}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-on-surface text-sm">{product.laboratory}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/${orgSlug}/pharmacy/products/${product.id}/edit`}
                        className="p-2 text-primary hover:bg-primary-fixed rounded-lg transition-colors inline-flex"
                        title={t('tenant.pharmacy.library.edit')}
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/${orgSlug}/pharmacy/restock/${product.id}`}
                        className="p-2 text-tertiary hover:bg-tertiary-fixed rounded-lg transition-colors inline-flex"
                        title={t('tenant.pharmacy.library.checkStock')}
                      >
                        <Package className="w-5 h-5" />
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center">
            <p className="text-on-surface-variant text-xs font-medium">
              {t('tenant.pharmacy.library.showing')} {from}-{to} {t('tenant.pharmacy.library.of')} {filteredProducts.length} products
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(safePage - 1)}
                disabled={safePage <= 1}
                className="p-1 rounded hover:bg-surface-container-highest text-on-surface-variant disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded text-xs font-bold ${
                    page === safePage
                      ? 'bg-primary text-on-primary'
                      : 'hover:bg-surface-container-highest text-on-surface-variant'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(safePage + 1)}
                disabled={safePage >= totalPages}
                className="p-1 rounded hover:bg-surface-container-highest text-on-surface-variant disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
        )}
      </main>

      <footer className="mt-auto border-t border-outline-variant/10 px-10 py-8 text-center">
        <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest">
          {t('tenant.pharmacy.library.footer')}
        </p>
      </footer>
    </motion.div>
  )
}