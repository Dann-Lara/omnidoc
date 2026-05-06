'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, ChevronDown, ChevronUp, FileText } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Patient {
  id: string
  firstName: string
  lastName: string
  documentType: string | null
  documentId: string | null
  dateOfBirth: string | null
  bloodType: string | null
  allergies: string[]
  isChronic: boolean
}

interface Note {
  id: string
  createdAt: string
  isSealed: boolean
  bloodPressure: string | null
  heartRate: number | null
  temperature: number | null
  subjective: string | null
  diagnosis: string | null
  doctor?: { id: string; firstName: string; lastName: string }
}

interface TimelineStats {
  totalNotes: number
  lastUpdate: string | null
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
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

function getCategoryIcon(category: string) {
  switch (category) {
    case 'cardiology':
      return <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
    case 'radiology':
      return <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>radiology</span>
    case 'laboratory':
      return <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>science</span>
    case 'pharmacy':
      return <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>medication</span>
    default:
      return <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>note</span>
  }
}

export default function PatientHistoryPage() {
  const { t } = useI18n()
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const patientId = params.patientId as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [stats, setStats] = useState<TimelineStats>({ totalNotes: 0, lastUpdate: null })
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expandedNote, setExpandedNote] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [patientId])

  const fetchData = async () => {
    try {
      console.log('[History] API_URL:', API_URL)
      console.log('[History] patientId:', patientId)
      
      const fetchOpts: RequestInit = { 
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      }
      
      const patientRes = await fetch(`${API_URL}/patients/${patientId}`, fetchOpts)
      console.log('[History] Patient res status:', patientRes.status)
      
      const notesRes = await fetch(`${API_URL}/patients/${patientId}/notes`, fetchOpts)
      console.log('[History] Notes res status:', notesRes.status)

      if (patientRes.ok) {
        const patientData = await patientRes.json()
        console.log('[History] Patient data:', patientData)
        setPatient(patientData.patient || patientData.data || patientData)
      } else {
        const errorText = await patientRes.text()
        console.error('[History] Patient error:', errorText)
      }

      if (notesRes.ok) {
        const notesData = await notesRes.json()
        console.log('[History] Notes data:', notesData)
        const notesList = notesData.notes || notesData.data || notesData
        setNotes(notesList)
        if (notesList.length > 0) {
          setStats({ totalNotes: notesData.count || notesList.length, lastUpdate: notesList[0]?.createdAt })
        }
      } else {
        const errorText = await notesRes.text()
        console.error('[History] Notes error:', errorText)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const age = calculateAge(patient?.dateOfBirth || null)
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : ''
  
  const filteredNotes = filter === 'all' 
    ? notes 
    : notes.filter(note => {
        if (filter === 'sealed') return note.isSealed
        if (filter === 'unsealed') return !note.isSealed
        return true
      })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-20">
        <p className="text-error">{t('patients.history.patientNotFound')}</p>
      </div>
    )
  }

  return (
    <motion.div className="space-y-8 pb-8" variants={staggerContainer} initial="hidden" animate="show">
      <motion.div variants={fadeInUp}>
        <button
          onClick={() => router.push(`/${slug}/operations/patients`)}
          className="flex items-center gap-2 text-on-surface-variant dark:text-slate-400 hover:text-primary mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('patients.history.backToPatients')}
        </button>
      </motion.div>

      <motion.div variants={fadeInUp} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-primary dark:text-white">{patientName}</h1>
          <p className="text-on-surface-variant">
            {patient.documentType}-{patient.documentId} • {age !== null && `${age} ${t('patients.history.years')}`} • {patient.bloodType}
          </p>
        </div>
        <button
          onClick={() => router.push(`/${slug}/operations/patients/${patientId}/notes/new`)}
          className="px-5 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white rounded-lg font-bold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('patients.history.newNote')}
        </button>
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-surface-container-lowest dark:bg-slate-900 p-6 rounded-xl">
          <h2 className="text-2xl font-bold text-primary mb-2">
            {t('patients.history.clinicalSummary')}
          </h2>
          <p className="text-on-surface-variant">
            {patient.isChronic 
              ? t('patients.history.chronicConditionText')
              : t('patients.history.noChronicConditionText')
            }
          </p>
          <div className="flex gap-8 mt-6 pt-6 border-t border-surface-container">
            <div>
              <p className="text-xs uppercase text-on-surface-variant">{t('patients.history.lastUpdate')}</p>
              <p className="font-bold">
                {stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleDateString() : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-on-surface-variant">{t('patients.history.totalEntries')}</p>
              <p className="font-bold">{stats.totalNotes}</p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 bg-primary-container p-6 rounded-xl text-white">
          <span className="text-xs uppercase text-primary-fixed-dim">{t('patients.history.alerts')}</span>
          <div className="text-4xl font-extrabold mt-2">{patient.allergies?.length || 0}</div>
          <p className="text-sm text-on-primary-container">{t('patients.history.registeredAllergies')}</p>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="flex justify-between items-end">
        <div className="flex gap-6">
          <button onClick={() => setFilter('all')} className={`font-bold pb-2 ${filter === 'all' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant'}`}>
            {t('patients.history.allFilter')}
          </button>
          <button onClick={() => setFilter('sealed')} className={`font-bold pb-2 ${filter === 'sealed' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant'}`}>
            {t('patients.history.sealedFilter')}
          </button>
          <button onClick={() => setFilter('unsealed')} className={`font-bold pb-2 ${filter === 'unsealed' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant'}`}>
            {t('patients.history.draftsFilter')}
          </button>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="space-y-6">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-on-surface-variant">{t('patients.history.noNotes')}</p>
          </div>
        ) : (
          filteredNotes.map((note, index) => (
            <motion.div key={note.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
              <div className="hidden lg:flex col-span-5 flex-col justify-center items-end text-right">
                <div className="text-2xl font-extrabold text-primary">
                  {new Date(note.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-on-surface-variant uppercase">
                  {new Date(note.createdAt).toLocaleTimeString()}
                </div>
              </div>
              <div className="hidden lg:flex col-span-2 justify-center items-start relative">
                <div className="z-10 h-14 w-14 bg-white dark:bg-slate-800 border-4 border-surface-container-high rounded-full flex items-center justify-center shadow-sm">
                  {getCategoryIcon(index % 4 === 0 ? 'cardiology' : index % 4 === 1 ? 'radiology' : index % 4 === 2 ? 'laboratory' : 'pharmacy')}
                </div>
              </div>
              <div className="col-span-12 lg:col-span-5">
                <div className="bg-surface-container-lowest dark:bg-slate-900 p-6 rounded-xl border-l-4 border-primary">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">
                        {t('patients.history.clinicalNote')} #{filteredNotes.length - index}
                      </h3>
                      <p className="text-sm text-on-surface-variant">
                        {note.doctor ? `${note.doctor.firstName} ${note.doctor.lastName}` : ''}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${note.isSealed ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container'}`}>
                      {note.isSealed ? t('patients.history.sealedStatus') : t('patients.history.draftStatus')}
                    </span>
                  </div>
<button
                      onClick={() => router.push(`/${slug}/operations/patients/${patientId}/notes/${note.id}`)}
                      className="flex items-center gap-2 text-primary font-bold text-sm"
                    >
                      {expandedNote === note.id ? (
                        <><ChevronUp className="w-5 h-5" />{t('patients.history.showLess')}</>
                      ) : (
                        <><ChevronDown className="w-5 h-5" />{t('patients.history.showDetails')}</>
                      )}
                    </button>
                  {expandedNote === note.id && (
                    <div className="mt-4 pt-4 border-t border-surface-container space-y-4">
                      {note.bloodPressure && (
                        <div className="bg-surface-container p-3 rounded-lg">
                          <p className="text-xs uppercase">PA</p>
                          <p className="font-bold text-primary">{note.bloodPressure}</p>
                        </div>
                      )}
                      {note.subjective && (
                        <div>
                          <p className="text-xs uppercase text-on-surface-variant">{t('patients.history.subjective')}</p>
                          <p className="text-sm">{note.subjective}</p>
                        </div>
                      )}
                      {note.diagnosis && (
                        <div>
                          <p className="text-xs uppercase text-on-surface-variant">{t('patients.history.diagnosis')}</p>
                          <p className="text-sm">{note.diagnosis}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  )
}
