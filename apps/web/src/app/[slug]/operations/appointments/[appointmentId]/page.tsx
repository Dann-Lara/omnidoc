'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, User, Stethoscope, MapPin, FileText } from 'lucide-react'

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
}

export default function AppointmentDetailPage() {
  const { t } = useI18n()
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const appointmentId = params.appointmentId as string

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAppointment()
  }, [appointmentId])

  const fetchAppointment = async () => {
    try {
      const res = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setAppointment(data)
      }
    } catch (error) {
      console.error('Failed to fetch appointment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'SCHEDULED': 'bg-green-100 text-green-700',
      'IN_PROGRESS': 'bg-blue-100 text-blue-700',
      'COMPLETED': 'bg-gray-100 text-gray-700',
      'CANCELLED': 'bg-red-100 text-red-700',
      'NO_SHOW': 'bg-slate-100 text-slate-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="pt-24 pb-24 px-8 w-full max-w-7xl mx-auto">
        <p className="text-on-surface-variant">{t('appointments.directory.notFound')}</p>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-24 px-8 w-full max-w-7xl mx-auto">
      <header className="mb-10">
        <button
          onClick={() => router.push(`/${slug}/operations/appointments`)}
          className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('appointments.directory.title')}
        </button>
        <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">
          {t('appointments.form.editTitle')}
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-6">Información de la Cita</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-on-surface-variant uppercase">Fecha</p>
                  <p className="font-bold text-on-surface">
                    {new Date(appointment.scheduledAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-on-surface-variant uppercase">Hora</p>
                  <p className="font-bold text-on-surface">
                    {new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' '}({appointment.duration} min)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-on-surface-variant uppercase">Paciente</p>
                  <p className="font-bold text-on-surface">
                    {appointment.patient.firstName} {appointment.patient.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Stethoscope className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-on-surface-variant uppercase">Médico</p>
                  <p className="font-bold text-on-surface">
                    Dr. {appointment.user.firstName} {appointment.user.lastName}
                  </p>
                </div>
              </div>

              {appointment.specialty && (
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase">Especialidad</p>
                    <p className="font-bold text-on-surface">
                      {appointment.specialty.specialty.name}
                    </p>
                  </div>
                </div>
              )}

              {appointment.room && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase">Sala</p>
                    <p className="font-bold text-on-surface">{appointment.room}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-5 h-5 text-primary" />
                <p className="text-xs text-on-surface-variant uppercase">Motivo</p>
              </div>
              <p className="text-on-surface">{appointment.reason || 'No especificado'}</p>
            </div>

            <div className="mt-4">
              <p className="text-xs text-on-surface-variant uppercase mb-2">Estado</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs text-on-surface-variant uppercase mb-2">Modalidad</p>
              <p className="text-on-surface font-medium">
                {appointment.mode === 'IN_PERSON' ? t('appointments.form.inPerson') : t('appointments.form.telehealth')}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
            <button
              onClick={() => router.push(`/${slug}/operations/appointments/${appointmentId}/edit`)}
              className="w-full bg-gradient-to-br from-primary to-primary-container text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Editar Cita
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
