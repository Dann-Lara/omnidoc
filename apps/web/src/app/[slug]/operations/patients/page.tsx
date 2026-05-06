'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText, FolderOpen } from 'lucide-react'

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
  _count?: { notes: number }
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
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

export default function PatientsPage() {
  const { t } = useI18n()
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [patients, setPatients] = useState<Patient[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filterDocId, setFilterDocId] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      setSearch(searchInput)
    }, 300)
    return () => clearTimeout(delaySearch)
  }, [searchInput])

  useEffect(() => {
    fetchPatients()
  }, [search, filterDocId, page])

  const fetchPatients = async () => {
    setIsLoading(true)
    try {
      const urlParams = new URLSearchParams()
      urlParams.append('page', page.toString())
      urlParams.append('limit', '10')
      if (search) urlParams.append('search', search)
      if (filterDocId) urlParams.append('documentId', filterDocId)
      
      const res = await fetch(`${API_URL}/patients?${urlParams}`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setPatients(data.data)
        setMeta(data.meta)
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewPatient = (patient: Patient) => {
    router.push(`/${slug}/operations/patients/${patient.id}/history`)
  }

  const handleEditPatient = (patient: Patient) => {
    router.push(`/${slug}/operations/patients/${patient.id}`)
  }

  const getPermissions = () => {
    if (typeof window === 'undefined') return { patients: { write: false, read: true } }
    const stored = localStorage.getItem('sb-permissions')
    return stored ? JSON.parse(stored) : { patients: { write: true, read: true } }
  }

  const permissions = getPermissions()

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getGenderLabel = (gender: string | null) => {
    if (!gender) return ''
    return gender === 'MALE' 
      ? t('patients.directory.male')
      : gender === 'FEMALE' 
        ? t('patients.directory.female')
        : ''
  }

  return (
    <motion.div 
      className="space-y-6 pb-8"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeInUp}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <nav className="flex items-center gap-2 text-on-surface-variant dark:text-slate-400 text-sm mb-4">
              <span className="font-medium">{t('patients.directory.title')}</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-on-surface dark:text-white">{t('patients.directory.patientDirectory')}</span>
            </nav>
            <h1 className="text-4xl font-extrabold tracking-tight text-primary dark:text-white">
              {t('patients.directory.title')}
            </h1>
            <p className="text-on-surface-variant dark:text-slate-400 text-sm mt-1 max-w-2xl font-medium">
              {t('patients.directory.description')}
            </p>
          </div>
          <button
            onClick={() => router.push(`/${slug}/operations/patients/new`)}
            className="clinical-gradient text-white flex items-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-md hover:opacity-90 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">person_add</span>
            {t('patients.directory.new')}
          </button>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-surface-container-high dark:bg-slate-800 rounded-xl flex items-center">
            <div className="pl-4 pr-2 text-on-surface-variant dark:text-slate-400">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              type="text"
              placeholder={t('patients.directory.searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-on-surface dark:text-white font-medium placeholder:text-on-surface-variant/60 dark:placeholder:text-slate-500 py-3"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1 bg-surface-container-high dark:bg-slate-800 rounded-xl flex items-center">
              <div className="pl-4 pr-2 text-on-surface-variant dark:text-slate-400">
                <span className="material-symbols-outlined text-sm">fingerprint</span>
              </div>
              <input
                type="text"
                placeholder={t('patients.directory.idPlaceholder')}
                value={filterDocId}
                onChange={(e) => setFilterDocId(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-on-surface dark:text-white font-medium placeholder:text-on-surface-variant/60 dark:placeholder:text-slate-500 py-3 text-sm"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-surface-container-lowest dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-surface-container dark:bg-slate-800 text-on-surface-variant dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-surface-variant/10">
          <div className="col-span-4 lg:col-span-3">{t('patients.directory.patient')}</div>
          <div className="col-span-3 lg:col-span-2">{t('patients.directory.identification')}</div>
          <div className="hidden lg:block lg:col-span-2">{t('patients.directory.ageGender')}</div>
          <div className="col-span-2 lg:col-span-2">{t('patients.directory.lastVisit')}</div>
          <div className="col-span-3 lg:col-span-2">{t('patients.directory.condition')}</div>
          <div className="hidden md:block col-span-1 text-right">{t('patients.directory.actions')}</div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-on-surface-variant dark:text-slate-400">{t('patients.directory.noResults')}</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-container dark:divide-slate-700">
            {patients.map((patient, idx) => {
              const age = calculateAge(patient.dateOfBirth)
              const hasAllergies = patient.allergies && patient.allergies.length > 0
              
              return (
                <div 
                  key={patient.id} 
                  className={`grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors group ${idx % 2 === 1 ? 'bg-surface-container/20 dark:bg-slate-800/20' : ''}`}
                >
                  <div className="col-span-4 lg:col-span-3 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full clinical-gradient flex items-center justify-center text-on-primary font-bold text-sm shrink-0">
                      {getInitials(patient.firstName, patient.lastName)}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-primary dark:text-blue-400 truncate">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-xs text-on-surface-variant dark:text-slate-400">
                        {t('patients.directory.record')}: #{patient.id.slice(0, 8).toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 lg:col-span-2 font-mono text-sm text-on-surface-variant dark:text-slate-400">
                    {patient.documentId || '-'}
                  </div>
                  <div className="hidden lg:block lg:col-span-2 text-sm text-on-surface dark:text-slate-200">
                    {age !== null && <>{age} {t('patients.directory.years')}</>}
                    {age !== null && patient.gender && <span className="text-on-surface-variant dark:text-slate-400"> / </span>}
                    {patient.gender && <span className="text-on-surface-variant dark:text-slate-400">{getGenderLabel(patient.gender)}</span>}
                    {age === null && !patient.gender && '-'}
                  </div>
                  <div className="col-span-2 lg:col-span-2 text-sm text-on-surface-variant dark:text-slate-400">
                    {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : '-'}
                  </div>
                  <div className="col-span-3 lg:col-span-2 flex flex-wrap gap-2">
                    {hasAllergies && (
                      <span className="px-2 py-1 bg-error-container dark:bg-red-900/30 text-on-error-container dark:text-red-400 text-[10px] font-bold rounded uppercase">
                        {t('patients.directory.allergies')}
                      </span>
                    )}
                    {patient.isChronic && (
                      <span className="px-2 py-1 bg-secondary-container dark:bg-blue-900/30 text-on-secondary-container dark:text-blue-400 text-[10px] font-bold rounded uppercase">
                        {t('patients.directory.chronic')}
                      </span>
                    )}
                    {!hasAllergies && !patient.isChronic && (
                      <span className="px-2 py-1 bg-surface-container-high dark:bg-slate-700 text-on-surface-variant dark:text-slate-400 text-[10px] font-bold rounded uppercase">
                        {t('patients.directory.normal')}
                      </span>
                    )}
                  </div>
                  <div className="hidden md:flex col-span-1 justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditPatient(patient)}
                      className="p-2 hover:bg-surface-variant dark:hover:bg-slate-700 rounded-lg text-on-surface-variant dark:text-slate-400 transition-colors"
                      title={t('patients.directory.editData')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleViewPatient(patient)}
                      className="p-2 hover:bg-surface-variant dark:hover:bg-slate-700 rounded-lg text-primary-container dark:text-blue-400 transition-colors"
                      title={t('patients.directory.viewClinicalHistory')}
                    >
                      <FolderOpen className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {meta && meta.totalPages > 1 && (
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-on-surface-variant dark:text-slate-400 font-medium">
            {t('patients.directory.showing')} <span className="text-primary dark:text-blue-400 font-bold">{patients.length}</span> {t('patients.directory.of')} <span className="text-primary dark:text-blue-400 font-bold">{meta.total}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-high dark:hover:bg-slate-700 transition-colors disabled:opacity-30"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-high dark:hover:bg-slate-700 transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-colors ${
                      page === pageNum
                        ? 'bg-primary dark:bg-blue-600 text-white shadow-sm'
                        : 'hover:bg-surface-container-high dark:hover:bg-slate-700 text-on-surface-variant dark:text-slate-400'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              {meta.totalPages > 5 && (
                <>
                  <span className="text-on-surface-variant dark:text-slate-400 text-xs px-1">...</span>
                  <button
                    onClick={() => setPage(meta.totalPages)}
                    className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold hover:bg-surface-container-high dark:hover:bg-slate-700 transition-colors"
                  >
                    {meta.totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-high dark:hover:bg-slate-700 transition-colors disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage(meta.totalPages)}
              disabled={page === meta.totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-high dark:hover:bg-slate-700 transition-colors disabled:opacity-30"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}