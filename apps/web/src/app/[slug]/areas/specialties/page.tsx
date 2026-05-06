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
  appointmentCount?: number
  assignedAt?: string | null
}

export default function TenantSpecialtiesPage() {
  const { t, lang } = useI18n()
  const params = useParams()
  const slug = params.slug as string
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalAppointments, setTotalAppointments] = useState(0)
  const [hasAssigned, setHasAssigned] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const specialtiesRes = await fetch(`${API_URL}/my-specialties`, { credentials: 'include' })

      if (specialtiesRes.ok) {
        const specialtiesData = await specialtiesRes.json()
        const assigned = specialtiesData.filter((s: Specialty) => s.assignedAt != null)

        const total = assigned.reduce((sum: number, s: Specialty) => sum + (s.appointmentCount || 0), 0)

        setTotalAppointments(total)
        setSpecialties(assigned)
        setHasAssigned(assigned.length > 0)
      }
    } catch (error) {
      console.error('Failed to fetch specialties data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sortedSpecialties = [...specialties].sort((a, b) => (b.appointmentCount || 0) - (a.appointmentCount || 0))
  const hasRealData = sortedSpecialties.some(s => (s.appointmentCount || 0) > 0)

  const getVolumeText = (volume: number) => volume > 0 ? volume.toLocaleString() : '—'

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
        className="flex justify-between items-end"
      >
        <div>
          <nav className="flex items-center gap-2 text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest mb-3">
            <span>{t('tenant.areas.specialties.tenants')}</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-primary">{t('tenant.areas.specialties.physicianExperience')}</span>
          </nav>
          <h2 className="text-4xl font-extrabold text-primary tracking-tight font-headline">
            {t('tenant.areas.specialties.specialtyGrid')}
          </h2>
          <p className="text-on-surface-variant mt-2 max-w-lg leading-relaxed">
            {t('tenant.areas.specialties.specialtyGridDesc')}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-semibold text-sm hover:bg-surface-container transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t('tenant.areas.specialties.exportMap')}
          </button>
          <button className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-semibold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('tenant.areas.specialties.adjustCapacity')}
          </button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !hasAssigned ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">medical_services</span>
          <h3 className="text-xl font-bold text-on-surface">{t('tenant.areas.specialties.noSpecialties')}</h3>
          <p className="text-on-surface-variant mt-2 max-w-md">{t('tenant.areas.specialties.noSpecialtiesDesc')}</p>
        </div>
      ) : (
        <section className="grid grid-cols-12 grid-rows-6 gap-5 h-[600px]">
          {sortedSpecialties.map((specialty, index) => {
            const volume = specialty.appointmentCount || 0
            const name = lang === 'en' ? specialty.nameEn : (specialty.nameEs || specialty.nameEn)

            if (index === 0 && hasRealData) {
              return (
                <Link
                  key={specialty.id}
                  href={`/${slug}/specialties/${specialty.id}`}
                  className="col-span-6 row-span-4 bg-primary text-white rounded-xl p-8 relative overflow-hidden group hover:scale-[1.01] transition-transform"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/10 transition-colors duration-500" />
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {specialty.icon || 'medical_services'}
                        </span>
                      </div>
                      <h3 className="text-3xl font-bold tracking-tight">{name}</h3>
                      <p className="text-blue-100/70 mt-2 font-medium">{t('tenant.areas.specialties.criticalCareDiagnostics')}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="space-y-1">
                        <span className="block text-4xl font-black">{getVolumeText(volume)}</span>
                        <span className="text-xs uppercase tracking-widest text-blue-200/80">{t('tenant.areas.specialties.activePatients')}</span>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-sm font-bold">
                          <span className="material-symbols-outlined text-sm">trending_up</span> Active
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            }

            if (index === 1) {
              return (
                <Link
                  key={specialty.id}
                  href={`/${slug}/specialties/${specialty.id}`}
                  className="col-span-3 row-span-3 bg-secondary-container text-on-secondary-container rounded-xl p-6 relative overflow-hidden group border border-white/40 hover:scale-[1.02] transition-transform"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <span className="material-symbols-outlined text-2xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {specialty.icon || 'medical_services'}
                      </span>
                      <h3 className="text-xl font-bold tracking-tight">{name}</h3>
                      <p className="text-on-secondary-container/60 text-sm">{t('tenant.areas.specialties.standardOutpatient')}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-2xl font-black">{getVolumeText(volume)}</span>
                      <div className="w-full bg-on-secondary-container/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full" style={{ width: `${Math.min((volume / (sortedSpecialties[0]?.appointmentCount || 1)) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            }

            if (index === 2) {
              return (
                <Link
                  key={specialty.id}
                  href={`/${slug}/specialties/${specialty.id}`}
                  className="col-span-3 row-span-3 bg-tertiary-container text-on-tertiary-container rounded-xl p-6 relative overflow-hidden group border border-white/20 hover:scale-[1.02] transition-transform"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <span className="material-symbols-outlined text-2xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {specialty.icon || 'medical_services'}
                      </span>
                      <h3 className="text-xl font-bold tracking-tight">{name}</h3>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-2xl font-black">{getVolumeText(volume)}</span>
                      <span className="text-xs uppercase tracking-widest opacity-60">{t('tenant.areas.specialties.specializedLabWork')}</span>
                    </div>
                  </div>
                </Link>
              )
            }

            if (index >= 3 && index <= 4) {
              return (
                <Link
                  key={specialty.id}
                  href={`/${slug}/specialties/${specialty.id}`}
                  className="col-span-3 row-span-3 bg-surface-container-low rounded-xl p-6 border border-outline-variant/20 hover:border-primary transition-colors hover:scale-[1.02] transition-transform"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="h-full flex flex-col justify-between">
                    <div>
                      <span className="material-symbols-outlined text-2xl text-primary mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {specialty.icon || 'medical_services'}
                      </span>
                      <h3 className="text-xl font-bold text-on-surface">{name}</h3>
                    </div>
                    <div className="space-y-1">
                      <span className="text-2xl font-black text-on-surface">{getVolumeText(volume)}</span>
                      <span className="text-xs text-on-surface-variant font-medium">{t('tenant.areas.specialties.activePatients')}</span>
                    </div>
                  </div>
                </Link>
              )
            }

            return (
              <Link
                key={specialty.id}
                href={`/${slug}/specialties/${specialty.id}`}
                className="col-span-2 row-span-2 bg-surface-container rounded-xl p-4 border border-outline-variant/20 hover:bg-surface-container-high transition-colors hover:scale-[1.02] transition-transform"
                style={{ textDecoration: 'none' }}
              >
                <div className="flex flex-col h-full justify-between">
                  <div className="flex justify-between">
                    <span className="material-symbols-outlined text-primary/60" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {specialty.icon || 'medical_services'}
                    </span>
                    <span className="text-xs font-bold text-primary/40">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">{name}</h4>
                    <p className="text-lg font-black text-on-surface">{getVolumeText(volume)}</p>
                  </div>
                </div>
              </Link>
            )
          })}

          {!hasRealData && sortedSpecialties.length === 0 && (
            <div className="col-span-12 row-span-4 flex items-center justify-center">
              <div className="text-center space-y-4">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant/30" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
                <p className="text-on-surface-variant font-medium">{t('tenant.areas.specialties.noActivePatientsYet')}</p>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 bg-surface-container-low p-8 rounded-xl border border-outline-variant/10">
          <h4 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/70 mb-6">
            {t('tenant.areas.specialties.activityInsights')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-2">
              <p className="text-xs font-medium text-on-surface-variant">{t('tenant.areas.specialties.avgConsultationTime')}</p>
              <p className="text-2xl font-black text-primary">24.5 min</p>
              <div className="flex items-center gap-1 text-error text-[10px] font-bold">
                <span className="material-symbols-outlined text-xs">arrow_upward</span> 1.2% Over Median
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-on-surface-variant">{t('tenant.areas.specialties.resourceUtilization')}</p>
              <p className="text-2xl font-black text-primary">88.4%</p>
              <div className="w-full h-1 bg-surface-container-high rounded-full">
                <div className="bg-primary-container h-full w-[88%]"></div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-on-surface-variant">{t('tenant.areas.specialties.staffEfficiency')}</p>
              <p className="text-2xl font-black text-primary">92/100</p>
              <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                <CheckCircle className="w-3 h-3" /> {t('tenant.areas.specialties.optimized')}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
          <h4 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/70 mb-4">
            {t('tenant.areas.specialties.legend')}
          </h4>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <span className="w-3 h-3 bg-primary rounded-sm" />
              <span className="text-sm text-on-surface font-medium">{t('tenant.areas.specialties.criticalHighActivity')}</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-3 h-3 bg-secondary-container rounded-sm" />
              <span className="text-sm text-on-surface font-medium">{t('tenant.areas.specialties.standardOutpatient')}</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-3 h-3 bg-tertiary-container rounded-sm" />
              <span className="text-sm text-on-surface font-medium">{t('tenant.areas.specialties.specializedLabWork')}</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-3 h-3 bg-surface-container rounded-sm border border-outline-variant/30" />
              <span className="text-sm text-on-surface font-medium">{t('tenant.areas.specialties.emergingMarkets')}</span>
            </li>
          </ul>
        </div>
      </section>

      <div className="fixed bottom-8 right-8 flex items-center bg-white border border-outline-variant/20 rounded-full pl-6 pr-2 py-2 shadow-xl backdrop-blur-lg group">
        <div className="mr-6 border-r border-outline-variant/20 pr-6 hidden md:block">
          <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest block leading-none mb-1">
            {t('tenant.areas.specialties.globalLoad')}
          </span>
          <span className="text-sm font-black text-primary leading-none">
            {hasRealData ? `${Math.round((totalAppointments / 30000) * 100)}%` : '0%'} Capacity
          </span>
        </div>
        <button className="bg-primary text-white flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-primary-container transition-all">
          <Plus className="w-4 h-4" />
          <span>{t('tenant.areas.specialties.deploySpecialty')}</span>
        </button>
      </div>
    </motion.div>
  )
}
