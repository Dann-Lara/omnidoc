'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2,
  CheckCircle,
  Download,
  Plus
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Specialty {
  id: string
  nameEn: string
  nameEs?: string
  icon?: string
  descriptionEn?: string
  descriptionEs?: string
  isActive: boolean
  statsVolume?: number
  assignedAt?: string | null
}

export default function TenantSpecialtiesPage() {
  const { t, lang } = useI18n()
  const params = useParams()
  const slug = params.slug as string
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSpecialties()
  }, [])

  const fetchSpecialties = async () => {
    try {
      const res = await fetch(`${API_URL}/my-specialties`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        const assigned = data.filter((s: { assignedAt: string | null }) => s.assignedAt)
        console.log('[areas/specialties] Assigned:', assigned.map((s: { id: string }) => s.id))
        setSpecialties(assigned)
      }
    } catch (error) {
      console.error('Failed to fetch specialties:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sortedSpecialties = [...specialties].sort((a, b) => (b.statsVolume || 0) - (a.statsVolume || 0))
  const count = sortedSpecialties.length
  const hasRealData = count > 0 && sortedSpecialties.some(s => s.assignedAt)

  const getGridCols = (totalItems: number) => {
    if (totalItems <= 2) return 'grid-cols-1 sm:grid-cols-2'
    if (totalItems <= 6) return 'grid-cols-2 sm:grid-cols-3'
    if (totalItems <= 12) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
    return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
  }

  const getBgClass = (index: number) => {
    if (!hasRealData) return 'bg-surface-container border border-outline-variant/20 hover:bg-surface-container-high'
    if (index === 0) return 'bg-primary text-white'
    if (index === 1) return 'bg-secondary-container text-on-secondary-container border border-white/40'
    if (index === 2) return 'bg-tertiary-container text-on-tertiary-container border border-white/20'
    if (index >= 3 && index <= 4) return 'bg-surface-container-low border border-outline-variant/20 hover:border-primary'
    return 'bg-surface-container border border-outline-variant/20 hover:bg-surface-container-high'
  }

  const getVolumeText = (volume: number) => volume > 0 ? volume.toLocaleString() : '—'

  const totalPatients = count > 0 ? sortedSpecialties.reduce((sum, s) => sum + (s.statsVolume || 0), 0) : 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-10 pb-24"
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div>
          <nav className="flex items-center gap-2 text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest mb-3">
            <span>{t('tenant.areas.specialties.tenants')}</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-primary">{t('tenant.areas.specialties.physicianExperience')}</span>
          </nav>
          <h2 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight font-headline">
            {t('tenant.areas.specialties.specialtyGrid')}
          </h2>
          <p className="text-on-surface-variant mt-3 max-w-2xl text-lg leading-relaxed">
            {t('tenant.areas.specialties.specialtyGridDesc')}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-8 py-3 rounded-xl bg-surface-container-high text-on-surface font-bold text-sm hover:bg-surface-container transition-colors shadow-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t('tenant.areas.specialties.exportMap')}
          </button>
          <button className="px-8 py-3 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('tenant.areas.specialties.adjustCapacity')}
          </button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className={`grid ${getGridCols(count)} gap-4`}>
          {sortedSpecialties.map((specialty, index) => (
            <Link
              key={specialty.id}
              href={`/${slug}/specialties/${specialty.id}`}
              className={`${getBgClass(index)} rounded-2xl p-6 relative group overflow-hidden transition-all min-h-[200px] flex flex-col justify-between cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-transform`}
              style={{ opacity: 1, textDecoration: 'none' }}
            >
              <div>
                <span className="material-symbols-outlined text-2xl mb-4 block" style={{ fontVariationSettings: 'FILL 1' }}>
                  {specialty.icon || 'medical_services'}
                </span>
                <h3 className="text-[clamp(1rem,4vw,1.5rem)] font-bold tracking-tight">
                  {lang === 'en' ? specialty.nameEn : (specialty.nameEs || specialty.nameEn)}
                </h3>
                {!hasRealData && (
                  <p className="text-on-surface-variant mt-2 text-sm font-medium">
                    {t('tenant.areas.specialties.noActivePatientsYet')}
                  </p>
                )}
                {hasRealData && index === 0 && (
                  <p className="text-blue-100/70 mt-2 text-lg font-medium">
                    {t('tenant.areas.specialties.criticalCareDiagnostics')}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <span className="text-[clamp(1.5rem,5vw,2.5rem)] font-black block">
                  {getVolumeText(specialty.statsVolume || 0)}
                </span>
                <span className="text-xs uppercase tracking-widest text-on-surface-variant">
                  {t('tenant.areas.specialties.activePatients')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <section className="flex flex-col lg:flex-row gap-8 items-stretch">
        <div className="flex-1 bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10">
          <h4 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/70 mb-8">
            {t('tenant.areas.specialties.activityInsights')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-2">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {t('tenant.areas.specialties.avgConsultationTime')}
              </p>
              <p className="text-3xl font-black text-primary">24.5 min</p>
              <div className="flex items-center gap-1 text-error text-xs font-bold">
                <span className="material-symbols-outlined text-sm">arrow_upward</span> 1.2% Over Median
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {t('tenant.areas.specialties.resourceUtilization')}
              </p>
              <p className="text-3xl font-black text-primary">88.4%</p>
              <div className="w-full h-2 bg-surface-container-high rounded-full">
                <div className="bg-primary-container h-full rounded-full" style={{ width: '88.4%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {t('tenant.areas.specialties.staffEfficiency')}
              </p>
              <p className="text-3xl font-black text-primary">92/100</p>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                <CheckCircle className="w-3 h-3" /> {t('tenant.areas.specialties.optimized')}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10">
          <h4 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/70 mb-6">
            {t('tenant.areas.specialties.legend')}
          </h4>
          <ul className="space-y-5">
            <li className="flex items-center gap-4">
              <span className="w-4 h-4 bg-primary rounded-md"></span>
              <span className="text-sm text-on-surface font-semibold">
                {t('tenant.areas.specialties.criticalHighActivity')}
              </span>
            </li>
            <li className="flex items-center gap-4">
              <span className="w-4 h-4 bg-secondary-container rounded-md border border-white/50"></span>
              <span className="text-sm text-on-surface font-semibold">
                {t('tenant.areas.specialties.standardOutpatient')}
              </span>
            </li>
            <li className="flex items-center gap-4">
              <span className="w-4 h-4 bg-tertiary-container rounded-md"></span>
              <span className="text-sm text-on-surface font-semibold">
                {t('tenant.areas.specialties.specializedLabWork')}
              </span>
            </li>
            <li className="flex items-center gap-4">
              <span className="w-4 h-4 bg-surface-container rounded-md border border-outline-variant/30"></span>
              <span className="text-sm text-on-surface font-semibold">
                {t('tenant.areas.specialties.emergingMarkets')}
              </span>
            </li>
          </ul>
        </div>
      </section>

      <div className="fixed bottom-10 right-10 flex items-center bg-white/90 border border-outline-variant/30 rounded-full pl-8 pr-3 py-3 shadow-2xl backdrop-blur-xl group z-50">
        <div className="mr-8 border-r border-outline-variant/20 pr-8 hidden md:block">
          <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest block leading-none mb-1">
            {t('tenant.areas.specialties.globalLoad')}
          </span>
          <span className="text-base font-black text-primary leading-none">
            {hasRealData ? `${Math.round((totalPatients / 30000) * 100)}%` : '0%'} Capacity
          </span>
        </div>
        <button className="bg-primary text-white flex items-center gap-3 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-primary-container transition-all shadow-lg shadow-primary/30">
          <Plus className="w-5 h-5" />
          <span>{t('tenant.areas.specialties.deploySpecialty')}</span>
        </button>
      </div>
    </motion.div>
  )
}