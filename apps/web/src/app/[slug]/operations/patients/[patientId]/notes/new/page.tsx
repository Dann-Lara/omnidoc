'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Verified, Lock, X } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Patient {
  id: string
  firstName: string
  lastName: string
  documentType: string | null
  documentId: string | null
  dateOfBirth: string | null
  gender: string | null
  bloodType: string | null
  allergies: string[]
  isChronic: boolean
  phone: string | null
  email: string | null
}

interface Specialty {
  id: string
  nameEn: string
  nameEs: string
}

interface Doctor {
  id: string
  firstName: string
  lastName: string
  specialties?: { specialtyId: string; specialty: { name: string } }[]
}

interface NoteFormData {
  bloodPressure: string
  heartRate: string
  temperature: string
  respRate: string
  oxygenSat: string
  weight: string
  height: string
  subjective: string
  diagnosis: string
  plan: string
  isChronic: boolean
  specialtyId: string
  userId: string
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 }
}

const slideIn = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 }
}

function calculateBMI(weight: number | null, height: number | null): number | null {
  if (!weight || !height) return null
  const heightInM = height / 100
  return Number((weight / (heightInM * heightInM)).toFixed(1))
}

function getBMICategory(bmi: number | null): string {
  if (!bmi) return ''
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

function getBMICategoryES(bmi: number | null): string {
  if (!bmi) return ''
  if (bmi < 18.5) return 'Bajo peso'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Sobrepeso'
  return 'Obeso'
}

function getBMIColor(bmi: number | null): { bg: string; text: string; label: string } {
  if (!bmi) return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', label: 'N/A' }
  if (bmi < 18.5) return { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-400', label: bmi < 18.5 ? 'Underweight' : '' }
  if (bmi < 25) return { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-400', label: 'Normal' }
  if (bmi < 30) return { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-400', label: 'Overweight' }
  return { bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-700 dark:text-rose-400', label: 'Obese' }
}

type VitalStatus = 'normal' | 'warning' | 'danger' | 'empty'

function getVitalStatus(value: number | null, type: 'bp' | 'hr' | 'temp' | 'rr' | 'spo2'): VitalStatus {
  if (value === null || isNaN(value)) return 'empty'
  
  switch (type) {
    case 'bp':
      if (value >= 90 && value <= 120) return 'normal'
      if (value >= 80 && value <= 130) return 'warning'
      return 'danger'
    case 'hr':
      if (value >= 60 && value <= 100) return 'normal'
      if (value >= 50 && value <= 110) return 'warning'
      return 'danger'
    case 'temp':
      if (value >= 36 && value <= 37.5) return 'normal'
      if (value >= 35.5 && value <= 38) return 'warning'
      return 'danger'
    case 'rr':
      if (value >= 12 && value <= 20) return 'normal'
      if (value >= 10 && value <= 24) return 'warning'
      return 'danger'
    case 'spo2':
      if (value >= 95) return 'normal'
      if (value >= 90) return 'warning'
      return 'danger'
    default:
      return 'empty'
  }
}

function getVitalColor(status: VitalStatus): { bg: string; border: string; text: string } {
  switch (status) {
    case 'normal':
      return { bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-600 dark:text-emerald-400' }
    case 'warning':
      return { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-600 dark:text-amber-400' }
    case 'danger':
      return { bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-600 dark:text-rose-400' }
    default:
      return { bg: '', border: '', text: 'text-on-surface-variant dark:text-slate-400' }
  }
}

export default function NewNotePage() {
  const { lang, t } = useI18n()
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const patientId = params.patientId as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSealModal, setShowSealModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [medicationItems, setMedicationItems] = useState<{ name: string; dosage: string }[]>([
    { name: '', dosage: '' }
  ])

  const prefillUserId = searchParams.get('userId') || ''
  const prefillSpecialtyId = searchParams.get('specialtyId') || ''

  const [formData, setFormData] = useState<NoteFormData>({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    respRate: '',
    oxygenSat: '',
    weight: '',
    height: '',
    subjective: '',
    diagnosis: '',
    plan: '',
    isChronic: false,
    specialtyId: prefillSpecialtyId,
    userId: prefillUserId,
  })

  useEffect(() => {
    fetchPatient()
    fetchSpecialties()
    fetchDoctors()
  }, [patientId])

  const fetchPatient = async () => {
    try {
      const res = await fetch(`${API_URL}/patients/${patientId}`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        const p = data.patient || data.data || data
        setPatient(p)
        setFormData(prev => ({ ...prev, isChronic: p.isChronic || false }))
      }
    } catch (err) {
      console.error('Failed to fetch patient:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSpecialties = async () => {
    try {
      const res = await fetch(`${API_URL}/my-specialties/for-notes`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setSpecialties(data)
      }
    } catch (err) {
      console.error('Failed to fetch specialties:', err)
    }
  }

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_URL}/team`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        console.log('[NewNotePage] doctors response:', JSON.stringify(data.data?.[0]?.specialties, null, 2))
        setDoctors(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err)
    }
  }

  const handleChange = (field: keyof NoteFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'userId') {
      setFormData(prev => ({ ...prev, specialtyId: '' }))
    }
    setError(null)
  }

  const addMedicationItem = () => {
    setMedicationItems([...medicationItems, { name: '', dosage: '' }])
  }

  const updateMedicationItem = (index: number, field: 'name' | 'dosage', value: string) => {
    const updated = [...medicationItems]
    updated[index][field] = value
    setMedicationItems(updated)
  }

  const removeMedicationItem = (index: number) => {
    if (medicationItems.length > 1) {
      setMedicationItems(medicationItems.filter((_, i) => i !== index))
    }
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      const payload = {
        ...formData,
        heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        respRate: formData.respRate ? parseInt(formData.respRate) : undefined,
        oxygenSat: formData.oxygenSat ? parseInt(formData.oxygenSat) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
      }

      const res = await fetch(`${API_URL}/patients/${patientId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setSuccess(t('clinicalNotes.form.noteSaved'))
        setTimeout(() => {
          router.push(`/${slug}/operations/patients/${patientId}/history`)
        }, 1500)
      } else {
        const err = await res.json()
        setError(err.message || 'Failed to save')
      }
    } catch (err) {
      setError('Failed to save note')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSeal = async () => {
    setIsSaving(true)
    try {
      const payload = {
        ...formData,
        heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        respRate: formData.respRate ? parseInt(formData.respRate) : undefined,
        oxygenSat: formData.oxygenSat ? parseInt(formData.oxygenSat) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        bmi: calculateBMI(
          formData.weight ? parseFloat(formData.weight) : null,
          formData.height ? parseFloat(formData.height) : null
        ),
      }

      const res = await fetch(`${API_URL}/patients/${patientId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const note = await res.json()
        const noteId = note.id || note.data?.id
        
        if (noteId) {
          await fetch(`${API_URL}/patients/${patientId}/notes/${noteId}/seal`, {
            method: 'POST',
            credentials: 'include',
          })
        }
        
        setSuccess(t('clinicalNotes.form.noteSealed'))
        setTimeout(() => {
          router.push(`/${slug}/operations/patients/${patientId}/history`)
        }, 1500)
      } else {
        const err = await res.json()
        setError(err.message || 'Failed to seal')
      }
    } catch (err) {
      setError('Failed to seal note')
    } finally {
      setIsSaving(false)
      setShowSealModal(false)
    }
  }

  const weight = formData.weight ? parseFloat(formData.weight) : null
  const height = formData.height ? parseFloat(formData.height) : null
  const bmi = calculateBMI(weight, height)
  const bmiCategory = lang === 'es' ? getBMICategoryES(bmi) : getBMICategory(bmi)
  const bmiStyle = getBMIColor(bmi)

  const bpSystolic = formData.bloodPressure ? parseInt(formData.bloodPressure.split('/')[0]) : null
  const bpDiastolic = formData.bloodPressure ? parseInt(formData.bloodPressure.split('/')[1]) : null
  const bpValue = bpSystolic || bpDiastolic ? Math.max(bpSystolic || 0, bpDiastolic || 0) : null
  const bpStatus = getVitalStatus(bpValue, 'bp')
  const bpColor = getVitalColor(bpStatus)

  const hrValue = formData.heartRate ? parseInt(formData.heartRate) : null
  const hrStatus = getVitalStatus(hrValue, 'hr')
  const hrColor = getVitalColor(hrStatus)

  const tempValue = formData.temperature ? parseFloat(formData.temperature) : null
  const tempStatus = getVitalStatus(tempValue, 'temp')
  const tempColor = getVitalColor(tempStatus)

  const rrValue = formData.respRate ? parseInt(formData.respRate) : null
  const rrStatus = getVitalStatus(rrValue, 'rr')
  const rrColor = getVitalColor(rrStatus)

  const spo2Value = formData.oxygenSat ? parseInt(formData.oxygenSat) : null
  const spo2Status = getVitalStatus(spo2Value, 'spo2')
  const spo2Color = getVitalColor(spo2Status)

  const availableSpecialties = (() => {
    if (!formData.userId) return specialties

    const doctor = doctors.find(d => d.id === formData.userId)
    if (!doctor?.specialties || doctor.specialties.length === 0) return []

    const doctorSpecIds = new Set(doctor.specialties.map(s => s.specialtyId))
    return specialties.filter(s => doctorSpecIds.has(s.id))
  })()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-3 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>person_off</span>
        <p className="text-error text-lg font-medium">{t('clinicalNotes.form.patientNotFound')}</p>
        <button
          onClick={() => router.push(`/${slug}/operations/patients`)}
          className="mt-4 text-primary hover:text-primary-container font-medium transition-colors"
        >
          {t('common.back')}
        </button>
      </div>
    )
  }

  const patientName = `${patient.firstName} ${patient.lastName}`

  return (
    <div className="flex h-full overflow-hidden bg-surface dark:bg-slate-950">
      <main className="flex-1 overflow-y-auto px-6 lg:px-10 py-8">
        <motion.div 
          className="space-y-8 max-w-5xl"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeInUp}>
            <button
              onClick={() => router.push(`/${slug}/operations/patients/${patientId}/history`)}
              className="inline-flex items-center gap-2 text-sm text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('clinicalNotes.form.backToHistory')}
            </button>
          </motion.div>

          <motion.header variants={fadeInUp} className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-primary dark:text-white font-headline">
                {t('clinicalNotes.form.title')}
              </h1>
              <p className="text-on-surface-variant dark:text-slate-400 font-medium mt-2">
                {t('clinicalNotes.form.patientLabel')} <span className="text-primary dark:text-blue-400 font-bold">{patientName}</span>
                <span className="mx-2 text-on-surface-variant/50">•</span>
                {t('clinicalNotes.form.idLabel')} <span className="font-mono text-sm">#{patient.documentType}-{patient.documentId}</span>
              </p>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-low dark:bg-slate-800/50 p-2 rounded-2xl">
              <span className="text-xs font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider px-3">
                {t('clinicalNotes.form.chronic')}
              </span>
              <button 
                onClick={() => handleChange('isChronic', !formData.isChronic)}
                className={`w-11 h-6 rounded-full relative transition-all duration-300 ${
                  formData.isChronic 
                    ? 'bg-primary dark:bg-blue-500' 
                    : 'bg-surface-container dark:bg-slate-700'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${
                  formData.isChronic ? 'translate-x-5' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
          </motion.header>

          <motion.section variants={fadeInUp}>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary dark:text-blue-400" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_ind</span>
              <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                {t('clinicalNotes.form.doctorSpecialty')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <select
                  value={formData.userId}
                  onChange={(e) => handleChange('userId', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface dark:bg-slate-800 border border-surface-container dark:border-slate-700 text-on-surface dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="">
                    {t('clinicalNotes.form.selectDoctor')}
                  </option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={formData.specialtyId}
                  onChange={(e) => handleChange('specialtyId', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface dark:bg-slate-800 border border-surface-container dark:border-slate-700 text-on-surface dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="">
                    {t('clinicalNotes.form.selectSpecialty')}
                  </option>
                  {availableSpecialties.map((specialty) => (
                    <option key={`${specialty.id}-${specialty.nameEn}`} value={specialty.id}>
                      {(lang === 'es' ? specialty.nameEs : null) || specialty.nameEn}
                    </option>
                  ))}
                </select>
                {availableSpecialties.length === 0 && formData.userId && (
                  <p className="text-xs text-on-surface-variant dark:text-slate-500 mt-2">
                    {t('clinicalNotes.form.noSpecialtiesForDoctor')}
                  </p>
                )}
              </div>
            </div>
          </motion.section>

          <motion.section variants={fadeInUp} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary dark:text-blue-400" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
              <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                {t('clinicalNotes.form.vitalSigns')}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className={`bg-surface-container dark:bg-slate-800 p-4 rounded-2xl border-2 ${bpColor.border}`}>
                <label className="block text-[10px] font-semibold text-on-surface-variant dark:text-slate-400 uppercase mb-2">
                  {t('clinicalNotes.form.bloodPressure')}
                </label>
                <div className="flex items-baseline gap-1">
                  <input 
                    className={`bg-transparent text-xl lg:text-2xl font-bold w-10 border-none p-0 focus:ring-0 text-center placeholder:text-slate-300 dark:placeholder:text-slate-600 ${bpColor.text}`}
                    type="text"
                    placeholder="120"
                    value={formData.bloodPressure.split('/')[0] || ''}
                    onChange={(e) => handleChange('bloodPressure', e.target.value ? `${e.target.value}/${formData.bloodPressure.split('/')[1] || '80'}` : '')}
                  />
                  <span className="text-on-surface-variant dark:text-slate-400">/</span>
                  <input 
                    className={`bg-transparent text-xl lg:text-2xl font-bold w-10 border-none p-0 focus:ring-0 text-center placeholder:text-slate-300 dark:placeholder:text-slate-600 ${bpColor.text}`}
                    type="text"
                    placeholder="80"
                    value={formData.bloodPressure.split('/')[1] || ''}
                    onChange={(e) => handleChange('bloodPressure', `${formData.bloodPressure.split('/')[0] || '120'}/${e.target.value}`)}
                  />
                </div>
              </div>
              <div className={`bg-surface-container dark:bg-slate-800 p-4 rounded-2xl border-2 ${hrColor.border}`}>
                <label className="block text-[10px] font-semibold text-on-surface-variant dark:text-slate-400 uppercase mb-2">
                  {t('clinicalNotes.form.heartRate')}
                </label>
                <div className="flex items-baseline gap-1">
                  <input 
                    className={`bg-transparent text-xl lg:text-2xl font-bold w-14 border-none p-0 focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600 ${hrColor.text}`}
                    type="text"
                    placeholder="72"
                    value={formData.heartRate}
                    onChange={(e) => handleChange('heartRate', e.target.value)}
                  />
                  <span className="text-xs text-on-surface-variant dark:text-slate-400">bpm</span>
                </div>
              </div>
              <div className={`bg-surface-container dark:bg-slate-800 p-4 rounded-2xl border-2 ${tempColor.border}`}>
                <label className="block text-[10px] font-semibold text-on-surface-variant dark:text-slate-400 uppercase mb-2">Temp</label>
                <div className="flex items-baseline gap-1">
                  <input 
                    className={`bg-transparent text-xl lg:text-2xl font-bold w-12 border-none p-0 focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600 ${tempColor.text}`}
                    type="text"
                    placeholder="36.6"
                    value={formData.temperature}
                    onChange={(e) => handleChange('temperature', e.target.value)}
                  />
                  <span className="text-xs text-on-surface-variant dark:text-slate-400">°C</span>
                </div>
              </div>
              <div className={`bg-surface-container dark:bg-slate-800 p-4 rounded-2xl border-2 ${rrColor.border}`}>
                <label className="block text-[10px] font-semibold text-on-surface-variant dark:text-slate-400 uppercase mb-2">
                  {t('clinicalNotes.form.respRate')}
                </label>
                <div className="flex items-baseline gap-1">
                  <input 
                    className={`bg-transparent text-xl lg:text-2xl font-bold w-10 border-none p-0 focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600 ${rrColor.text}`}
                    type="text"
                    placeholder="16"
                    value={formData.respRate}
                    onChange={(e) => handleChange('respRate', e.target.value)}
                  />
                  <span className="text-xs text-on-surface-variant dark:text-slate-400">/min</span>
                </div>
              </div>
              <div className={`bg-surface-container dark:bg-slate-800 p-4 rounded-2xl border-2 ${spo2Color.border}`}>
                <label className="block text-[10px] font-semibold text-on-surface-variant dark:text-slate-400 uppercase mb-2">SpO2</label>
                <div className="flex items-baseline gap-1">
                  <input 
                    className={`bg-transparent text-xl lg:text-2xl font-bold w-8 border-none p-0 focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600 ${spo2Color.text}`}
                    type="text"
                    placeholder="98"
                    value={formData.oxygenSat}
                    onChange={(e) => handleChange('oxygenSat', e.target.value)}
                  />
                  <span className="text-xs text-on-surface-variant dark:text-slate-400">%</span>
                </div>
              </div>
              <div className="bg-surface-container dark:bg-slate-800 p-4 rounded-2xl">
                <label className="block text-[10px] font-semibold text-on-surface-variant dark:text-slate-400 uppercase mb-2">
                  {t('clinicalNotes.form.weight')}
                </label>
                <div className="flex items-baseline gap-1">
                  <input 
                    className="bg-transparent text-xl lg:text-2xl font-bold text-primary dark:text-blue-400 w-14 border-none p-0 focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    type="text"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                  />
                  <span className="text-xs text-on-surface-variant dark:text-slate-400">kg</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-surface-container dark:bg-slate-800 p-4 rounded-2xl">
                <label className="block text-[10px] font-semibold text-on-surface-variant dark:text-slate-400 uppercase mb-2">
                  {t('clinicalNotes.form.height')}
                </label>
                <div className="flex items-baseline gap-1">
                  <input 
                    className="bg-transparent text-2xl font-bold text-primary dark:text-blue-400 w-16 border-none p-0 focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    type="text"
                    placeholder="170"
                    value={formData.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                  />
                  <span className="text-xs text-on-surface-variant dark:text-slate-400">cm</span>
                </div>
              </div>
              {bmi && (
                <div className={`p-4 rounded-2xl flex items-center justify-between ${bmiStyle.bg}`}>
                  <div>
                    <label className="block text-[10px] font-semibold text-primary dark:text-blue-400 uppercase mb-1">
                      {t('clinicalNotes.form.bmi')}
                    </label>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-primary dark:text-blue-400 font-headline">{bmi}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${bmiStyle.bg} ${bmiStyle.text}`}>
                        {bmiCategory}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[
                      { bg: 'bg-emerald-400', active: bmi >= 18.5 && bmi < 25 },
                      { bg: 'bg-amber-400', active: bmi >= 25 && bmi < 30 },
                      { bg: 'bg-rose-400', active: bmi >= 30 }
                    ].map((item, i) => (
                      <div 
                        key={i} 
                        className={`h-2 w-6 lg:w-8 rounded-full ${item.bg} ${item.active ? 'opacity-100' : 'opacity-30'}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.section>

          <motion.section variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary dark:text-blue-400">chat_bubble</span>
                <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                  {t('clinicalNotes.form.subjective')}
                </h2>
              </div>
              <textarea 
                className="w-full h-44 lg:h-52 bg-surface-container-low dark:bg-slate-800/50 border-none rounded-2xl p-4 text-on-surface dark:text-white placeholder:text-on-surface-variant/50 dark:placeholder:text-slate-500 focus:ring-2 ring-primary/20 resize-none font-body leading-relaxed text-sm lg:text-base"
                placeholder={t('clinicalNotes.form.subjectivePlaceholder')}
                value={formData.subjective}
                onChange={(e) => handleChange('subjective', e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary dark:text-blue-400">biotech</span>
                <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                  {t('clinicalNotes.form.diagnosis')}
                </h2>
              </div>
              <textarea 
                className="w-full h-44 lg:h-52 bg-surface-container-low dark:bg-slate-800/50 border-none rounded-2xl p-4 text-on-surface dark:text-white placeholder:text-on-surface-variant/50 dark:placeholder:text-slate-500 focus:ring-2 ring-primary/20 resize-none font-body leading-relaxed text-sm lg:text-base"
                placeholder={t('clinicalNotes.form.diagnosisPlaceholder')}
                value={formData.diagnosis}
                onChange={(e) => handleChange('diagnosis', e.target.value)}
              />
            </div>
          </motion.section>

          <motion.section variants={fadeInUp} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary dark:text-blue-400">medical_services</span>
              <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-400">
                {t('clinicalNotes.form.plan')}
              </h2>
            </div>
            <div className="bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant/10 dark:border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="space-y-3">
                {medicationItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 pb-3 border-b border-outline-variant/20 dark:border-slate-700 last:border-0">
                    <span className="w-7 h-7 rounded-full bg-surface-container dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-on-surface-variant dark:text-slate-400">
                      {index + 1}
                    </span>
                    <input 
                      className="flex-1 bg-transparent border-none text-on-surface dark:text-white font-medium focus:ring-0 placeholder:text-on-surface-variant/40 dark:placeholder:text-slate-600" 
                      placeholder={t('clinicalNotes.form.medicationPlaceholder')}
                      type="text"
                      value={item.name}
                      onChange={(e) => updateMedicationItem(index, 'name', e.target.value)}
                    />
                    <input 
                      className="w-36 bg-surface-container-low dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-sm text-on-surface dark:text-white" 
                      placeholder={t('clinicalNotes.form.dosagePlaceholder')}
                      type="text"
                      value={item.dosage}
                      onChange={(e) => updateMedicationItem(index, 'dosage', e.target.value)}
                    />
                    <button 
                      onClick={() => removeMedicationItem(index)}
                      className="text-on-surface-variant dark:text-slate-500 hover:text-error dark:hover:text-rose-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={addMedicationItem}
                  className="flex items-center gap-2 text-primary dark:text-blue-400 text-sm font-semibold hover:opacity-80 transition-opacity"
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  {t('clinicalNotes.form.addItem')}
                </button>
              </div>
              <textarea 
                className="mt-2 w-full h-20 bg-transparent border-none text-on-surface dark:text-white placeholder:text-on-surface-variant/40 dark:placeholder:text-slate-600 focus:ring-0 resize-none text-sm" 
                placeholder={t('clinicalNotes.form.followUpInstructionsPlaceholder')}
                value={formData.plan}
                onChange={(e) => handleChange('plan', e.target.value)}
              />
            </div>
          </motion.section>

          <motion.section variants={fadeInUp} className="flex flex-wrap items-center gap-3 pt-4 border-t border-outline-variant/10 dark:border-slate-700">
            <button 
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="flex-1 min-w-[140px] px-6 py-3 bg-surface-container dark:bg-slate-800 text-on-surface dark:text-white rounded-xl font-semibold text-sm hover:bg-surface-container-high dark:hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              {isSaving ? t('clinicalNotes.form.saving') : t('clinicalNotes.form.saveDraft')}
            </button>
            <button 
              onClick={() => setShowSealModal(true)}
              disabled={isSaving}
              className="flex-1 min-w-[140px] px-6 py-3 bg-gradient-to-br from-primary to-primary-container dark:from-blue-600 dark:to-blue-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Verified className="w-4 h-4" />
              {t('clinicalNotes.form.finalizeSeal')}
            </button>
          </motion.section>

          <div className="h-24"></div>
        </motion.div>
      </main>

      <aside className="hidden xl:block w-[380px] bg-surface-container-low/30 dark:bg-slate-900/30 border-l border-outline-variant/10 dark:border-slate-800 overflow-y-auto">
        <motion.div 
          className="p-6"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={slideIn} className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-container dark:bg-blue-600 text-white flex items-center justify-center rounded-xl shadow-lg">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-primary dark:text-white leading-tight">
                {t('clinicalNotes.form.summary')}
              </h3>
              <p className="text-[10px] font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-widest">
                {t('clinicalNotes.form.patientData')}
              </p>
            </div>
          </motion.div>

          <motion.div variants={slideIn} className="space-y-3 mb-6">
            <ul className="space-y-3">
              {patient.allergies && patient.allergies.length > 0 && (
                <li className="flex gap-3 items-start p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900/50">
                  <div className="mt-1 w-2 h-2 rounded-full bg-rose-500"></div>
                  <div>
                    <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase">{t('clinicalNotes.form.allergy')}</p>
                    <p className="text-sm text-rose-700 dark:text-rose-400 font-medium">{patient.allergies.join(', ')}</p>
                  </div>
                </li>
              )}
              <li className="flex gap-3 items-start p-3 bg-surface-container-low dark:bg-slate-800/40 rounded-xl">
                <div className="mt-1 w-2 h-2 rounded-full bg-primary dark:bg-blue-500"></div>
                <div>
                  <p className="text-xs text-on-surface-variant dark:text-slate-400 uppercase">{t('clinicalNotes.form.bloodTypeLabel')}</p>
                  <p className="text-sm font-semibold text-on-surface dark:text-white">{patient.bloodType || 'N/A'}</p>
                </div>
              </li>
              {patient.isChronic && (
                <li className="flex gap-3 items-start p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/50">
                  <div className="mt-1 w-2 h-2 rounded-full bg-amber-500"></div>
                  <div>
                    <p className="text-xs text-amber-700 dark:text-amber-400 uppercase">{t('clinicalNotes.form.condition')}</p>
                    <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">{t('clinicalNotes.form.chronicActive')}</p>
                  </div>
                </li>
              )}
              {patient.dateOfBirth && (
                <li className="flex gap-3 items-start p-3 bg-surface-container-low dark:bg-slate-800/40 rounded-xl">
                  <div className="mt-1 w-2 h-2 rounded-full bg-primary dark:bg-blue-500"></div>
                  <div>
                    <p className="text-xs text-on-surface-variant dark:text-slate-400 uppercase">{t('clinicalNotes.form.born')}</p>
                    <p className="text-sm font-semibold text-on-surface dark:text-white">
                      {new Date(patient.dateOfBirth).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US')}
                    </p>
                  </div>
                </li>
              )}
            </ul>
          </motion.div>

          <motion.div variants={slideIn} className="p-4 bg-gradient-to-br from-primary/5 to-primary-container/10 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl border border-primary/10 dark:border-blue-800/30">
            <h5 className="text-xs font-bold text-primary dark:text-blue-400 mb-3">
              {t('clinicalNotes.form.riskAssessment')}
            </h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-on-surface-variant dark:text-slate-400">{t('clinicalNotes.form.cardiovascular')}</span>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{t('clinicalNotes.form.moderate')}</span>
              </div>
              <div className="h-2 bg-surface-container dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full w-[60%] bg-gradient-to-r from-primary to-orange-500 rounded-full"></div>
              </div>
            </div>
          </motion.div>

          {error && (
            <motion.div variants={fadeInUp} className="p-4 bg-error-container dark:bg-red-900/30 rounded-xl mt-4">
              <p className="text-sm text-error dark:text-red-400">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div variants={fadeInUp} className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl mt-4">
              <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {success}
              </p>
            </motion.div>
          )}

          <motion.button variants={slideIn} className="w-full mt-4 py-3 bg-surface-container-low dark:bg-slate-800 text-primary dark:text-blue-400 border border-primary/10 dark:border-blue-800/30 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary-container/10 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            {t('clinicalNotes.form.aiReport')}
          </motion.button>
        </motion.div>
      </aside>

      <AnimatePresence>
        {showSealModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/60 dark:bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-container-lowest dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-error-container dark:bg-red-900/50 text-on-error-container dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Lock className="w-8 h-8" style={{ fontVariationSettings: "'FILL' 1" }} />
                </div>
                <h3 className="font-headline font-bold text-xl text-on-surface dark:text-white mb-2">
                  {t('clinicalNotes.form.sealNote')}
                </h3>
                <p className="text-sm text-on-surface-variant dark:text-slate-400 leading-relaxed">
                  {t('clinicalNotes.form.sealNoteDesc')}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-surface-container dark:bg-slate-800 rounded-lg">
                  <span className="material-symbols-outlined text-sm text-primary dark:text-blue-400">lock</span>
                  <p className="text-xs font-bold text-primary dark:text-blue-400 uppercase tracking-wider">
                    {t('clinicalNotes.form.legalSeal')}
                  </p>
                </div>
              </div>
              <div className="flex border-t border-outline-variant/10 dark:border-slate-700">
                <button 
                  onClick={() => setShowSealModal(false)}
                  className="flex-1 py-4 font-semibold text-on-surface-variant dark:text-slate-400 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors text-sm"
                >
                  {t('common.cancel')}
                </button>
                <button 
                  onClick={handleSeal}
                  disabled={isSaving}
                  className="flex-1 py-4 font-semibold bg-primary dark:bg-blue-600 text-on-primary hover:bg-primary-container dark:hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                >
                  {isSaving ? t('clinicalNotes.form.saving') : t('clinicalNotes.form.confirm')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}