'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { AppointmentForm } from '../components/AppointmentForm'
import { DateTimePicker } from '../components/DateTimePicker'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

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

export default function NewAppointmentPage() {
  const { t } = useI18n()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string || ''

  const prefillUserId = searchParams.get('userId') || ''
  const prefillSpecialtyId = searchParams.get('specialtyId') || ''

  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: '',
    userId: prefillUserId,
    specialtyId: prefillSpecialtyId,
    duration: 30,
    type: '',
    mode: 'IN_PERSON',
    room: '',
    reason: '',
  })
  const [scheduledAt, setScheduledAt] = useState('')
  const [time, setTime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (prefillUserId) {
      setFormData(prev => ({ ...prev, userId: prefillUserId }))
    }
    if (prefillSpecialtyId) {
      setFormData(prev => ({ ...prev, specialtyId: prefillSpecialtyId }))
    }
  }, [prefillUserId, prefillSpecialtyId])

  const handleSubmit = async () => {
    if (!formData.patientId || !scheduledAt || !time) return

    setIsSubmitting(true)
    try {
      const [hourStr, minuteStr] = time.split(':')
      let hours = parseInt(hourStr, 10)
      const minutes = parseInt(minuteStr?.replace(/\D/g, '') || '0', 10)
      
      if (time.includes('PM') && hours !== 12) hours += 12
      if (time.includes('AM') && hours === 12) hours = 0
      
      const isoTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`
      const scheduledAtISO = `${scheduledAt}T${isoTime}`

      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          scheduledAt: scheduledAtISO,
        }),
      })

      if (response.ok) {
        router.push(`/${slug}/operations/appointments`)
      }
    } catch (error) {
      console.error('Failed to create appointment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDateTimeSelect = (date: string, time: string) => {
    setScheduledAt(date)
    setTime(time)
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
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-primary">
              {t('appointments.form.newTitle')}
            </h1>
            <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant/70">
              Medical Center Operations
            </p>
          </div>
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
            hideDateTime={true}
          />
        </div>

        {/* Right: Calendar + Summary */}
        <div className="col-span-1 lg:col-span-4">
          <div className="sticky top-32 space-y-8">
            {/* Calendar Widget */}
            <DateTimePicker
              date={scheduledAt}
              time={time}
              onSelect={handleDateTimeSelect}
            />

            {/* Summary Card */}
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
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 pt-8 border-t border-slate-200">
        <div className="flex items-center justify-between">
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
  )
}
