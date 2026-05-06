'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, AlertTriangle, Plus, Sparkles, Map, DoorOpen, ChevronLeft, ChevronRight, Pencil, FileText, XCircle, Loader2, Clock, User, Stethoscope, X, EllipsisVertical } from 'lucide-react'

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
  mode?: string
  room?: string
  type: string
  userId?: string
  specialtyId?: string
}

interface AgendaViewProps {
  appointments: Appointment[]
  timeView: 'day' | 'week' | 'month'
  selectedDate: Date
  onDateChange: (date: Date) => void
  onStatusChange?: (appointmentId: string, newStatus: string) => void
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8)
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function AgendaView({ appointments, timeView, selectedDate, onDateChange, onStatusChange }: AgendaViewProps) {
  const { t, lang } = useI18n()
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    const isConfirm = newStatus === 'CONFIRMED'
    isConfirm ? setConfirmingId(appointmentId) : setCancellingId(appointmentId)
    try {
      const res = await fetch(`${API_URL}/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok && onStatusChange) {
        onStatusChange(appointmentId, newStatus)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setConfirmingId(null)
      setCancellingId(null)
    }
  }

  const formatHour = (hour: number) => `${hour.toString().padStart(2, '0')}:00`

  const formatDate = (date: Date) => {
    const month = lang === 'es' ? MONTHS_ES[date.getMonth()] : MONTHS[date.getMonth()]
    return `${month} ${date.getDate()}, ${date.getFullYear()}`
  }

  const prevDay = () => {
    const prev = new Date(selectedDate)
    prev.setDate(prev.getDate() - 1)
    onDateChange(prev)
  }

  const nextDay = () => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + 1)
    onDateChange(next)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  const getCardStyle = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { bg: 'bg-secondary-container/40 dark:bg-secondary-container/20', border: 'border-secondary', textColor: 'text-on-secondary-container', statusText: 'appointments.agenda.confirmed', icon: CheckCircle }
      case 'IN_PROGRESS':
        return { bg: 'bg-tertiary-container/10 dark:bg-tertiary-container/5', border: 'border-tertiary-container', textColor: 'text-tertiary-container', statusText: 'appointments.agenda.arrived', icon: DoorOpen }
      case 'SCHEDULED':
        return { bg: 'bg-primary-fixed/30 dark:bg-primary/10', border: 'border-primary', textColor: 'text-primary', statusText: 'appointments.agenda.scheduled', icon: CheckCircle }
      case 'CANCELED':
        return { bg: 'bg-error-container/50 dark:bg-red-900/20', border: 'border-error', textColor: 'text-error', statusText: 'appointments.agenda.highRisk', icon: AlertTriangle }
      default:
        return { bg: 'bg-surface-container dark:bg-slate-700/50', border: 'border-outline-variant', textColor: 'text-on-surface-variant', statusText: '', icon: CheckCircle }
    }
  }

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-500'
      case 'IN_PROGRESS': return 'bg-tertiary-container'
      case 'SCHEDULED': return 'bg-primary'
      case 'CANCELED': return 'bg-error'
      case 'COMPLETED': return 'bg-blue-500'
      case 'NO_SHOW': return 'bg-slate-400'
      default: return 'bg-outline-variant'
    }
  }

  const getDayAppointments = (date: Date) => {
    return appointments.filter(a => {
      const d = new Date(a.scheduledAt)
      return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate()
    })
  }

  const getHourAppointments = (hour: number, date?: Date) => {
    return appointments.filter(a => {
      const d = new Date(a.scheduledAt)
      const matchHour = d.getHours() === hour
      if (date) {
        return matchHour && d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate()
      }
      return matchHour
    })
  }

  const today = new Date()
  const todayDayOfWeek = today.getDay()
  const mondayOffset = todayDayOfWeek === 0 ? -6 : 1 - todayDayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const startOffset = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1

  const calendarDays: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) calendarDays.push(null)
  for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
    calendarDays.push(new Date(today.getFullYear(), today.getMonth(), d))
  }
  const remaining = 42 - calendarDays.length
  for (let i = 0; i < remaining; i++) calendarDays.push(null)

  const calendarWeeks: (Date | null)[][] = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    calendarWeeks.push(calendarDays.slice(i, i + 7))
  }

  const AppointmentCard = ({ appt, compact = false }: { appt: Appointment; compact?: boolean }) => {
    const cardStyle = getCardStyle(appt.status)
    const Icon = cardStyle.icon

    if (compact) {
      return (
        <div
          className={`${cardStyle.bg} rounded-lg px-2 py-1.5 cursor-pointer hover:shadow-md transition-all border-l-2 ${cardStyle.border}`}
          onClick={() => setSelectedAppt(appt)}
        >
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDotColor(appt.status)}`} />
            <span className="text-[10px] font-bold text-on-surface dark:text-white truncate">
              {appt.patient.firstName} {appt.patient.lastName[0]}.
            </span>
          </div>
        </div>
      )
    }

    return (
      <div className={`h-full ${cardStyle.bg} p-3 rounded-2xl border-l-4 ${cardStyle.border} group hover:shadow-md transition-all`}>
        <div className="flex justify-between items-start mb-1">
          <span className={`text-[9px] font-bold uppercase ${cardStyle.textColor}`}>
            {t(cardStyle.statusText)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedAppt(appt) }}
            className={`p-1 rounded-lg hover:bg-white/20 transition-colors ${cardStyle.textColor}`}
          >
            <EllipsisVertical className="w-4 h-4" />
          </button>
        </div>
        <h4 className="text-xs font-bold leading-tight text-on-surface dark:text-white truncate">
          {appt.patient.firstName} {appt.patient.lastName}
        </h4>
        <p className={`text-[9px] ${cardStyle.textColor} truncate`}>{appt.type}</p>
      </div>
    )
  }

  const AppointmentModal = () => {
    if (!selectedAppt) return null
    const appt = selectedAppt
    const cardStyle = getCardStyle(appt.status)
    const time = new Date(appt.scheduledAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    const date = new Date(appt.scheduledAt).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })
    const specialtyName = appt.specialty ? (lang === 'es' ? (appt.specialty.nameEs || appt.specialty.nameEn) : appt.specialty.nameEn) : '—'

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAppt(null)}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-surface-container-lowest dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className={`${cardStyle.bg} p-6 pb-4 border-l-4 ${cardStyle.border}`}>
            <button onClick={() => setSelectedAppt(null)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-5 h-5 text-on-surface dark:text-white" />
            </button>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${cardStyle.textColor}`}>
              {t(cardStyle.statusText)}
            </span>
            <h3 className="text-xl font-extrabold text-on-surface dark:text-white mt-1">
              {appt.patient.firstName} {appt.patient.lastName}
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-on-surface dark:text-white capitalize">{date}</p>
                <p className="text-xs text-on-surface-variant dark:text-slate-400">{time}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-on-surface dark:text-white">{appt.user.firstName} {appt.user.lastName}</p>
                <p className="text-xs text-on-surface-variant dark:text-slate-400">{specialtyName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Stethoscope className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-on-surface dark:text-white">{appt.type}</p>
                {appt.room && <p className="text-xs text-on-surface-variant dark:text-slate-400">{appt.room}</p>}
                <p className="text-xs text-on-surface-variant dark:text-slate-400">{appt.mode === 'TELEHEALTH' ? t('appointments.directory.telehealth') : t('appointments.directory.inPerson')}</p>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-wrap gap-2 mb-3">
              {appt.status === 'SCHEDULED' && (
                <button
                  onClick={() => handleStatusChange(appt.id, 'CONFIRMED')}
                  disabled={confirmingId === appt.id}
                  className="flex-1 px-4 py-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors disabled:opacity-50"
                >
                  {confirmingId === appt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {t('appointments.actions.confirm')}
                </button>
              )}
              {(appt.status === 'SCHEDULED' || appt.status === 'CONFIRMED') && (
                <button
                  onClick={() => handleStatusChange(appt.id, 'CANCELED')}
                  disabled={cancellingId === appt.id}
                  className="flex-1 px-4 py-2.5 bg-error/10 text-error rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-error/20 transition-colors disabled:opacity-50"
                >
                  {cancellingId === appt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  {t('appointments.actions.cancel')}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { router.push(`/${slug}/operations/appointments/${appt.id}/edit`); setSelectedAppt(null) }}
                className="flex-1 px-4 py-2.5 bg-surface-container dark:bg-slate-700 text-on-surface dark:text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-surface-container-high dark:hover:bg-slate-600 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                {t('appointments.agenda.edit')}
              </button>
              <button
                onClick={() => { router.push(`/${slug}/operations/patients/${appt.patient.id}/notes/new?userId=${appt.userId || appt.user.id}&specialtyId=${appt.specialtyId || ''}`); setSelectedAppt(null) }}
                className="flex-1 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
              >
                <FileText className="w-4 h-4" />
                {t('appointments.agenda.medicalNote')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  const EmptyCell = () => (
    <div
      className="w-full h-full border-2 border-dashed border-outline-variant/30 dark:border-slate-700/50 rounded-2xl flex items-center justify-center group-hover:bg-surface-container-low dark:hover:bg-slate-700/30 transition-all cursor-pointer"
      onClick={() => router.push(`/${slug}/operations/appointments/new`)}
    >
      <Plus className="w-4 h-4 text-outline-variant dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )

  const renderDayView = () => {
    const dayAppts = getDayAppointments(selectedDate)
    const isToday = selectedDate.toDateString() === today.toDateString()
    return (
      <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-surface-container-low dark:bg-slate-900 border-b border-surface-container-high dark:border-slate-700">
          <button
            onClick={prevDay}
            className="p-2 rounded-lg hover:bg-surface-container dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-on-surface dark:text-white" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-on-surface dark:text-white">
              {formatDate(selectedDate)}
            </span>
            {!isToday && (
              <button
                onClick={goToToday}
                className="px-3 py-1 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
              >
                {t('appointments.agenda.today')}
              </button>
            )}
            <span className="text-xs text-on-surface-variant dark:text-slate-500">
              ({dayAppts.length} {t('appointments.agenda.appointments')})
            </span>
          </div>
          <button
            onClick={nextDay}
            className="p-2 rounded-lg hover:bg-surface-container dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-on-surface dark:text-white" />
          </button>
        </div>
        {HOURS.map(hour => {
          const hourAppts = getHourAppointments(hour, selectedDate)
          return (
            <div key={hour} className="grid grid-cols-8 border-b border-surface-container-low dark:border-slate-700/50" style={{ minHeight: '100px' }}>
              <div className="col-span-1 p-3 flex items-start justify-center text-xs font-bold text-on-surface-variant dark:text-slate-500 opacity-50">
                {formatHour(hour)}
              </div>
              <div className="col-span-7 p-2 border-l border-surface-container-low dark:border-slate-700/50">
                {hourAppts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {hourAppts.map(appt => (
                      <AppointmentCard key={appt.id} appt={appt} />
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <EmptyCell />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderWeekView = () => (
    <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-3xl shadow-sm overflow-hidden">
      <div className="grid grid-cols-8 border-b border-surface-container-high dark:border-slate-700">
        <div className="p-3 bg-surface-container-low dark:bg-slate-900" />
        {weekDays.map((day, i) => (
          <div key={i} className="p-3 text-center border-l border-surface-container-high dark:border-slate-700">
            <span className="text-xs font-bold text-on-surface-variant dark:text-slate-400 uppercase">
              {lang === 'es' ? DAYS_ES[i] : DAYS[i]}
            </span>
            <div className={`text-lg font-bold mt-1 ${
              day.toDateString() === today.toDateString()
                ? 'bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto'
                : 'text-on-surface dark:text-white'
            }`}>
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>
      {HOURS.map(hour => (
        <div key={hour} className="grid grid-cols-8 border-b border-surface-container-low dark:border-slate-700/50" style={{ minHeight: '80px' }}>
          <div className="col-span-1 p-3 flex items-start justify-center text-xs font-bold text-on-surface-variant dark:text-slate-500 opacity-50">
            {formatHour(hour)}
          </div>
          {weekDays.map((day, i) => {
            const hourAppts = getHourAppointments(hour, day)
            return (
              <div key={i} className="p-1.5 border-l border-surface-container-low dark:border-slate-700/50">
                {hourAppts.length > 0 ? (
                  <div className="space-y-1.5">
                    {hourAppts.map(appt => (
                      <AppointmentCard key={appt.id} appt={appt} />
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <EmptyCell />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )

  const renderMonthView = () => (
    <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-3xl shadow-sm overflow-hidden">
      <div className="p-4 bg-surface-container-low dark:bg-slate-900 border-b border-surface-container-high dark:border-slate-700">
        <span className="text-lg font-bold text-on-surface dark:text-white">
          {lang === 'es' ? MONTHS_ES[today.getMonth()] : MONTHS[today.getMonth()]} {today.getFullYear()}
        </span>
      </div>
      <div className="grid grid-cols-7 border-b border-surface-container-high dark:border-slate-700">
        {(lang === 'es' ? DAYS_ES : DAYS).map(day => (
          <div key={day} className="p-3 text-center text-xs font-bold text-on-surface-variant dark:text-slate-500 uppercase">
            {day}
          </div>
        ))}
      </div>
      {calendarWeeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((day, di) => {
            if (!day) return <div key={di} className="min-h-[100px] border-l border-t border-surface-container-low dark:border-slate-700/50 bg-surface-container/30 dark:bg-slate-900/30" />
            const dayAppts = getDayAppointments(day)
            const isToday = day.toDateString() === today.toDateString()
            const confirmedCount = dayAppts.filter(a => a.status === 'CONFIRMED').length
            const pendingCount = dayAppts.filter(a => a.status === 'SCHEDULED').length
            const canceledCount = dayAppts.filter(a => a.status === 'CANCELED').length
            return (
              <div
                key={di}
                className={`min-h-[100px] p-2 border-l border-t border-surface-container-low dark:border-slate-700/50 cursor-pointer hover:bg-surface-container dark:hover:bg-slate-700/30 transition-colors ${isToday ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                onClick={() => { if (dayAppts.length > 0) setSelectedAppt(dayAppts[0]) }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-on-surface-variant dark:text-slate-400'}`}>
                    {day.getDate()}
                  </span>
                  {dayAppts.length > 0 && (
                    <span className="text-[10px] font-bold text-on-surface-variant dark:text-slate-500">
                      {dayAppts.length}
                    </span>
                  )}
                </div>
                {dayAppts.length > 0 && (
                  <div className="space-y-1">
                    {dayAppts.slice(0, 3).map(appt => (
                      <div key={appt.id} className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDotColor(appt.status)}`} />
                        <span className="text-[10px] text-on-surface dark:text-slate-300 truncate">
                          {appt.patient.firstName} {appt.patient.lastName[0]}.
                        </span>
                      </div>
                    ))}
                    {dayAppts.length > 3 && (
                      <span className="text-[10px] text-on-surface-variant dark:text-slate-500 font-medium pl-3.5">
                        +{dayAppts.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                {(confirmedCount > 0 || pendingCount > 0 || canceledCount > 0) && (
                  <div className="flex gap-0.5 mt-1.5">
                    {confirmedCount > 0 && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                    {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-primary" />}
                    {canceledCount > 0 && <span className="w-2 h-2 rounded-full bg-error" />}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="col-span-12 bg-primary text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden lg:col-span-4">
          <div className="z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-secondary-fixed" />
              <span className="text-xs font-bold uppercase tracking-widest text-secondary-fixed font-label">
                {t('appointments.agenda.aiInsight')}
              </span>
            </div>
            <h3 className="text-2xl font-bold font-headline leading-tight">{t('appointments.agenda.antiNoShow')}</h3>
            <p className="text-primary-fixed-dim text-sm mt-2">
              {t('appointments.agenda.antiNoShowDesc').replace('{count}', '0')}
            </p>
          </div>
          <button className="z-10 mt-4 px-4 py-2 bg-secondary-fixed text-primary text-xs font-bold rounded-xl w-fit hover:bg-secondary-fixed-dim transition-colors">
            {t('appointments.agenda.executeProtocol')}
          </button>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-surface-container dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-sm uppercase tracking-tight text-on-surface-variant dark:text-slate-400">
                {t('appointments.agenda.roomAvailability')}
              </h4>
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded">
                {t('appointments.agenda.optimal')}
              </span>
            </div>
            <div className="flex items-end gap-2 h-24">
              {[80, 40, 90, 20, 65, 50].map((h, i) => (
                <div key={i} className={`flex-1 rounded-t-lg ${i < 4 ? 'bg-primary dark:bg-primary/70' : 'bg-surface-container dark:bg-slate-700'}`} style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <p className="text-[11px] text-on-surface-variant dark:text-slate-500 mt-4">
              {t('appointments.agenda.roomDesc').replace('{active}', '4').replace('{total}', '6').replace('{time}', '14:00')}
            </p>
          </div>

          <div className="bg-surface-container-lowest dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-surface-container dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-sm uppercase tracking-tight text-on-surface-variant dark:text-slate-400">
                {t('appointments.agenda.doctorLatency')}
              </h4>
              <span className="px-2 py-0.5 bg-error-container dark:bg-red-900/30 text-error text-[10px] font-bold rounded">
                {t('appointments.agenda.warning')}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface dark:text-slate-300">Dr. Aristhone</span>
                <span className="text-xs font-bold text-error">+12m {t('appointments.agenda.delay')}</span>
              </div>
              <div className="w-full bg-surface-container dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-error w-3/4 h-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface dark:text-slate-300">Dr. Miller</span>
                <span className="text-xs font-bold text-on-tertiary-container">{t('appointments.agenda.onTime')}</span>
              </div>
              <div className="w-full bg-surface-container dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-on-tertiary-container w-1/4 h-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-surface-container dark:border-slate-700 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 rounded-full bg-secondary-container dark:bg-secondary/20 flex items-center justify-center mb-3">
              <Map className="w-8 h-8 text-primary dark:text-primary/80" />
            </div>
            <h4 className="font-bold text-lg text-primary dark:text-primary/90">{t('appointments.agenda.resourceMapping')}</h4>
            <p className="text-xs text-on-surface-variant dark:text-slate-400 px-4 mt-1">
              Cross-reference physical equipment with appointment needs.
            </p>
            <button className="mt-4 text-xs font-bold text-primary dark:text-primary/80 hover:underline">
              Launch Map View
            </button>
          </div>
        </div>
      </div>

      {timeView === 'day' && renderDayView()}
      {timeView === 'week' && renderWeekView()}
      {timeView === 'month' && renderMonthView()}

      <AppointmentModal />
    </div>
  )
}
