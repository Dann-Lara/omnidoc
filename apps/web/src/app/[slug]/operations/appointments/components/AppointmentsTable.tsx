'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, Stethoscope, Edit, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { StatusBadge } from '@/components/appointments/StatusBadge'

interface Patient {
  id: string
  firstName: string
  lastName: string
}

interface User {
  id: string
  firstName: string
  lastName: string
}

interface Specialty {
  id: string
  nameEn: string
  nameEs: string
}

interface Appointment {
  id: string
  patient: Patient
  user: User
  specialty?: Specialty
  scheduledAt: string
  status: string
  room?: string
  type: string
}

interface AppointmentsTableProps {
  appointments: Appointment[]
  isLoading: boolean
  onStatusChange?: (appointmentId: string, newStatus: string) => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function AppointmentsTable({ appointments, isLoading, onStatusChange }: AppointmentsTableProps) {
  const { t } = useI18n()
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

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
      setOpenMenuId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl shadow-sm p-8 dark:bg-slate-800">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()

    const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

    if (isToday) {
      return `Hoy, ${time}`
    }

    const dateFormatted = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    return `${dateFormatted}, ${time}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-[0_80px_100px_-20px_rgba(0,0,0,0.03)] dark:bg-slate-800"
    >
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low/50 dark:bg-slate-800/80">
            <th className="px-8 py-5 text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
              {t('appointments.directory.patient')}
            </th>
            <th className="px-8 py-5 text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
              {t('appointments.directory.doctor')}
            </th>
            <th className="px-8 py-5 text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
              {t('appointments.directory.specialty')}
            </th>
            <th className="px-8 py-5 text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
              {t('appointments.directory.dateTime')}
            </th>
            <th className="px-8 py-5 text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
              {t('appointments.directory.status')}
            </th>
            <th className="px-8 py-5 text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant dark:text-slate-400 text-right">
              {t('appointments.directory.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container-low dark:divide-slate-700">
          {appointments.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-8 py-12 text-center text-on-surface-variant dark:text-slate-400">
                {t('common.noResults')}
              </td>
            </tr>
          ) : (
            appointments.map((appointment, index) => {
              const specialtyName = appointment.specialty
                ? (appointment.specialty.nameEs || appointment.specialty.nameEn)
                : 'N/A'

              return (
                <motion.tr
                  key={appointment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary/5 dark:bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                        {getInitials(appointment.patient.firstName, appointment.patient.lastName)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary dark:text-white">
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </p>
                        <p className="text-xs text-on-surface-variant dark:text-slate-400">
                          ID: {appointment.patient.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="w-4 h-4 text-primary-container/60" />
                      <span className="text-sm font-medium text-on-surface dark:text-slate-300">
                        {appointment.user.firstName} {appointment.user.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-surface-container dark:bg-slate-700 text-on-secondary-container dark:text-slate-300">
                      {specialtyName}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div>
                      <p className="text-sm font-bold text-on-surface dark:text-white">
                        {formatDateTime(appointment.scheduledAt)}
                      </p>
                      {appointment.room && (
                        <p className="text-[11px] text-on-surface-variant dark:text-slate-400">
                          {appointment.room}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <StatusBadge status={appointment.status} />
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity relative">
                      <button
                        onClick={() => router.push(`/${slug}/operations/appointments/${appointment.id}/edit`)}
                        className="p-2 hover:bg-surface-container dark:hover:bg-slate-700 rounded-lg text-on-surface-variant dark:text-slate-400 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED' || appointment.status === 'IN_PROGRESS') && (
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === appointment.id ? null : appointment.id)}
                            className="p-2 hover:bg-surface-container dark:hover:bg-slate-700 rounded-lg text-on-surface-variant dark:text-slate-400 transition-colors"
                          >
                            <Calendar className="w-5 h-5" />
                          </button>
                          {openMenuId === appointment.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                              <div className="absolute right-0 top-full mt-1 w-48 bg-surface-container-lowest dark:bg-slate-800 rounded-xl shadow-xl border border-outline-variant/20 dark:border-slate-700 z-20 py-1 overflow-hidden">
                                {appointment.status === 'SCHEDULED' && (
                                  <button
                                    onClick={() => handleStatusChange(appointment.id, 'CONFIRMED')}
                                    disabled={confirmingId === appointment.id}
                                    className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-surface-container dark:hover:bg-slate-700 text-on-surface dark:text-white disabled:opacity-50"
                                  >
                                    {confirmingId === appointment.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    )}
                                    {t('appointments.actions.confirm')}
                                  </button>
                                )}
                                {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && (
                                  <button
                                    onClick={() => handleStatusChange(appointment.id, 'CANCELED')}
                                    disabled={cancellingId === appointment.id}
                                    className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-surface-container dark:hover:bg-slate-700 text-error disabled:opacity-50"
                                  >
                                    {cancellingId === appointment.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <XCircle className="w-4 h-4" />
                                    )}
                                    {t('appointments.actions.cancel')}
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              )
            })
          )}
        </tbody>
      </table>
    </motion.div>
  )
}
