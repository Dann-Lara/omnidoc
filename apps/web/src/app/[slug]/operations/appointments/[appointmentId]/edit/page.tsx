'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, Trash2, Loader2, Mail, History, Activity, Clock, FileText } from 'lucide-react'
import { AppointmentForm } from '../../components/AppointmentForm'
import { DateTimePicker } from '../../components/DateTimePicker'
import { StatusBadge, getStatusOptions } from '@/components/appointments/StatusBadge'
import { ConfirmModal } from '@/components/Modal'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Appointment {
  id: string
  scheduledAt: string
  duration: number
  status: string
  type: string
  reason?: string
  room?: string
  mode: string
  patientId: string
  userId: string
  specialtyId?: string
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
    specialty: {
      name: string
    }
  }
  createdAt: string
  updatedAt: string
}

interface AuditEntry {
  id: string
  action: string
  field: string
  oldValue: string
  newValue: string
  timestamp: string
  user: string
}

interface AppointmentFormData {
  patientId: string
  userId: string
  specialtyId: string
  duration: number
  type: string
  mode: string
  room: string
  reason: string
}

export default function EditAppointmentPage() {
  const { t } = useI18n()
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const appointmentId = params.appointmentId as string

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: '',
    userId: '',
    specialtyId: '',
    duration: 30,
    type: '',
    mode: 'IN_PERSON',
    room: '',
    reason: '',
  })
  const [scheduledAt, setScheduledAt] = useState('')
  const [time, setTime] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isResendingEmail, setIsResendingEmail] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error' | 'no-email'>('idle')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])

  useEffect(() => {
    fetchAppointment()
  }, [appointmentId])

  const fetchAppointment = async () => {
    try {
      const [appointmentRes, auditRes] = await Promise.all([
        fetch(`${API_URL}/appointments/${appointmentId}`, { credentials: 'include' }),
        fetch(`${API_URL}/appointments/${appointmentId}/audit-log`, { credentials: 'include' }),
      ])

      if (appointmentRes.ok) {
        const data = await appointmentRes.json()
        setAppointment(data)
        setFormData({
          patientId: data.patientId,
          userId: data.userId,
          specialtyId: data.specialtyId || '',
          duration: data.duration,
          type: data.type || '',
          mode: data.mode,
          room: data.room || '',
          reason: data.reason || '',
        })
        setScheduledAt(data.scheduledAt?.split('T')[0] || '')
        const rawTime = data.scheduledAt?.split('T')[1]?.slice(0, 5) || ''
        const [h, m] = rawTime.split(':')
        const hours = parseInt(h, 10)
        const ampm = hours >= 12 ? 'PM' : 'AM'
        const displayHours = hours % 12 || 12
        setTime(`${displayHours.toString().padStart(2, '0')}:${m} ${ampm}`)
      }

      if (auditRes.ok) {
        const auditData = await auditRes.json()
        setAuditLog(auditData.map((entry: { id: string; action: string; resourceType: string; metadata: { field?: string; oldValue?: string; newValue?: string } | null; createdAt: string; userId: string }) => ({
          id: entry.id,
          action: entry.action,
          field: entry.metadata?.field || entry.resourceType,
          oldValue: entry.metadata?.oldValue || '—',
          newValue: entry.metadata?.newValue || '—',
          timestamp: entry.createdAt,
          user: entry.userId,
        })))
      }
    } catch (error) {
      console.error('Failed to fetch appointment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!scheduledAt || !time) return

    setIsSubmitting(true)
    try {
      const [hourStr, minuteStr] = time.split(':')
      let hours = parseInt(hourStr, 10)
      const minutes = parseInt(minuteStr?.replace(/\D/g, '') || '0', 10)
      
      if (time.includes('PM') && hours !== 12) hours += 12
      if (time.includes('AM') && hours === 12) hours = 0
      
      const isoTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`
      const scheduledAtISO = `${scheduledAt}T${isoTime}`

      const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          scheduledAt: scheduledAtISO,
          specialtyId: formData.specialtyId || undefined,
        }),
      })

      if (response.ok) {
        router.push(`/${slug}/operations/appointments`)
      }
    } catch (error) {
      console.error('Failed to update appointment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      router.push(`/${slug}/operations/appointments`)
    } catch (error) {
      console.error('Failed to delete appointment:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleResendEmail = async () => {
    setIsResendingEmail(true)
    setEmailStatus('idle')

    try {
      const res = await fetch(`${API_URL}/appointments/${appointmentId}/resend-email`, {
        method: 'POST',
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setEmailStatus('success')
        } else {
          setEmailStatus('no-email')
        }
      } else {
        setEmailStatus('error')
      }
    } catch (error) {
      console.error('Failed to resend email:', error)
      setEmailStatus('error')
    } finally {
      setIsResendingEmail(false)
      setTimeout(() => setEmailStatus('idle'), 5000)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setIsChangingStatus(true)
    try {
      const res = await fetch(`${API_URL}/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        const data = await res.json()
        setAppointment(prev => prev ? { ...prev, status: data.status } : null)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setIsChangingStatus(false)
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
    <div className="pt-4 pb-24 px-8 max-w-7xl mx-auto">
      {/* Title Section */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/${slug}/operations/appointments`)}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-semibold text-sm">{t('common.back')}</span>
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-primary">
                {t('appointments.form.editTitle')}
              </h1>
              <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant/70">
                Record ID: #{appointment?.id?.slice(0, 8)}
              </p>
            </div>
          </div>
          {appointment && (
            <StatusBadge status={appointment.status} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Form */}
        <div className="col-span-1 lg:col-span-8">
          <AppointmentForm
            value={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Right: Actions + Status + Audit */}
        <div className="col-span-1 lg:col-span-4">
          <div className="sticky top-32 space-y-6">
            {/* Quick Status Change */}
            {appointment && (
              <div className="bg-surface-container-lowest dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-surface-container dark:border-slate-700">
                <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400 mb-4 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" />
                  Quick Status
                </h4>
                <div className="flex flex-wrap gap-2">
                  {getStatusOptions().map(opt => {
                    const isActive = appointment.status === opt.value
                    const canUse = !((opt.value === 'CONFIRMED' && (appointment.status === 'IN_PROGRESS' || appointment.status === 'COMPLETED' || appointment.status === 'CANCELED')) ||
                      (opt.value === 'SCHEDULED' && (appointment.status === 'COMPLETED' || appointment.status === 'CANCELED' || appointment.status === 'IN_PROGRESS')) ||
                      (opt.value === 'COMPLETED' && (appointment.status === 'CANCELED')) ||
                      (opt.value === 'NO_SHOW' && (appointment.status === 'COMPLETED' || appointment.status === 'CANCELED')) ||
                      (opt.value === 'CANCELED' && (appointment.status === 'COMPLETED')))

                    if (!canUse) return null

                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleStatusChange(opt.value)}
                        disabled={isChangingStatus || isActive}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-primary text-white shadow-md'
                            : opt.value === 'CANCELED'
                            ? 'bg-error/10 text-error hover:bg-error/20'
                            : opt.value === 'COMPLETED'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                            : opt.value === 'NO_SHOW'
                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            : 'bg-surface-container dark:bg-slate-700 text-on-surface dark:text-white hover:bg-surface-container-high dark:hover:bg-slate-600'
                        } disabled:opacity-50`}
                      >
                        {isChangingStatus ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          t(opt.key)
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* DateTime Picker */}
            <DateTimePicker
              date={scheduledAt}
              time={time}
              onSelect={(date, time) => {
                setScheduledAt(date)
                setTime(time)
              }}
            />

            {/* Summary Card */}
            {appointment && (
              <div className="bg-primary p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <CheckCircle className="w-20 h-20" />
                </div>
                <h4 className="text-sm font-extrabold uppercase tracking-widest opacity-80 mb-6">{t('appointments.form.summary.title')}</h4>
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-medium opacity-70">{t('appointments.form.summary.date')}</span>
                    <span className="text-sm font-bold">{scheduledAt || '--'}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-medium opacity-70">{t('appointments.form.summary.time')}</span>
                    <span className="text-sm font-bold">{time || '--'} ({formData.duration} min)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium opacity-70">{t('appointments.form.summary.mode')}</span>
                    <span className="text-sm font-bold">{formData.mode === 'IN_PERSON' ? t('appointments.directory.inPerson') : t('appointments.directory.telehealth')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Audit Log */}
            {auditLog.length > 0 && (
              <div className="bg-surface-container-lowest dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-surface-container dark:border-slate-700">
                <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400 mb-4 flex items-center gap-2">
                  <History className="w-3.5 h-3.5" />
                  Audit Log
                </h4>
                <div className="space-y-3">
                  {auditLog.map(entry => (
                    <div key={entry.id} className="flex items-start gap-3 pb-3 border-b border-surface-container dark:border-slate-700 last:border-0 last:pb-0">
                      <div className="w-7 h-7 rounded-lg bg-surface-container dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <Clock className="w-3.5 h-3.5 text-on-surface-variant dark:text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-on-surface dark:text-white">
                          {entry.action}
                        </p>
                        <p className="text-[10px] text-on-surface-variant dark:text-slate-500 truncate">
                          {entry.field}: {entry.oldValue} → {entry.newValue}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">
                          {new Date(entry.timestamp).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-3 text-sm font-extrabold text-error hover:bg-error/5 rounded-lg transition-colors uppercase tracking-widest flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {t('common.delete')}
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={isResendingEmail}
              className={`px-6 py-3 text-sm font-extrabold rounded-lg transition-colors uppercase tracking-widest flex items-center gap-2 ${
                emailStatus === 'success'
                  ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                  : emailStatus === 'no-email' || emailStatus === 'error'
                  ? 'text-error bg-error/5'
                  : 'text-primary hover:bg-primary/5'
              }`}
            >
              {isResendingEmail ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              {emailStatus === 'success'
                ? t('appointments.emailSent')
                : emailStatus === 'no-email'
                ? t('appointments.emailNoPatientEmail')
                : emailStatus === 'error'
                ? t('appointments.emailFailed')
                : t('appointments.resendEmail')}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/${slug}/operations/appointments`)}
              className="px-8 py-3 text-sm font-extrabold text-on-surface-variant hover:text-error transition-colors uppercase tracking-widest"
            >
              {t('appointments.form.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-10 py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-lg text-sm font-extrabold shadow-lg hover:shadow-primary/20 active:scale-95 transition-all uppercase tracking-widest flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {isSubmitting ? t('appointments.form.saving') : t('appointments.form.save')}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('appointments.form.deleteConfirm')}
        confirmText={t('common.delete')}
        isLoading={isDeleting}
        variant="danger"
      >
        <p className="text-on-surface-variant dark:text-slate-400">
          {t('appointments.form.deleteDescription') || 'Esta acción no se puede deshacer.'}
        </p>
      </ConfirmModal>
    </div>
  )
}
