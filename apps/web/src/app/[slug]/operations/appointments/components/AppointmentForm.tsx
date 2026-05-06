'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'
import { Calendar, Stethoscope, MapPin, Video, Clock, FileText } from 'lucide-react'

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

interface User {
  id: string
  firstName: string
  lastName: string
  specialties?: Array<{
    specialtyId: string
    specialty: { name: string }
  }>
}

interface Specialty {
  specialtyId: string
  specialty: {
    name: string
  }
}

interface AppointmentFormProps {
  value: AppointmentFormData
  onChange: (data: AppointmentFormData) => void
  onSubmit: () => void
  isSubmitting: boolean
  hideDateTime?: boolean
}

export function AppointmentForm({ value, onChange, onSubmit, isSubmitting, hideDateTime = false }: AppointmentFormProps) {
  const { t } = useI18n()

  const [patients, setPatients] = useState<Array<{ id: string; firstName: string; lastName: string }>>([])
  const [users, setUsers] = useState<User[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])

  useEffect(() => {
    fetchPatients()
    fetchUsers()
    fetchSpecialties()
  }, [])

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_URL}/patients`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setPatients(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/team`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const fetchSpecialties = async () => {
    try {
      const res = await fetch(`${API_URL}/my-specialties`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setSpecialties(data.map((s: any) => ({
          specialtyId: s.id,
          specialty: {
            name: s.nameEs || s.nameEn,
          },
        })))
      }
    } catch (error) {
      console.error('Failed to fetch specialties:', error)
    }
  }

  const selectedPatient = patients.find(p => p.id === value.patientId)
  const selectedUser = users.find(u => u.id === value.userId)
  const selectedSpecialty = specialties.find(s => s.specialtyId === value.specialtyId)

  const availableSpecialties = value.userId && selectedUser?.specialties && selectedUser.specialties.length > 0
    ? selectedUser.specialties
    : specialties

  return (
    <div className="space-y-8">
      {/* Patient Selection */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary tracking-tight">{t('appointments.form.patient')}</h2>
          <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase rounded-full">
            {t('appointments.form.required')}
          </span>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
          <select
            className="w-full bg-surface-container-high border border-slate-200 rounded-lg py-3 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/20"
            value={value.patientId}
            onChange={(e) => onChange({ ...value, patientId: e.target.value })}
            required
          >
            <option value="">{t('appointments.form.selectPatient')}</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
          {selectedPatient && (
              <div className="mt-4 flex items-center gap-4 p-4 bg-surface-container rounded-lg">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
              </div>
              <div>
                <p className="font-bold text-on-surface">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Doctor & Specialty */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight mb-6">{t('appointments.form.doctor')}</h2>
          <select
            className="w-full bg-surface-container-lowest border border-slate-200 rounded-xl py-3 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 shadow-sm"
            value={value.userId}
            onChange={(e) => onChange({ ...value, userId: e.target.value, specialtyId: '' })}
            required
          >
            <option value="">{t('appointments.form.selectDoctor')}</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                Dr. {u.firstName} {u.lastName}
              </option>
            ))}
          </select>
          {selectedUser && (
            <div className="mt-4 flex items-center gap-2 text-sm text-on-surface">
              <Stethoscope className="w-4 h-4 text-primary-container" />
              <span>{selectedUser.firstName} {selectedUser.lastName}</span>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight mb-6">{t('appointments.form.specialty')}</h2>
          <select
            className="w-full bg-surface-container-lowest border border-slate-200 rounded-xl py-3 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 shadow-sm"
            value={value.specialtyId}
            onChange={(e) => onChange({ ...value, specialtyId: e.target.value })}
            disabled={!value.userId || availableSpecialties.length === 0}
          >
            <option value="">{availableSpecialties.length === 0 && value.userId ? t('appointments.form.noSpecialtiesForDoctor') : t('appointments.form.noSpecialty')}</option>
            {availableSpecialties.map((s) => (
              <option key={s.specialtyId} value={s.specialtyId}>
                {s.specialty.name}
              </option>
            ))}
          </select>
          {selectedSpecialty && (
            <div className="mt-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container">
                {selectedSpecialty.specialty.name}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Mode & Room */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight mb-6">
            {t('appointments.form.duration')}
          </h2>
          <select
            className="w-full bg-surface-container-lowest border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 shadow-sm"
            value={value.duration}
            onChange={(e) => onChange({ ...value, duration: parseInt(e.target.value) })}
          >
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
          </select>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight mb-6">
            {t('appointments.form.mode')}
          </h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onChange({ ...value, mode: 'IN_PERSON' })}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                value.mode === 'IN_PERSON'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-slate-200'
              }`}
            >
              <MapPin className="w-4 h-4" />
              {t('appointments.form.inPerson')}
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...value, mode: 'TELEHEALTH' })}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                value.mode === 'TELEHEALTH'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-slate-200'
              }`}
            >
              <Video className="w-4 h-4" />
              {t('appointments.form.telehealth')}
            </button>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight mb-6">
            {t('appointments.form.room')}
          </h2>
          <input
            type="text"
            className="w-full bg-surface-container-lowest border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 shadow-sm"
            placeholder={t('appointments.form.roomPlaceholder')}
            value={value.room}
            onChange={(e) => onChange({ ...value, room: e.target.value })}
          />
        </div>
      </section>

      {/* Reason */}
      <section>
        <h2 className="text-2xl font-bold text-primary tracking-tight mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          {t('appointments.form.reason')}
        </h2>
        <textarea
          className="w-full bg-surface-container-lowest border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 shadow-sm min-h-[120px]"
          placeholder={t('appointments.form.reasonPlaceholder')}
          value={value.reason}
          onChange={(e) => onChange({ ...value, reason: e.target.value })}
        />
      </section>

      {/* Submit Button - Mobile */}
      <div className="md:hidden sticky bottom-0 bg-white/90 backdrop-blur-xl p-4 -mx-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl text-sm font-extrabold shadow-lg hover:shadow-primary/20 active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <Calendar className="w-5 h-5" />
          {isSubmitting ? t('appointments.form.saving') : t('appointments.form.confirm')}
        </button>
      </div>
    </div>
  )
}
