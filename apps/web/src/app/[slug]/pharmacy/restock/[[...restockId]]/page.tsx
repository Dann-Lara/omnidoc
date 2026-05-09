'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { getCookie } from '@/lib/cookies'
import type { Variants } from 'framer-motion'
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  CheckCircle,
  Package,
  History,
  Pencil,
  X,
  Check,
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

interface Batch {
  id: string
  batchNumber: string | null
  quantity: number
  expiryDate: string
}

interface EditForm {
  batchNumber: string
  quantity: number
  expiryDate: string
}

export default function PharmacyRestockPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const { t } = useI18n()
  const orgSlug = getCookie('sb-org-slug') || slug

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [batchNumber, setBatchNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [quantity, setQuantity] = useState(50)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [batches, setBatches] = useState<Batch[]>([])
  const [batchesLoading, setBatchesLoading] = useState(false)
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({ batchNumber: '', quantity: 0, expiryDate: '' })
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${API_URL}/pharmacy/inventory`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          const mapped: Product[] = (Array.isArray(data) ? data : []).map((item: any) => ({
            id: item.product?.id ?? '',
            commercialName: item.product?.commercialName ?? '',
            activeSubstance: item.product?.activeSubstance ?? '',
            presentation: item.product?.presentation ?? '',
            laboratory: item.product?.laboratory ?? '',
            barcode: item.product?.barcode ?? null,
            currentStock: item.totalStock ?? 0,
          }))
          setProducts(mapped)
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

  useEffect(() => {
    const preselectedId = params.restockId?.[0] || searchParams.get('productId')
    if (preselectedId && products.length > 0) {
      const match = products.find(p => p.id === preselectedId)
      if (match) setSelectedProduct(match)
    }
  }, [params.restockId, searchParams, products])

  useEffect(() => {
    if (!selectedProduct?.id) return
    async function fetchBatches() {
      setBatchesLoading(true)
      try {
        const res = await fetch(`${API_URL}/pharmacy/inventory/${selectedProduct.id}`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        if (res.ok) {
          const body = await res.json()
          const data = body.data ?? body
          const totalStock = data.batches?.reduce((s: number, b: any) => s + b.quantity, 0) ?? 0
          setBatches((data.batches ?? []).map((b: any) => ({
            id: b.id,
            batchNumber: b.batchNumber ?? '',
            quantity: b.quantity ?? 0,
            expiryDate: b.expiryDate ? b.expiryDate.split('T')[0] : '',
          })))
          setSelectedProduct(p => p ? { ...p, currentStock: totalStock } : null)
        }
      } catch (error) {
        console.error('Error fetching batches:', error)
      } finally {
        setBatchesLoading(false)
      }
    }
    fetchBatches()
  }, [selectedProduct?.id])

  const handleSubmit = async () => {
    if (!selectedProduct || !expiryDate || quantity <= 0) return

    try {
      const res = await fetch(`${API_URL}/pharmacy/inventory/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity,
          expiryDate,
          batchNumber: batchNumber || null,
        })
      })

      if (res.ok) {
        router.push(`/${orgSlug}/pharmacy/inventory`)
      }
    } catch (error) {
      console.error('Error creating restock:', error)
    }
  }

  const startEditing = (batch: Batch) => {
    setEditingBatchId(batch.id)
    setEditForm({
      batchNumber: batch.batchNumber ?? '',
      quantity: batch.quantity,
      expiryDate: batch.expiryDate,
    })
  }

  const cancelEditing = () => {
    setEditingBatchId(null)
    setEditForm({ batchNumber: '', quantity: 0, expiryDate: '' })
  }

  const saveBatch = async (batchId: string) => {
    try {
      const body: any = {}
      if (editForm.batchNumber !== '') body.batchNumber = editForm.batchNumber
      if (editForm.quantity >= 0) body.quantity = editForm.quantity
      if (editForm.expiryDate) body.expiryDate = editForm.expiryDate

      const res = await fetch(`${API_URL}/pharmacy/inventory/batches/${batchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const updated = prev => prev.map(b =>
          b.id === batchId
            ? { ...b, batchNumber: editForm.batchNumber, quantity: editForm.quantity, expiryDate: editForm.expiryDate }
            : b
        )
        setBatches(updated)
        setSelectedProduct(p => {
          if (!p) return p
          const newBatches = updated(batches)
          const total = newBatches.reduce((s, b) => s + b.quantity, 0)
          return { ...p, currentStock: total }
        })
        setEditingBatchId(null)
        setSuccessMsg(t('tenant.pharmacy.restock.batchUpdated'))
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch (error) {
      console.error('Error updating batch:', error)
    }
  }

  const filteredProducts = searchQuery 
    ? products.filter(p => 
        p.commercialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.activeSubstance.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products

  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      variants={staggerContainer}
      className="flex flex-col min-h-screen bg-surface"
    >
      <main className="flex flex-col flex-1 gap-6 p-6 lg:p-10">
        <motion.div variants={fadeInUp} className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href={`/${orgSlug}/pharmacy/inventory`}
              className="flex items-center justify-center size-10 rounded-lg hover:bg-surface-container transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-primary font-display">
                {t('tenant.pharmacy.restock.title')}
              </h1>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant opacity-70">
                {t('tenant.pharmacy.restock.subtitle')}
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg transition-all">
            <Search className="w-5 h-5" />
            {t('tenant.pharmacy.restock.guidelines')}
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <motion.div variants={fadeInUp} className="lg:col-span-7 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  {t('tenant.pharmacy.restock.identifyProduct')}
                </h2>
                <span className="text-xs text-primary font-medium flex items-center gap-1">
                  <Search className="w-[14px] h-[14px]" />
                  {t('tenant.pharmacy.restock.scannerActive')}
                </span>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-on-surface-variant" />
                </div>
                <input 
                  className="w-full h-14 pl-12 pr-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-on-surface-variant/50 text-base"
                  placeholder={t('tenant.pharmacy.restock.searchPlaceholder')}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/5">
              {selectedProduct ? (
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-surface-container rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    <Package className="w-16 h-16 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                          {t('tenant.pharmacy.restock.masterLibrary')}
                        </span>
                        <h3 className="text-xl font-bold mt-1">{selectedProduct.commercialName}</h3>
                        <p className="text-on-surface-variant text-sm font-medium">{selectedProduct.activeSubstance} • {selectedProduct.presentation}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-on-surface-variant uppercase">{t('tenant.pharmacy.restock.currentInventory')}</p>
                        <p className="text-2xl font-bold text-primary">
                          {selectedProduct.currentStock} <span className="text-sm font-normal text-on-surface-variant">Units</span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-4">
                      <div className="bg-surface-container-low px-3 py-2 rounded-lg flex-1">
                        <p className="text-[10px] uppercase text-on-surface-variant font-bold">{t('tenant.pharmacy.library.laboratory')}</p>
                        <p className="text-sm font-semibold">{selectedProduct.laboratory}</p>
                      </div>
                      <div className="bg-surface-container-low px-3 py-2 rounded-lg flex-1">
                        <p className="text-[10px] uppercase text-on-surface-variant font-bold">{t('tenant.pharmacy.library.presentation')}</p>
                        <p className="text-sm font-semibold">{selectedProduct.presentation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-on-surface-variant">{t('tenant.pharmacy.restock.selectProduct')}</p>
                </div>
              )}
            </section>

            {selectedProduct && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    {t('tenant.pharmacy.restock.existingBatches')}
                  </h2>
                  {successMsg && (
                    <span className="text-xs text-primary font-semibold">{successMsg}</span>
                  )}
                </div>
                {batchesLoading ? (
                  <div className="text-center py-8 text-sm text-on-surface-variant">Loading...</div>
                ) : batches.length === 0 ? (
                  <div className="text-center py-8 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/20">
                    <p className="text-sm text-on-surface-variant">{t('tenant.pharmacy.restock.noBatches')}</p>
                  </div>
                ) : (
                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-outline-variant/10 bg-surface-container-low">
                          <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t('tenant.pharmacy.restock.batchNumber')}</th>
                          <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t('tenant.pharmacy.restock.restockQuantity')}</th>
                          <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t('tenant.pharmacy.restock.expiryDate')}</th>
                          <th className="py-3 px-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/5">
                        {batches.map((batch) => (
                          <tr key={batch.id} className="group hover:bg-surface-container/50 transition-colors">
                            {editingBatchId === batch.id ? (
                              <>
                                <td className="py-2 px-4">
                                  <input
                                    className="w-full h-10 bg-surface-container rounded-lg border-none px-3 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                                    value={editForm.batchNumber}
                                    onChange={(e) => setEditForm(f => ({ ...f, batchNumber: e.target.value }))}
                                    placeholder="Batch #"
                                  />
                                </td>
                                <td className="py-2 px-4">
                                  <input
                                    className="w-24 h-10 bg-surface-container rounded-lg border-none px-3 text-sm font-bold text-center focus:ring-2 focus:ring-primary/20"
                                    type="number"
                                    min={0}
                                    value={editForm.quantity}
                                    onChange={(e) => setEditForm(f => ({ ...f, quantity: Math.max(0, parseInt(e.target.value) || 0) }))}
                                  />
                                </td>
                                <td className="py-2 px-4">
                                  <input
                                    className="w-full h-10 bg-surface-container rounded-lg border-none px-3 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                                    type="date"
                                    value={editForm.expiryDate}
                                    onChange={(e) => setEditForm(f => ({ ...f, expiryDate: e.target.value }))}
                                  />
                                </td>
                                <td className="py-2 px-4">
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => saveBatch(batch.id)}
                                      className="size-8 rounded-lg bg-primary text-on-primary flex items-center justify-center hover:brightness-110 transition-all"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={cancelEditing}
                                      className="size-8 rounded-lg bg-surface-container-highest text-on-surface-variant flex items-center justify-center hover:bg-error-container hover:text-on-error-container transition-all"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-3 px-4 font-mono text-sm text-on-surface">{batch.batchNumber || '—'}</td>
                                <td className="py-3 px-4 text-sm font-bold text-on-surface">{batch.quantity.toLocaleString()}</td>
                                <td className="py-3 px-4 text-sm text-on-surface">{batch.expiryDate}</td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    onClick={() => startEditing(batch)}
                                    className="size-8 rounded-lg opacity-0 group-hover:opacity-100 bg-surface-container-highest text-on-surface-variant flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {!selectedProduct && filteredProducts.length === 0 && !loading && (
              <div className="text-center py-16 px-8 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/30">
                <Package className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-on-surface mb-2">{t('tenant.pharmacy.restock.emptyTitle')}</h3>
                <p className="text-sm text-on-surface-variant max-w-xs mx-auto mb-6">{t('tenant.pharmacy.restock.emptyDescription')}</p>
                <Link
                  href={`/${orgSlug}/pharmacy/products/new?returnTo=restock`}
                  className="inline-flex items-center gap-2 h-12 px-8 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-lg hover:brightness-110 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  {t('tenant.pharmacy.restock.emptyCtaCreate')}
                </Link>
                <p className="text-xs text-on-surface-variant/60 mt-3">{t('tenant.pharmacy.restock.emptyCtaCreateDesc')}</p>
              </div>
            )}

            {!selectedProduct && filteredProducts.length > 0 && (
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
                {filteredProducts.slice(0, 3).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      setSelectedProduct(product)
                      setSearchQuery('')
                    }}
                    className="w-full p-4 flex items-center justify-between hover:bg-surface-container transition-colors border-b border-outline-variant/10 last:border-b-0"
                  >
                    <div className="text-left">
                      <p className="font-bold text-on-surface">{product.commercialName}</p>
                      <p className="text-xs text-on-surface-variant">{product.activeSubstance}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{product.currentStock} units</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <section className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {t('tenant.pharmacy.restock.batchDetails')}
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface pl-1">
                    {t('tenant.pharmacy.restock.batchNumber')}
                  </label>
                  <input 
                    className="w-full h-12 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium px-4"
                    placeholder={t('tenant.pharmacy.restock.batchPlaceholder')}
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface pl-1">
                    {t('tenant.pharmacy.restock.expiryDate')}
                  </label>
                  <input 
                    className="w-full h-12 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium px-4"
                    placeholder={t('tenant.pharmacy.restock.expiryPlaceholder')}
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-semibold text-on-surface pl-1">
                  {t('tenant.pharmacy.restock.restockQuantity')}
                </label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="size-14 rounded-xl bg-surface-container-highest flex items-center justify-center hover:bg-outline-variant/30 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input 
                    className="flex-1 h-14 bg-surface-container-high border-none rounded-xl text-center text-xl font-bold focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="size-14 rounded-xl bg-surface-container-highest flex items-center justify-center hover:bg-outline-variant/30 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </section>
          </motion.div>

          <motion.div variants={fadeInUp} className="lg:col-span-5">
            <div className="sticky top-10 space-y-6">
              <div className="bg-primary text-on-primary rounded-2xl p-8 shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-6">
                  {t('tenant.pharmacy.restock.inventoryImpact')}
                </h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-on-primary/10 pb-4">
                    <div>
                      <p className="text-xs opacity-70 mb-1">{t('tenant.pharmacy.restock.onHand')}</p>
                      <p className="text-2xl font-medium">{selectedProduct?.currentStock || 0}</p>
                    </div>
                    <Package className="w-6 h-6 opacity-30 pb-1" />
                  </div>
                  <div className="flex justify-between items-end border-b border-on-primary/10 pb-4">
                    <div>
                      <p className="text-xs opacity-70 mb-1">{t('tenant.pharmacy.restock.addingBatch')}</p>
                      <p className="text-2xl font-bold text-tertiary-fixed">+ {quantity}</p>
                    </div>
                    <Plus className="w-6 h-6 text-tertiary-fixed pb-1" />
                  </div>
                  <div className="pt-4">
                    <p className="text-xs opacity-70 mb-1">{t('tenant.pharmacy.restock.projectedTotal')}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold tracking-tighter">
                        {(selectedProduct?.currentStock || 0) + quantity}
                      </span>
                      <span className="text-sm font-medium opacity-70">{t('tenant.pharmacy.restock.unitsTotal')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
                <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                  {t('tenant.pharmacy.restock.complianceCheck')}
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    {t('tenant.pharmacy.restock.coldChain')}
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    {t('tenant.pharmacy.restock.skuMatch')}
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface-variant opacity-40">
                    <CheckCircle className="w-5 h-5" />
                    {t('tenant.pharmacy.restock.batchDocument')}
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleSubmit}
                  disabled={!selectedProduct || !expiryDate}
                  className="w-full h-16 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-bold text-lg shadow-lg shadow-primary/10 flex items-center justify-center gap-3 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  {t('tenant.pharmacy.restock.finalize')}
                </button>
                <Link 
                  href={`/${orgSlug}/pharmacy/inventory`}
                  className="w-full h-12 bg-transparent text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-colors rounded-lg flex items-center justify-center"
                >
                  {t('tenant.pharmacy.restock.discard')}
                </Link>
              </div>

              <div className="pt-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                  {t('tenant.pharmacy.restock.recentEntries')}
                </h4>
                <div className="space-y-px overflow-hidden rounded-lg">
                  {selectedProduct && batches.length > 0 ? (
                    batches.slice(0, 5).map((batch) => (
                      <div key={batch.id} className="bg-surface-container-low p-3 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold">{batch.batchNumber || '—'}</p>
                          <p className="text-[10px] text-on-surface-variant">{batch.expiryDate}</p>
                        </div>
                        <span className="text-sm font-bold text-primary">{batch.quantity.toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="bg-surface-container-lowest p-4 text-center">
                      <p className="text-xs text-on-surface-variant">{t('tenant.pharmacy.restock.noBatches')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="mt-auto border-t border-outline-variant/10 px-10 py-8 text-center">
        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
          {t('tenant.pharmacy.restock.ledgerNote')}
        </p>
      </footer>
    </motion.div>
  )
}