'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { useParams, useRouter } from 'next/navigation'
import { Plus, CalendarDays, List, CalendarDays as CalendarIcon } from 'lucide-react'
import { AppointmentsTable } from './components/AppointmentsTable'
import { AgendaView } from './components/AgendaView'
import { UnifiedFilters } from './components/UnifiedFilters'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface KPIs {
  today: number
  pending: number
  cancelled: number
}

interface Appointment {
  id: string
  patient: { id: string; firstName: string; lastName: string }
  user: { id: string; firstName: string; lastName: string }
  specialty?: { id: string; nameEn: string; nameEs: string }
  scheduledAt: string
  status: string
  mode?: string
  type: string
  room?: string
  userId: string
  specialtyId?: string
  patientId: string
}

interface FilterState {
  userId?: string
  specialtyId?: string
  patientId?: string
  startDate?: Date
  endDate?: Date
}

interface Patient {
  id: string
  firstName: string
  lastName: string
}

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  specialties: {
    specialtyId: string
    specialty: { name: string }
  }[]
}

export default function AppointmentsPage() {
  const { t } = useI18n()
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [kpis, setKpis] = useState<KPIs>({ today: 0, pending: 0, cancelled: 0 })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<'agenda' | 'list'>('agenda')
  const [timeView, setTimeView] = useState<'day' | 'week' | 'month'>('day')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [filters, setFilters] = useState<FilterState>({})
  const [patients, setPatients] = useState<Patient[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  useEffect(() => {
    fetchKpis()
    fetchAppointments()
    fetchPatients()
    fetchTeam()
  }, [])

  const fetchKpis = async () => {
    try {
      const res = await fetch(`${API_URL}/appointments/kpis`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setKpis(data)
      }
    } catch (error) {
      console.error('Failed to fetch KPIs:', error)
    }
  }

  const fetchAppointments = async () => {
    try {
      const url = new URL(`${API_URL}/appointments`)
      url.searchParams.set('limit', '100')

      const res = await fetch(url.toString(), { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setAppointments(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const url = new URL(`${API_URL}/patients`)
      url.searchParams.set('limit', '200')

      const res = await fetch(url.toString(), { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setPatients(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    }
  }

  const fetchTeam = async () => {
    try {
      const url = new URL(`${API_URL}/team`)
      url.searchParams.set('limit', '100')
      url.searchParams.set('status', 'ACTIVE')

      const res = await fetch(url.toString(), { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setTeamMembers(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch team:', error)
    }
  }

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    setAppointments(prev =>
      prev.map(a => a.id === appointmentId ? { ...a, status: newStatus } : a)
    )
    fetchKpis()
  }

  const filteredAppointments = useMemo(() => {
    let result = [...appointments]
    if (filters.userId) result = result.filter(a => a.userId === filters.userId)
    if (filters.specialtyId) result = result.filter(a => a.specialtyId === filters.specialtyId)
    if (filters.patientId) result = result.filter(a => a.patientId === filters.patientId)
    if (filters.startDate) {
      const start = new Date(filters.startDate)
      start.setHours(0, 0, 0, 0)
      result = result.filter(a => new Date(a.scheduledAt) >= start)
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate)
      end.setHours(23, 59, 59, 999)
      result = result.filter(a => new Date(a.scheduledAt) <= end)
    }
    return result
  }, [appointments, filters])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-24"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.15rem] text-primary/60 mb-2 block dark:text-primary/40">
            {t('appointments.agenda.title')}
          </span>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight dark:text-white">
            {t('appointments.agenda.title')}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-surface-container-low dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => { setView('agenda'); setTimeView('day') }}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                view === 'agenda' && timeView === 'day'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                  : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              {t('appointments.agenda.day')}
            </button>
            <button
              onClick={() => { setView('agenda'); setTimeView('week') }}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                view === 'agenda' && timeView === 'week'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                  : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
              }`}
            >
              {t('appointments.agenda.week')}
            </button>
            <button
              onClick={() => { setView('agenda'); setTimeView('month') }}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                view === 'agenda' && timeView === 'month'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                  : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
              }`}
            >
              {t('appointments.agenda.month')}
            </button>
          </div>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
              view === 'list'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container-highest dark:bg-slate-700 text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
            }`}
          >
            <List className="w-4 h-4" />
            {t('appointments.agenda.listed')}
          </button>
          <button
            onClick={() => router.push(`/${slug}/operations/appointments/new`)}
            className="flex items-center space-x-2 bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('appointments.directory.newTitle')}</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-container-lowest dark:bg-slate-800 p-6 rounded-2xl shadow-[0_40px_60px_-15px_rgba(0,0,0,0.04)] flex items-center space-x-6 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary-fixed dark:bg-primary/20 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface-variant mb-1 dark:text-slate-400">
              {t('appointments.directory.today')}
            </p>
            <h3 className="text-3xl font-extrabold text-primary dark:text-white">{kpis.today}</h3>
            <p className="text-[10px] text-green-600 dark:text-green-400 font-bold mt-1">+12% vs ayer</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-container-lowest dark:bg-slate-800 p-6 rounded-2xl shadow-[0_40px_60px_-15px_rgba(0,0,0,0.04)] flex items-center space-x-6 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-secondary-container dark:bg-yellow-900/30 flex items-center justify-center text-secondary dark:text-yellow-400 transition-transform group-hover:scale-110">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface-variant mb-1 dark:text-slate-400">
              {t('appointments.directory.pendingConfirmation')}
            </p>
            <h3 className="text-3xl font-extrabold text-primary dark:text-white">{kpis.pending}</h3>
            <p className="text-[10px] text-primary/40 font-bold mt-1 dark:text-slate-500">Revisión requerida</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface-container-lowest dark:bg-slate-800 p-6 rounded-2xl shadow-[0_40px_60px_-15px_rgba(0,0,0,0.04)] flex items-center space-x-6 group border-l-4 border-error/10"
        >
          <div className="w-14 h-14 rounded-2xl bg-error-container dark:bg-red-900/30 flex items-center justify-center text-error dark:text-red-400 transition-transform group-hover:scale-110">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface-variant mb-1 dark:text-slate-400">
              {t('appointments.directory.cancelledAppointments')}
            </p>
            <h3 className="text-3xl font-extrabold text-primary dark:text-white">{kpis.cancelled}</h3>
            <p className="text-[10px] text-error/60 dark:text-error/40 font-bold mt-1">-5% vs media semanal</p>
          </div>
        </motion.div>
      </div>

      {/* Unified Filters (always visible, persists across views) */}
      <UnifiedFilters
        filters={filters}
        onFilterChange={setFilters}
        patients={patients}
        teamMembers={teamMembers}
      />

      {/* View Content */}
      {view === 'agenda' ? (
        <AgendaView
          appointments={filteredAppointments}
          timeView={timeView}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <>
          <AppointmentsTable appointments={filteredAppointments} isLoading={isLoading} onStatusChange={handleStatusChange} />
          <div className="bg-surface-container-low/30 dark:bg-slate-800/50 px-8 py-4 flex items-center justify-between">
            <span className="text-xs text-on-surface-variant dark:text-slate-400 font-medium">
              {t('appointments.directory.showing')} {filteredAppointments.length} {t('appointments.directory.ofRecords')}
            </span>
          </div>
        </>
      )}
    </motion.div>
  )
}
