'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Phone, Mail } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Patient {
  id: string
  firstName: string
  lastName: string
  documentType: string | null
  documentId: string | null
  email: string | null
  phone: string | null
  dateOfBirth: string | null
  gender: string | null
  bloodType: string | null
  emergencyContact: string | null
  emergencyPhone: string | null
  allergies: string[]
  isChronic: boolean
  createdAt: string
  updatedAt: string
  _count?: { notes: number }
  notes?: { id: string; createdAt: string; isSealed: boolean }[]
}

interface PatientFormData {
  firstName: string
  lastName: string
  documentType: string
  documentId: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  bloodType: string
  emergencyContact: string
  emergencyPhone: string
  allergies: string[]
  isChronic: boolean
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export default function PatientEditPage() {
  const { t } = useI18n()
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const patientId = params.patientId as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingAudit, setIsSavingAudit] = useState(false)
  const [newAllergy, setNewAllergy] = useState('')
  
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    documentType: 'DNI',
    documentId: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    emergencyContact: '',
    emergencyPhone: '',
    allergies: [],
    isChronic: false,
  })

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch(`${API_URL}/patients/${patientId}`, {
          credentials: 'include',
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          setError(errData.message || errData.error || `Error ${res.status}`)
          return
        }
        const data = await res.json()
        
        // Handle different response structures
        let p = data.patient || data.data
        if (!p && data.id) {
          p = data
        }
        
        if (p && p.id) {
          setPatient(p)
          setFormData({
            firstName: p.firstName || '',
            lastName: p.lastName || '',
            documentType: p.documentType || 'DNI',
            documentId: p.documentId || '',
            email: p.email || '',
            phone: p.phone || '',
            dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
            gender: p.gender || '',
            bloodType: p.bloodType || '',
            emergencyContact: p.emergencyContact || '',
            emergencyPhone: p.emergencyPhone || '',
            allergies: p.allergies || [],
            isChronic: p.isChronic || false,
          })
        }
      } catch (error) {
        console.error('Failed to fetch patient:', error)
        setError('Failed to load patient')
      } finally {
        setIsLoading(false)
      }
    }
    fetchPatient()
  }, [patientId])

  const handleChange = (field: keyof PatientFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !formData.allergies.includes(newAllergy.trim())) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }))
      setNewAllergy('')
    }
  }

  const handleRemoveAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const res = await fetch(`${API_URL}/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Failed to update patient')
      }

      router.push(`/${slug}/operations/patients`)
    } catch (error) {
      console.error('Failed to update patient:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscard = () => {
    if (patient) {
      setFormData({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        documentType: patient.documentType || 'DNI',
        documentId: patient.documentId || '',
        email: patient.email || '',
        phone: patient.phone || '',
        dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
        gender: patient.gender || '',
        bloodType: patient.bloodType || '',
        emergencyContact: patient.emergencyContact || '',
        emergencyPhone: patient.emergencyPhone || '',
        allergies: patient.allergies || [],
        isChronic: patient.isChronic || false,
      })
    }
  }

  const getBloodTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      A_POSITIVE: 'A+', A_NEGATIVE: 'A-',
      B_POSITIVE: 'B+', B_NEGATIVE: 'B-',
      AB_POSITIVE: 'AB+', AB_NEGATIVE: 'AB-',
      O_POSITIVE: 'O+', O_NEGATIVE: 'O-',
    }
    return labels[type] || type
  }

  const age = calculateAge(patient?.dateOfBirth || null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 dark:text-red-400 font-medium">ERROR: {error}</p>
        <button
          onClick={() => router.push(`/${slug}/operations/patients`)}
          className="mt-4 text-primary dark:text-blue-400 hover:underline"
        >
          {t('patients.detail.back')}
        </button>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-20">
        <p className="text-on-surface-variant dark:text-slate-400">NO PATIENT: {t('patients.detail.notFound')}</p>
        <p className="text-sm text-gray-500 mt-2">isLoading: {String(isLoading)}</p>
        <button
          onClick={() => router.push(`/${slug}/operations/patients`)}
          className="mt-4 text-primary dark:text-blue-400 hover:underline"
        >
          {t('patients.detail.back')}
        </button>
      </div>
    )
  }

  return (
    <motion.div 
      className="space-y-10 pb-8"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeInUp}>
        <button
          onClick={() => router.push(`/${slug}/operations/patients`)}
          className="flex items-center gap-2 text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('patients.detail.back')}
        </button>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <motion.div variants={fadeInUp} className="bg-surface-container-lowest dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-white dark:border-slate-800">
          <div className="p-6 border-b border-surface-container dark:border-slate-700 flex justify-between items-center bg-surface-container-low/30">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary-fixed dark:bg-blue-900 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary dark:text-blue-400 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  person
                </span>
              </div>
              <div>
                <h2 className="font-headline text-xl font-bold text-on-surface dark:text-white">
                  {patient.firstName} {patient.lastName}
                </h2>
                <p className="text-xs font-semibold text-on-surface-variant dark:text-slate-400 flex items-center gap-2">
                  {patient.documentType && patient.documentId && (
                    <span className="bg-primary-container/10 dark:bg-blue-900/30 px-2 py-0.5 rounded uppercase tracking-tighter text-primary dark:text-blue-400">
                      {patient.documentType}: {patient.documentId}
                    </span>
                  )}
                  {patient.dateOfBirth && (
                    <>
                      <span className="text-outline">•</span>
                      <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()} ({age}y)</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15rem] text-on-surface-variant dark:text-slate-400 border-b border-surface-container dark:border-slate-700 pb-2">
                  {t('patients.detail.administrativeIdentity')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-on-surface-variant dark:text-slate-400 font-medium">
                      {t('patients.detail.fullName')}
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className="w-full bg-surface-container-high dark:bg-slate-800 border-none rounded-lg text-sm font-semibold h-10 px-3 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-on-surface-variant dark:text-slate-400 font-medium">
                      {t('patients.detail.lastName')}
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className="w-full bg-surface-container-high dark:bg-slate-800 border-none rounded-lg text-sm font-semibold h-10 px-3 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-on-surface-variant dark:text-slate-400 font-medium">
                      {t('patients.form.documentType')}
                    </label>
                    <select
                      value={formData.documentType}
                      onChange={(e) => handleChange('documentType', e.target.value)}
                      className="w-full bg-surface-container-high dark:bg-slate-800 border-none rounded-lg text-sm font-semibold h-10 px-3 dark:text-white"
                    >
                      <option value="DNI">DNI</option>
                      <option value="CURP">CURP</option>
                      <option value="SSN">SSN</option>
                      <option value="PASSPORT">{t('patients.detail.passport')}</option>
                      <option value="OTHER">{t('patients.detail.other')}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-on-surface-variant dark:text-slate-400 font-medium">
                      {t('patients.form.documentId')}
                    </label>
                    <input
                      type="text"
                      value={formData.documentId}
                      onChange={(e) => handleChange('documentId', e.target.value)}
                      className="w-full bg-surface-container-high dark:bg-slate-800 border-none rounded-lg text-sm font-semibold h-10 px-3 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-on-surface-variant dark:text-slate-400 font-medium">
                      {t('patients.form.dateOfBirth')}
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                      className="w-full bg-surface-container-high dark:bg-slate-800 border-none rounded-lg text-sm font-semibold h-10 px-3 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-on-surface-variant dark:text-slate-400 font-medium">
                      {t('patients.form.gender')}
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      className="w-full bg-surface-container-high dark:bg-slate-800 border-none rounded-lg text-sm font-semibold h-10 px-3 dark:text-white"
                    >
                      <option value="">{t('patients.detail.select')}</option>
                      <option value="MALE">{t('patients.detail.male')}</option>
                      <option value="FEMALE">{t('patients.detail.female')}</option>
                      <option value="HOMBRE">{t('patients.detail.man')}</option>
                      <option value="MUJER">{t('patients.detail.woman')}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-on-surface-variant dark:text-slate-400 font-medium">
                      {t('patients.form.bloodType')}
                    </label>
                    <select
                      value={formData.bloodType}
                      onChange={(e) => handleChange('bloodType', e.target.value)}
                      className="w-full bg-surface-container-high dark:bg-slate-800 border-none rounded-lg text-sm font-semibold h-10 px-3 dark:text-white"
                    >
                      <option value="">{t('patients.detail.select')}</option>
                      <option value="A_POSITIVE">A+</option>
                      <option value="A_NEGATIVE">A-</option>
                      <option value="B_POSITIVE">B+</option>
                      <option value="B_NEGATIVE">B-</option>
                      <option value="AB_POSITIVE">AB+</option>
                      <option value="AB_NEGATIVE">AB-</option>
                      <option value="O_POSITIVE">O+</option>
                      <option value="O_NEGATIVE">O-</option>
                    </select>
                  </div>
                  <div className="space-y-1 flex items-center">
                    <label className="relative flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.isChronic}
                        onChange={(e) => handleChange('isChronic', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-container-high dark:bg-slate-700 rounded-full peer peer-checked:bg-amber-500 dark:peer-checked:bg-amber-600 peer-focus:ring-2 peer-focus:ring-primary/30 transition-colors"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white dark:bg-slate-300 rounded-full shadow-md peer-checked:translate-x-5 transition-transform"></div>
                      <span className="ml-3 text-sm font-medium text-on-surface dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {t('patients.form.isChronic')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15rem] text-on-surface-variant dark:text-slate-400 border-b border-surface-container dark:border-slate-700 pb-2">
                  {t('patients.detail.contactChannels')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-on-surface-variant dark:text-slate-400 font-medium">
                      {t('patients.form.email')}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full bg-surface-container-high dark:bg-slate-800 border-none rounded-lg text-sm font-semibold h-10 px-3 pr-10 dark:text-white"
                      />
                      <span className="material-symbols-outlined absolute right-3 top-2 text-outline dark:text-slate-500 text-lg">mail</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-on-surface-variant dark:text-slate-400 font-medium">
                      {t('patients.form.phone')}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full bg-surface-container-high dark:bg-slate-800 border-none rounded-lg text-sm font-semibold h-10 px-3 pr-10 dark:text-white"
                      />
                      <span className="material-symbols-outlined absolute right-3 top-2 text-outline dark:text-slate-500 text-lg">smartphone</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-error-container/40 dark:bg-red-900/20 p-5 rounded-xl border border-error/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.15rem] text-error dark:text-red-400">
                    {t('patients.detail.knownAllergies')}
                  </h3>
                  <span className="material-symbols-outlined text-error dark:text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.allergies.map((allergy, idx) => (
                    <span key={idx} className="bg-error dark:bg-red-700 text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-sm flex items-center gap-1">
                      {allergy}
                      <button 
                        type="button"
                        onClick={() => handleRemoveAllergy(idx)}
                        className="hover:bg-white/20 rounded-full px-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {formData.allergies.length === 0 && (
                    <span className="text-sm text-on-surface-variant dark:text-slate-400">
                      {t('patients.detail.noKnownAllergies')}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                    placeholder={t('patients.detail.addAllergyPlaceholder')}
                    className="flex-1 bg-white dark:bg-slate-800 border-none rounded-lg text-sm font-medium h-10 px-3 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddAllergy}
                    className="px-4 bg-error/10 hover:bg-error/20 dark:hover:bg-red-900/30 text-error dark:text-red-400 rounded-lg text-sm font-bold transition-colors"
                  >
                    + {t('patients.detail.add')}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15rem] text-on-surface-variant dark:text-slate-400 border-b border-surface-container dark:border-slate-700 pb-2">
                  {t('patients.detail.emergencyNotification')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-on-surface-variant dark:text-slate-400 font-medium">
                      {t('patients.detail.contactName')}
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => handleChange('emergencyContact', e.target.value)}
                      className="w-full bg-surface-container-high dark:bg-slate-800 border-none rounded-lg text-sm font-semibold h-10 px-3 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-on-surface-variant dark:text-slate-400 font-medium">
                      {t('patients.form.emergencyPhone')}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={formData.emergencyPhone}
                        onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                        className="w-full bg-surface-container-high dark:bg-slate-800 border-none rounded-lg text-sm font-semibold h-10 px-3 pr-10 dark:text-white"
                      />
                      <span className="material-symbols-outlined absolute right-3 top-2 text-outline dark:text-slate-500 text-lg">emergency</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-4 py-2 text-primary dark:text-blue-400 font-bold text-sm hover:bg-primary/5 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            {t('patients.detail.discardChanges')}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 clinical-gradient text-white font-bold text-sm rounded-lg shadow-md hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {t('patients.detail.updateRecord')}
          </button>
        </div>
      </form>
    </motion.div>
  )
}