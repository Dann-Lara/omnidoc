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
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  History,
  Verified,
  FileText,
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

interface DispensedRecord {
  id: string
  quantity: number
  createdAt: string
  note: {
    id: string
    medicationDispensed: boolean
    patient: {
      id: string
      firstName: string
      lastName: string
    }
    doctor: {
      id: string
      firstName: string
      lastName: string
    }
  }
  product: {
    id: string
    commercialName: string
    activeSubstance: string
    presentation: string
    unitsPerBox: number
  }
  batch: {
    id: string
    batchNumber: string
    costPerBox: number | null
  }
  dispensedByUser: {
    id: string
    firstName: string
    lastName: string
  } | null
}

export default function DispensingHistoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const { t } = useI18n()
  const orgSlug = getCookie('sb-org-slug') || slug

  const [records, setRecords] = useState<DispensedRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => { setCurrentPage(1) }, [searchQuery])

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`${API_URL}/pharmacy/dispens/history`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          setRecords(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Error fetching dispensing history:', error)
      } finally {
        setLoading(false)
      }
    }

    if (orgSlug) {
      fetchHistory()
    }
  }, [orgSlug])

  const filteredRecords = searchQuery.trim()
    ? records.filter(r =>
        r.product?.commercialName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.batch?.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${r.note?.patient?.firstName} ${r.note?.patient?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : records

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1
  const safePage = Math.min(currentPage, totalPages)
  const paginatedRecords = filteredRecords.slice((safePage - 1) * pageSize, safePage * pageSize)
  const from = filteredRecords.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, filteredRecords.length)

  const statusBadge = (record: DispensedRecord) => {
    if (record.note?.medicationDispensed) {
      return {
        class: 'bg-secondary-container text-on-secondary-container',
        dot: 'bg-secondary',
        label: 'Dispensed',
      }
    }
    return {
      class: 'bg-surface-container-highest text-on-surface-variant',
      dot: 'bg-outline',
      label: 'Pending',
    }
  }

  const boxInfo = (record: DispensedRecord) => {
    const unitsPerBox = record.product?.unitsPerBox || 1
    const boxes = record.quantity / unitsPerBox
    const whole = Math.floor(boxes)
    const remainder = boxes % 1 > 0.01 ? record.quantity % unitsPerBox : 0
    return { boxes: whole, remainder, unitsPerBox }
  }

  const lineCost = (record: DispensedRecord) => {
    const upb = record.product?.unitsPerBox || 1
    const costPerBox = record.batch?.costPerBox ? Number(record.batch.costPerBox) : 0
    if (!costPerBox) return null
    return (record.quantity / upb) * costPerBox
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
      <header className="bg-surface border-b border-outline-variant/10 px-6 lg:px-10 py-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            <Link href={`/${orgSlug}/pharmacy`} className="hover:text-primary transition-colors">
              {t('common.backToHome')}
            </Link>
            <span className="text-on-surface-variant/40">/</span>
            <span className="text-primary font-bold">{t('tenant.nav.dispensingNav')}</span>
          </nav>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-display">
                {t('tenant.nav.dispensingNav')}
              </h1>
              <p className="text-on-surface-variant max-w-2xl">
                {t('tenant.pharmacy.dispensing.subtitle')}
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-sm transition-all">
                <Download className="w-4 h-4" />
                {t('tenant.pharmacy.dashboard.downloadReport')}
              </button>
              <Link
                href={`/${orgSlug}/pharmacy/inventory`}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm shadow-lg hover:opacity-90 transition-all"
              >
                <Plus className="w-4 h-4" />
                {t('tenant.pharmacy.restock.title')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-surface-container-low px-6 lg:px-10 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative w-full lg:w-1/3 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
              <input
                className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface transition-all placeholder:text-on-surface-variant/50 shadow-sm"
                placeholder={t('tenant.pharmacy.dispensing.searchPlaceholder')}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 flex gap-3 w-full lg:w-auto">
              <select className="flex-1 bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm text-on-surface-variant focus:ring-2 focus:ring-primary/20">
                <option>{t('tenant.pharmacy.dispensing.dateRange')}</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Custom Range</option>
              </select>
              <button className="p-3 text-on-surface-variant hover:text-primary hover:bg-surface-container-lowest rounded-xl transition-all">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="flex-grow px-6 lg:px-10 pb-20">
        <div className="max-w-7xl mx-auto mt-6 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-24 px-8">
              <History className="w-16 h-16 text-on-surface-variant/20 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-on-surface mb-2">{t('tenant.pharmacy.dispensing.emptyTitle')}</h3>
              <p className="text-sm text-on-surface-variant max-w-md mx-auto">{t('tenant.pharmacy.dispensing.emptyDescription')}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                      <th className="px-6 py-5">{t('tenant.pharmacy.dispensing.timestamp')}</th>
                      <th className="px-6 py-5">{t('tenant.pharmacy.dispensing.patient')}</th>
                      <th className="px-6 py-5">{t('tenant.pharmacy.dispensing.medication')}</th>
                      <th className="px-6 py-5">{t('tenant.pharmacy.dispensing.batch')}</th>
                      <th className="px-6 py-5 text-center">{t('tenant.pharmacy.dispensing.qty')}</th>
                      <th className="px-6 py-5">{t('tenant.pharmacy.dispensing.costPerBox')}</th>
                      <th className="px-6 py-5">{t('tenant.pharmacy.dispensing.verifiedBy')}</th>
                      <th className="px-6 py-5">{t('tenant.pharmacy.dispensing.status')}</th>
                      <th className="px-6 py-5 text-right">{t('tenant.pharmacy.library.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    <AnimatePresence mode="wait">
                      {paginatedRecords.map((record, idx) => {
                        const badge = statusBadge(record)
                        const date = new Date(record.createdAt)
                        return (
                          <motion.tr
                            key={record.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03, type: 'spring', damping: 22, stiffness: 300 }}
                            className={`group hover:bg-surface-container-low/40 transition-colors ${idx % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}
                          >
                            <td className="px-6 py-6 align-top">
                              <div className="text-sm font-bold text-on-surface">
                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                              <div className="text-xs text-on-surface-variant mt-0.5">
                                {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td className="px-6 py-6 align-top">
                              <div className="font-bold text-primary text-sm">
                                {record.note?.patient?.firstName} {record.note?.patient?.lastName}
                              </div>
                              <div className="text-xs font-mono text-on-surface-variant mt-0.5">
                                ID: {record.note?.patient?.id?.slice(0, 8)}
                              </div>
                            </td>
                            <td className="px-6 py-6 align-top">
                              <div className="font-bold text-on-surface text-sm">{record.product?.commercialName}</div>
                              <div className="text-xs italic text-on-surface-variant mt-0.5">
                                {record.product?.activeSubstance} / {record.product?.presentation}
                              </div>
                            </td>
                            <td className="px-6 py-6 align-top">
                              <span className="px-2 py-1 bg-surface-container text-on-surface-variant text-[10px] font-mono rounded font-bold">
                                {record.batch?.batchNumber || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-6 align-top text-center">
                              <div className="font-bold text-on-surface text-sm">
                                {record.quantity}
                              </div>
                              <div className="text-[10px] text-on-surface-variant mt-0.5">
                                {(() => {
                                  const { boxes, remainder, unitsPerBox } = boxInfo(record)
                                  const parts = []
                                  if (boxes > 0) parts.push(`${boxes} ${t('tenant.pharmacy.inventory.boxes').replace('{n}', String(boxes))}`)
                                  if (remainder > 0) parts.push(`${remainder} ${t('clinicalNotes.form.units')}`)
                                  return parts.join(' + ') || `${record.quantity} ${t('clinicalNotes.form.units')}`
                                })()}
                              </div>
                            </td>
                            <td className="px-6 py-6 align-top">
                              <div className="text-sm font-semibold text-on-surface">
                                {lineCost(record) !== null
                                  ? `$${lineCost(record)!.toFixed(2)}`
                                  : '\u2014'}
                              </div>
                              <div className="text-[10px] text-on-surface-variant mt-0.5">
                                {record.batch?.costPerBox
                                  ? `@ $${Number(record.batch.costPerBox).toFixed(2)}/${t('tenant.pharmacy.dispensing.costPerBox')}`
                                  : '\u00a0'}
                              </div>
                            </td>
                            <td className="px-6 py-6 align-top">
                              <div className="text-xs font-semibold text-on-surface">
                                {record.dispensedByUser?.firstName} {record.dispensedByUser?.lastName}
                              </div>
                            </td>
                            <td className="px-6 py-6 align-top">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${badge.class}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                {badge.label}
                              </span>
                            </td>
                            <td className="px-6 py-6 align-top text-right">
                              <Link
                                href={`/${orgSlug}/operations/patients/${record.note?.patient?.id}/notes/${record.note?.id}`}
                                className="inline-flex items-center gap-1 text-primary hover:underline font-bold text-sm"
                              >
                                <FileText className="w-4 h-4" />
                                {t('tenant.pharmacy.dispensing.viewNote')}
                              </Link>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 bg-surface-container-low/30 border-t border-outline-variant/10 flex flex-col lg:flex-row justify-between items-center gap-4">
                <p className="text-xs text-on-surface-variant font-medium">
                  {t('tenant.pharmacy.library.showing')} {from}-{to} {t('tenant.pharmacy.library.of')} {filteredRecords.length} {t('tenant.pharmacy.dispensing.logs')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="size-10 rounded-lg bg-surface-container-lowest text-on-surface shadow-sm border border-outline-variant/20 hover:bg-primary-fixed transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = Math.max(1, Math.min(safePage - 2, totalPages - 4)) + i
                    if (page > totalPages) return null
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[40px] h-10 rounded-lg text-sm font-bold transition-colors ${
                          page === safePage
                            ? 'bg-primary text-on-primary shadow-md'
                            : 'bg-surface-container-lowest text-on-surface shadow-sm border border-outline-variant/20 hover:bg-surface-container-high'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    className="size-10 rounded-lg bg-surface-container-lowest text-on-surface shadow-sm border border-outline-variant/20 hover:bg-primary-fixed transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="bg-surface-container px-6 lg:px-10 py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-fixed rounded-lg">
                <History className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">{t('tenant.pharmacy.dispensing.auditStats')}</h3>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-3xl font-black text-on-surface font-display">{records.length}</span>
                <span className="text-xs font-bold text-on-surface-variant ml-1">{t('tenant.pharmacy.dispensing.entries')}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-secondary-fixed rounded-lg">
                <Verified className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">{t('tenant.pharmacy.dispensing.fefoAdherence')}</h3>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-3xl font-black text-on-surface font-display">99.8%</span>
                <span className="text-xs font-bold text-on-surface-variant ml-1">{t('tenant.pharmacy.dispensing.score')}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-tertiary">OPTIMAL</span>
                <p className="text-[10px] text-outline uppercase tracking-tighter">{t('tenant.pharmacy.dispensing.compliance')}</p>
              </div>
            </div>
          </div>

          <div className="bg-primary-container text-on-primary-container p-6 rounded-2xl relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <h4 className="font-headline font-bold text-lg mb-2">{t('tenant.pharmacy.dispensing.exportTitle')}</h4>
              <p className="text-sm opacity-80 mb-4">{t('tenant.pharmacy.dispensing.exportDesc')}</p>
              <button className="w-full py-3 bg-primary-fixed text-primary font-black rounded-xl hover:bg-white transition-colors text-sm">
                {t('tenant.pharmacy.dispensing.generateReport')}
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl" />
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-outline-variant/10 px-10 py-8 text-center">
        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
          {t('tenant.pharmacy.dashboard.footer')}
        </p>
      </footer>
    </motion.div>
  )
}
