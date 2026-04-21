'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { getStoredRole } from '@/lib/auth/session'
import { useAuth } from '@/lib/auth'
import {
  Search,
  Plus,
  MoreVertical,
  CheckCircle,
  FileText,
  ChevronRight,
  Loader2
} from 'lucide-react'
import type { Variants } from 'framer-motion'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  }
}

interface Specialty {
  id: string
  nameEn: string
  nameEs?: string
  icon?: string
  descriptionEn?: string
  descriptionEs?: string
  isActive: boolean
  usageCount?: number
}

interface TopSpecialty {
  id: string
  nameEn: string
  nameEs?: string
  icon?: string
  usageCount: number
}

interface SpecialtiesStats {
  totalSpecialties: number
  activeSpecialties: number
  mostUsedCount: number
  topSpecialties: TopSpecialty[]
}

export default function SpecialtiesPage() {
  const { t, lang } = useI18n()
  const router = useRouter()
  const userRole = getStoredRole()
  const isOperator = userRole === 'OPERATOR'
  const canEdit = !isOperator

  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState<SpecialtiesStats | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    fetchSpecialties()
    fetchStats()
  }, [])

  const fetchSpecialties = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/specialties`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setSpecialties(data)
      }
    } catch (error) {
      console.error('Failed to fetch specialties:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/specialties/stats`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const filteredSpecialties = specialties.filter(s => 
    s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.nameEs && s.nameEs.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const totalSpecialties = filteredSpecialties.length
  const activeSpecialties = filteredSpecialties.filter(s => s.isActive).length

  const paginatedSpecialties = filteredSpecialties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredSpecialties.length / itemsPerPage)

  const getPageNumbers = () => {
    const pages: number[] = []
    for (let i = 1; i <= totalPages && i <= 5; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
      >
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
            {t('admin.specialties.architecturalMetadata')}
          </span>
          <h1 className="text-5xl font-extrabold text-primary tracking-tight font-headline">
            {t('admin.specialties.masterSpecialtiesCatalog')}
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-xl leading-relaxed">
            {t('admin.specialties.defineRegulate')}
          </p>
        </div>
        
        {canEdit && (
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-surface-container-high text-on-primary-fixed-variant hover:bg-surface-container-highest transition-all">
              <FileText className="text-lg" />
              {t('admin.specialties.importCsv')}
            </button>
            <Link
              href="/admin/parameters/specialties/new"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-br from-primary to-primary-container text-white shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="text-lg" />
              {t('admin.specialties.newSpecialty')}
            </Link>
          </div>
        )}
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-12 gap-6"
      >
        <motion.div
          variants={fadeInUp}
          className="col-span-8 bg-surface-container-lowest p-8 rounded-full flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center space-x-12">
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                {t('admin.specialties.totalSpecialties')}
              </p>
              <p className="text-4xl font-bold text-primary font-headline">{stats?.totalSpecialties ?? totalSpecialties}</p>
            </div>
            <div className="h-10 w-px bg-outline-variant/30"></div>
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                {t('admin.specialties.activeNow')}
              </p>
              <p className="text-4xl font-bold text-primary font-headline">{stats?.activeSpecialties ?? activeSpecialties}</p>
            </div>
            <div className="h-10 w-px bg-outline-variant/30"></div>
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                {t('admin.specialties.mostUsed')}
              </p>
              <p className="text-4xl font-bold text-primary-container font-headline">{stats?.mostUsedCount ?? 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="col-span-4 bg-primary text-on-primary p-8 rounded-full flex items-center justify-between"
        >
          <div>
            <p className="text-[10px] font-bold text-on-primary/60 uppercase tracking-wider mb-1">
              {t('admin.specialties.systemHealth')}
            </p>
            <p className="text-2xl font-bold font-headline">
              {t('admin.specialties.optimized')}
            </p>
          </div>
          <CheckCircle className="text-4xl text-on-primary-container" />
        </motion.div>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-12 gap-6"
      >
        <motion.div
          variants={fadeInUp}
          className="col-span-12 bg-surface-container p-6 rounded-xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                placeholder={t('admin.specialties.searchSpecialties')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-outline-variant bg-surface"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : paginatedSpecialties.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              {t('admin.specialties.noSpecialtiesFound')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="text-left px-4 py-3 text-sm font-medium text-on-surface-variant">
                      {t('admin.specialties.identityIcon')}
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-on-surface-variant">
                      {t('admin.specialties.englishNomenclature')}
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-on-surface-variant">
                      {t('admin.specialties.spanishTranslation')}
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-on-surface-variant">
                      {t('common.status')}
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-on-surface-variant">
                      {t('admin.specialties.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSpecialties.map((specialty) => (
                    <tr
                      key={specialty.id}
                      className="border-b border-outline-variant hover:bg-surface-container-lowest"
                    >
                      <td className="px-4 py-3">
                        <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {specialty.icon || 'medical_services'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{specialty.nameEn}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{specialty.nameEs || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          specialty.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                        }`}>
                          {specialty.isActive ? t('admin.specialties.active') : t('admin.specialties.inactive')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {canEdit && (
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/parameters/specialties/${specialty.id}`}
                              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {getPageNumbers().map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    currentPage === page 
                      ? 'bg-primary text-white' 
                      : 'bg-white shadow-sm text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}