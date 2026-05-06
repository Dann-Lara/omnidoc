'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2,
  ChevronRight,
  UserPlus,
  Video,
  Clock,
  ArrowLeft,
  Play,
  CalendarDays,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Specialty {
  id: string
  nameEn: string
  nameEs?: string
  icon?: string
  descriptionEn?: string
  descriptionEs?: string
}

interface Appointment {
  id: string
  patient: {
    id: string
    firstName: string
    lastName: string
  }
  user: {
    id: string
    firstName: string
    lastName: string
  }
  specialty?: {
    id: string
    nameEn: string
    nameEs?: string
  }
  scheduledAt: string
  status: string
  mode: string
  room?: string
  type: string
}

interface KPIs {
  today: number
  pending: number
  cancelled: number
}

export default function SpecialtyDashboardPage() {
  const { t, lang } = useI18n()
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()

  const slug = params.slug as string
  const specialtyId = params.specialtyId as string

  const [specialty, setSpecialty] = useState<Specialty | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [kpis, setKpis] = useState<KPIs>({ today: 0, pending: 0, cancelled: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [specialtyId])

  useEffect(() => {
    if (!isLoading) {
      computeKpis()
    }
  }, [appointments, isLoading])

  const loadData = async () => {
    setIsLoading(true)
    await Promise.all([fetchSpecialty(), fetchAppointments()])
  }

  const fetchSpecialty = async () => {
    try {
      const res = await fetch(`${API_URL}/specialties/${specialtyId}`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setSpecialty(data)
      }
    } catch (error) {
      console.error('Failed to fetch specialty:', error)
    }
  }

  const fetchAppointments = async () => {
    try {
      const url = new URL(`${API_URL}/appointments`)
      url.searchParams.set('specialtyId', specialtyId)
      url.searchParams.set('limit', '100')
      url.searchParams.set('page', '1')

      const res = await fetch(url.toString(), { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setAppointments(data.data || [])
      } else {
        console.error('Appointments fetch failed:', res.status)
        const errorText = await res.text().catch(() => '')
        console.error('Error body:', errorText)
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const computeKpis = () => {
    const today = new Date().toDateString()
    setKpis({
      today: appointments.filter(a => new Date(a.scheduledAt).toDateString() === today).length,
      pending: appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED').length,
      cancelled: appointments.filter(a => a.status === 'CANCELED').length,
    })
  }

  const specialtyName = specialty
    ? (lang === 'en' ? specialty.nameEn : (specialty.nameEs || specialty.nameEn))
    : 'Specialty'

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  const getPeriod = (dateStr: string) => {
    return new Date(dateStr).getHours() < 12 ? 'AM' : 'PM'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (date.toDateString() === today.toDateString()) return 'Hoy'
    if (date.toDateString() === tomorrow.toDateString()) return 'Mañana'
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return { label: t('appointments.directory.scheduled'), color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' }
      case 'CONFIRMED': return { label: t('appointments.directory.confirmed'), color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' }
      case 'IN_PROGRESS': return { label: t('appointments.directory.inProgress'), color: 'bg-primary/10 text-primary' }
      case 'COMPLETED': return { label: t('appointments.directory.completed'), color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' }
      case 'CANCELED': return { label: t('appointments.directory.cancelled'), color: 'bg-error-container dark:bg-red-900/30 text-error dark:text-red-400' }
      case 'NO_SHOW': return { label: t('appointments.directory.noShow'), color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400' }
      default: return { label: status, color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400' }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-8 pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
            <Link href={`/${slug}/areas/specialties`} className="hover:text-primary flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              {t('tenant.areas.specialties.areas')}
            </Link>
            <ChevronRight className="w-3 h-3 text-on-surface-variant/50" />
            <span className="text-primary">{specialtyName}</span>
          </nav>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-primary tracking-tight">{specialtyName}</h2>
          <p className="text-on-surface-variant mt-3 max-w-2xl text-lg leading-relaxed">
            {t('tenant.specialties.managingSpecialtyOperations').replace('{specialty}', specialtyName)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href={`/${slug}/operations/patients/new`} className="flex items-center gap-2 bg-surface-container-high text-on-surface px-6 py-3.5 rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all font-semibold text-sm">
            <UserPlus className="w-4 h-4" />
            {t('tenant.specialties.newPatient')}
          </Link>
          <Link href={`/${slug}/operations/appointments/new?userId=${user?.id}&specialtyId=${specialtyId}`} className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3.5 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all font-semibold text-sm">
            <Video className="w-4 h-4" />
            {t('tenant.specialties.newAppointment')}
          </Link>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface-container-lowest dark:bg-slate-800 p-6 rounded-2xl shadow-sm flex items-center space-x-6 group">
          <div className="w-14 h-14 rounded-2xl bg-primary-fixed dark:bg-primary/20 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface-variant dark:text-slate-400 mb-1">{t('appointments.directory.today')}</p>
            <h3 className="text-3xl font-extrabold text-primary dark:text-white">{kpis.today}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface-container-lowest dark:bg-slate-800 p-6 rounded-2xl shadow-sm flex items-center space-x-6 group">
          <div className="w-14 h-14 rounded-2xl bg-secondary-container dark:bg-yellow-900/30 flex items-center justify-center text-secondary dark:text-yellow-400 transition-transform group-hover:scale-110">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface-variant dark:text-slate-400 mb-1">{t('appointments.directory.pendingConfirmation')}</p>
            <h3 className="text-3xl font-extrabold text-primary dark:text-white">{kpis.pending}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface-container-lowest dark:bg-slate-800 p-6 rounded-2xl shadow-sm flex items-center space-x-6 group border-l-4 border-error/10">
          <div className="w-14 h-14 rounded-2xl bg-error-container dark:bg-red-900/30 flex items-center justify-center text-error dark:text-red-400 transition-transform group-hover:scale-110">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface-variant dark:text-slate-400 mb-1">{t('appointments.directory.cancelledAppointments')}</p>
            <h3 className="text-3xl font-extrabold text-primary dark:text-white">{kpis.cancelled}</h3>
          </div>
        </motion.div>
      </div>

      {/* Appointments List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden dark:bg-slate-800 dark:border-slate-700">
          <div className="px-5 py-4 border-b border-surface-container flex justify-between items-center bg-surface-container-low/30 dark:border-slate-700">
            <h3 className="text-lg font-bold text-primary">{t('tenant.specialties.upcomingAppointments')}</h3>
            <Link href={`/${slug}/operations/appointments`} className="text-xs font-bold text-on-primary-fixed-variant uppercase tracking-widest hover:underline">
              {t('tenant.specialties.viewAll')}
            </Link>
          </div>
          <div className="divide-y divide-surface-container dark:divide-slate-700">
            {appointments.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <CalendarDays className="w-12 h-12 mx-auto text-on-surface-variant/30 dark:text-slate-600 mb-4" />
                <p className="text-on-surface-variant dark:text-slate-400 font-medium">{t('common.noResults')}</p>
                <p className="text-xs text-on-surface-variant/60 dark:text-slate-500 mt-1">{t('tenant.specialties.noAppointmentsForSpecialty')}</p>
              </div>
            ) : (
              appointments
                .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                .map((appointment) => {
                  const statusBadge = getStatusBadge(appointment.status)
                  const canStart = appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED'
                  return (
                    <div key={appointment.id} className="px-5 py-4 flex items-center gap-5 group hover:bg-surface-container-low/20 dark:hover:bg-slate-700/30 transition-colors">
                      <div className="w-11 text-center shrink-0">
                        <p className="text-lg font-black text-primary">{formatTime(appointment.scheduledAt)}</p>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase">{getPeriod(appointment.scheduledAt)}</p>
                      </div>
                      <div className="w-11 h-11 rounded-full bg-primary/5 dark:bg-primary/10 flex items-center justify-center font-bold text-primary text-xs ring-2 ring-primary/5 shrink-0">
                        {appointment.patient.firstName[0]}{appointment.patient.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base text-on-surface dark:text-white truncate">
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </h4>
                        <p className="text-sm text-on-surface-variant dark:text-slate-400 truncate">
                          {appointment.type} • {formatDate(appointment.scheduledAt)} • {appointment.user.firstName} {appointment.user.lastName}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`hidden sm:inline-block px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                        {appointment.mode === 'TELEHEALTH' ? (
                          <span className="hidden sm:inline-block px-2.5 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase tracking-wider">
                            {t('tenant.specialties.telehealth')}
                          </span>
                        ) : (
                          <span className="hidden sm:inline-block px-2.5 py-1 bg-surface-container-high dark:bg-slate-700 text-on-surface-variant dark:text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            {t('tenant.specialties.inPerson')}
                          </span>
                        )}
                        {canStart ? (
                          <Link href={`/${slug}/operations/patients/${appointment.patient.id}/notes/new`} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-container transition-all flex items-center gap-2">
                            <Play className="w-4 h-4" />
                            {t('tenant.specialties.start')}
                          </Link>
                        ) : (
                          <button className="bg-surface-container-high dark:bg-slate-700 text-on-surface-variant dark:text-slate-400 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 opacity-50 cursor-not-allowed" disabled>
                            <Clock className="w-4 h-4" />
                            {t('tenant.specialties.waiting')}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
