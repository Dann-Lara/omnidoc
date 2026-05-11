'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { motion } from 'framer-motion'
import { ArrowLeft, Activity, FileDown, Send, CheckCircle, Loader, Pill, PackageCheck, Info } from 'lucide-react'
import { usePermissions } from '@/lib/permissions/usePermissions'
import { pdf } from '@react-pdf/renderer'
import { ClinicalNotePDF } from '@/components/pdf/ClinicalNotePDF'
import { Modal } from '@/components/Modal'

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
}

interface ParsedMedication {
  productId: string
  productName: string
  quantity: number
  instructions?: string
}

interface ProductInfo {
  id: string
  unitsPerBox: number
}

interface Note {
  id: string
  patientId: string
  createdAt: string
  isSealed: boolean
  sealedAt: string | null
  signature: string | null
  bloodPressure: string | null
  heartRate: number | null
  temperature: number | null
  respRate: number | null
  oxygenSat: number | null
  weight: number | null
  height: number | null
  bmi: number | null
  subjective: string | null
  diagnosis: string | null
  plan: string | null
  medicationDispensed?: boolean
  doctor?: { id: string; firstName: string; lastName: string; specialty: string | null }
  specialtyId: string | null
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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function parsePlan(plan: string | null): { text: string; medications: ParsedMedication[] } {
  if (!plan) return { text: '', medications: [] }
  try {
    const parsed = JSON.parse(plan)
    if (parsed && typeof parsed === 'object' && 'medications' in parsed) {
      return { text: parsed.text || '', medications: parsed.medications || [] }
    }
  } catch {}
  return { text: plan, medications: [] }
}

export default function NoteDetailPage() {
  const { t } = useI18n()
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { can } = usePermissions()
  const patientId = params.patientId as string
  const noteId = params.noteId as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [orgName, setOrgName] = useState('OmniDoc')
  const [loaded, setLoaded] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [patientEmail, setPatientEmail] = useState('')
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [emailError, setEmailError] = useState('')
  const [productInfoMap, setProductInfoMap] = useState<Record<string, ProductInfo>>({})
  const [dispenseStatus, setDispenseStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const planParsed = note ? parsePlan(note.plan) : { text: '', medications: [] }
  const hasMedications = planParsed.medications.length > 0

  const handleDispense = async () => {
    if (!note) return
    setDispenseStatus('loading')
    try {
      const res = await fetch(`${API_URL}/pharmacy/dispens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          patientId: note.patientId,
          noteId: note.id,
          medications: planParsed.medications.map((m) => ({
            productId: m.productId,
            quantity: m.quantity,
          })),
        }),
      })
      if (!res.ok) throw new Error('Dispense failed')
      setNote({ ...note, medicationDispensed: true })
      setDispenseStatus('done')
      setTimeout(() => setDispenseStatus('idle'), 3000)
    } catch {
      setDispenseStatus('error')
      setTimeout(() => setDispenseStatus('idle'), 3000)
    }
  }

  const handleExportPDF = async () => {
    if (!note) return
    try {
      const blob = await pdf(<ClinicalNotePDF patient={patient} note={note} orgName={orgName} />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `clinical-note-${note.id.slice(0, 8)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export PDF:', error)
    }
  }

  const handleSendToPatient = async () => {
    if (!note || !patientEmail) return
    setSendStatus('sending')
    setEmailError('')
    try {
      const res = await fetch(`${API_URL}/patients/${patientId}/notes/${noteId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: patientEmail }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to send email')
      }
      setSendStatus('sent')
    } catch (error) {
      console.error('Failed to send email:', error)
      setSendStatus('error')
      setEmailError(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  useEffect(() => {
    if (loaded) return
    setLoaded(true)
    
    // Get org name from localStorage
    if (typeof window !== 'undefined') {
      const sbOrgName = localStorage.getItem('sb-org-name')
      if (sbOrgName) setOrgName(sbOrgName)
    }
    
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [patientRes, noteRes] = await Promise.all([
        fetch(`${API_URL}/patients/${patientId}`, { credentials: 'include' }),
        fetch(`${API_URL}/patients/${patientId}/notes/${noteId}`, { credentials: 'include' })
      ])

      if (patientRes.ok) {
        const patientData = await patientRes.json()
        setPatient(patientData.patient || patientData.data || patientData)
      }

      if (noteRes.ok) {
        const noteData = await noteRes.json()
        console.log('[NoteDetail] noteData:', noteData)
        setNote(noteData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!note || planParsed.medications.length === 0) return
    const productIds = planParsed.medications.map(m => m.productId)
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/pharmacy/product-library`, { credentials: 'include' })
        if (res.ok) {
          const allProducts: any[] = await res.json()
          const map: Record<string, ProductInfo> = {}
          for (const p of allProducts) {
            if (productIds.includes(p.id)) {
              map[p.id] = { id: p.id, unitsPerBox: p.unitsPerBox || 1 }
            }
          }
          setProductInfoMap(map)
        }
      } catch {}
    }
    fetchProducts()
  }, [note?.id])

  const age = calculateAge(patient?.dateOfBirth || null)
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : ''

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="text-center py-20">
        <p className="text-error">{t('clinicalNotes.view.noteNotFound')}</p>
        <button onClick={() => router.back()} className="mt-4 text-primary">
          {t('clinicalNotes.view.back')}
        </button>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-surface text-on-surface">
      <main className="w-full max-w-none mx-0 px-0">
        <article className="min-h-screen bg-surface-container-lowest dark:bg-slate-900">
          <header className="p-8 md:p-12 border-b border-surface-container-high bg-surface dark:bg-slate-800">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
                  </div>
                  <span className="font-headline font-black tracking-tighter text-2xl text-primary">{orgName}</span>
                </div>
                <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
                  {t('clinicalNotes.view.reportTitle')}
                </h1>
                <p className="text-on-surface-variant font-medium tracking-wide text-xs uppercase">
                  {t('clinicalNotes.view.certifiedDoc')}
                </p>
              </div>
              <div className="text-right space-y-1">
                <div className="bg-surface-container rounded-lg px-4 py-2 inline-block">
                  <span className="font-bold text-primary font-headline">CASE ID: #{note.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <p className="text-on-surface-variant text-sm font-medium pt-2">{formatDate(note.createdAt)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 items-end">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                    {t('clinicalNotes.view.patientNameLabel')}
                  </label>
                  <p className="text-xl font-headline font-bold text-primary">{note.subjective || t('clinicalNotes.view.noInformation')}</p>
                </div>
                <div className="flex gap-12">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                      {t('clinicalNotes.view.gender')}
                    </label>
                    <p className="font-semibold">{patient?.gender || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">{t('patients.detail.age')}</label>
                    <p className="font-semibold">{age !== null ? `${age} ${t('clinicalNotes.view.years')}` : '-'}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="w-24 h-24 bg-surface-container rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/30">
                  <span className="material-symbols-outlined text-outline-variant text-4xl">qr_code_2</span>
                  <span className="text-[8px] uppercase tracking-tighter mt-1 font-bold">
                    {t('clinicalNotes.view.verifyEntry')}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Section 1: Vital Signs (Bento Style) */}
          <section className="p-10 bg-surface-container-low">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant mb-6 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-primary"></span>
              {t('clinicalNotes.view.sectionVitalSigns')}
            </h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-surface dark:bg-slate-800 p-5 rounded-xl border border-surface-container dark:border-slate-700">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-2">
                  {t('clinicalNotes.view.bloodPressureLabel')}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-headline font-extrabold text-primary">{note.bloodPressure || '-'}</span>
                  <span className="text-xs font-medium text-on-surface-variant">mmHg</span>
                </div>
              </div>
              <div className="bg-surface dark:bg-slate-800 p-5 rounded-xl border border-surface-container dark:border-slate-700">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-2">
                  {t('clinicalNotes.view.heartRateLabel')}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-headline font-extrabold text-primary">{note.heartRate || '-'}</span>
                  <span className="text-xs font-medium text-on-surface-variant">bpm</span>
                </div>
              </div>
              <div className="bg-surface dark:bg-slate-800 p-5 rounded-xl border border-surface-container dark:border-slate-700">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-2">
                  {t('clinicalNotes.view.temperatureLabel')}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-headline font-extrabold text-primary">{note.temperature || '-'}</span>
                  <span className="text-xs font-medium text-on-surface-variant">°C</span>
                </div>
              </div>
              <div className="bg-surface dark:bg-slate-800 p-5 rounded-xl border border-surface-container dark:border-slate-700">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-2">
                  {t('clinicalNotes.view.bmiLabel')}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-headline font-extrabold text-primary">{note.bmi || '-'}</span>
                  <span className="text-xs font-medium text-on-surface-variant">IMC</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Clinical Summary */}
          <section className="p-10 grid grid-cols-12 gap-10">
            <div className="col-span-12">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant mb-6 flex items-center gap-2">
                <span className="w-4 h-[2px] bg-primary"></span>
                {t('clinicalNotes.view.sectionClinicalSummary')}
              </h2>
            </div>
            <div className="col-span-4 space-y-2">
              <h3 className="font-headline font-bold text-on-surface">
                {t('clinicalNotes.view.chiefComplaint')}
              </h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {note.subjective || t('clinicalNotes.view.noInformation')}
              </p>
            </div>
            <div className="col-span-8 space-y-2 border-l border-surface-container dark:border-slate-700 pl-10">
              <h3 className="font-headline font-bold text-on-surface">
                {t('clinicalNotes.view.physicalExam')}
              </h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {t('clinicalNotes.view.noPhysicalExam')}
              </p>
            </div>
          </section>

          {/* Section 3: Analysis & Diagnosis (Zebra Tonal Shift) */}
          <section className="p-10 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant mb-6 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-primary"></span>
              {t('clinicalNotes.view.sectionDiagnosis')}
            </h2>
            <div className="space-y-px rounded-xl overflow-hidden border border-surface-container dark:border-slate-700">
              <div className="bg-surface dark:bg-slate-800 p-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary-container"></div>
                  <span className="font-headline font-bold text-on-surface dark:text-white">
                    {note.diagnosis || t('clinicalNotes.view.noDiagnosis')}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Treatment Plan (Glassmorphism Detail) */}
          <section className="p-10 mb-10">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant mb-6 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-primary"></span>
              {t('clinicalNotes.view.sectionTreatment')}
            </h2>
            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Pill className="w-32 h-32 text-primary" />
              </div>
              <div className="relative z-10 space-y-6">
                {hasMedications && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Pill className="w-5 h-5 text-primary" />
                      <span className="font-headline font-bold text-primary">
                        {t('clinicalNotes.view.prescribedMedications')}
                      </span>
                      {note.medicationDispensed ? (
                        <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                          <PackageCheck className="w-3 h-3" /> {t('clinicalNotes.view.dispensedStatus')}
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700">
                          {t('clinicalNotes.view.pendingDispense')}
                        </span>
                      )}
                    </div>
                    <div className="bg-surface/80 rounded-xl overflow-hidden border border-primary/10">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-primary/10 text-on-surface-variant text-[10px] uppercase tracking-widest">
                            <th className="text-left px-4 py-3 font-semibold">{t('clinicalNotes.view.medication')}</th>
                            <th className="text-center px-4 py-3 font-semibold">{t('clinicalNotes.view.qty')}</th>
                            <th className="text-left px-4 py-3 font-semibold">{t('clinicalNotes.view.instructions')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {planParsed.medications.map((med, i) => {
                              const info = productInfoMap[med.productId]
                              const unitsPerBox = info?.unitsPerBox || 1
                              const boxes = Math.floor(med.quantity / unitsPerBox)
                              const remainder = med.quantity % unitsPerBox
                              const qtyText = boxes > 0
                                ? `${boxes} caja${boxes > 1 ? 's' : ''}${remainder > 0 ? ` + ${remainder} unidade${remainder > 1 ? 's' : ''}` : ''}`
                                : `${med.quantity} unidades`
                              return (
                              <tr key={i}>
                                <td className="px-4 py-3 font-semibold text-on-surface">{med.productName}</td>
                                <td className="px-4 py-3 text-center text-on-surface-variant">
                                  <span>{med.quantity}</span>
                                  {info && (
                                    <span className="block text-[10px] text-on-surface-variant/60">{qtyText}</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-on-surface-variant">{med.instructions || '—'}</td>
                              </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                    {note.isSealed && !note.medicationDispensed && can('pharmacy', 'dispense') && (
                      <div className="mt-4">
                        <button
                          onClick={handleDispense}
                          disabled={dispenseStatus === 'loading'}
                          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                          {dispenseStatus === 'loading' ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <PackageCheck className="w-4 h-4" />
                          )}
                          {dispenseStatus === 'loading'
                            ? t('clinicalNotes.view.dispensingNow')
                            : dispenseStatus === 'done'
                              ? t('clinicalNotes.view.dispensedSuccess')
                              : dispenseStatus === 'error'
                                ? t('clinicalNotes.view.dispensedFailed')
                                : t('clinicalNotes.view.dispenseButton')}
                        </button>
                      </div>
                    )}
                    {!note.medicationDispensed && !can('pharmacy', 'dispense') && (
                      <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl text-sm">
                        <Info className="w-4 h-4 shrink-0" />
                        {t('clinicalNotes.view.pendingPharmacyDispatch')}
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary w-5 h-5">medication</span>
                      <span className="font-headline font-bold text-primary">
                        {t('clinicalNotes.view.pharmacology')}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-on-surface text-lg">
                        {planParsed.text || t('clinicalNotes.view.noPlan')}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary w-5 h-5">fitness_center</span>
                      <span className="font-headline font-bold text-primary">
                        {t('clinicalNotes.view.lifestyleChanges')}
                      </span>
                    </div>
                    <ul className="text-sm text-on-surface-variant space-y-2 list-disc list-inside">
                      <li>{t('clinicalNotes.view.scheduledFollowUp')}</li>
                      <li>{t('clinicalNotes.view.vitalSignsMonitoring')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Digital Seal & Footer */}
          <footer className="p-8 md:p-12 bg-surface-container dark:bg-slate-800 border-t border-surface-container-high dark:border-slate-700">
            <div className="flex justify-between items-end">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-surface dark:bg-slate-700 rounded-lg flex items-center justify-center border border-outline-variant/20 shadow-sm">
                    <Activity className="text-primary text-3xl" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                      {t('clinicalNotes.view.digitallySealed')}
                    </p>
                    <p className="text-xs font-mono text-on-surface-variant/70 mt-1 uppercase">
                      Hash ID: {note.signature?.slice(0, 20) || '-'}
                    </p>
                    <p className="text-xs font-semibold text-on-surface mt-1">
                      {t('clinicalNotes.view.timestampPrefix')}{formatDateTime(note.sealedAt || note.createdAt)}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  {t('clinicalNotes.view.exportPDF')}
                </button>
                <button 
                  onClick={() => setShowSendModal(true)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {t('clinicalNotes.view.sendToPatient')}
                </button>
              </div>
              <div className="text-right space-y-2">
                <div className="space-y-1">
                  <p className="font-headline font-black text-on-surface text-lg">
                    {note.doctor ? `${note.doctor.firstName} ${note.doctor.lastName}` : '-'}
                  </p>
                  <p className="text-xs font-bold text-primary tracking-widest uppercase">
                    {t('clinicalNotes.view.attendingPhysician')}
                  </p>
                </div>
                <div className="pt-4 border-t border-outline-variant/30">
                  <p className="text-[10px] text-on-surface-variant uppercase font-medium">
                    {note.doctor?.specialty || t('clinicalNotes.view.generalMedicine')}
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </article>
      </main>

      <Modal
        isOpen={showSendModal}
        onClose={() => {
          setShowSendModal(false)
          setSendStatus('idle')
          setEmailError('')
        }}
        title={t('clinicalNotes.view.sendModalTitle')}
      >
        {sendStatus === 'sent' ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <p className="font-medium text-on-surface">
              {t('clinicalNotes.view.emailSentSuccess')}
            </p>
            <button
              onClick={() => {
                setShowSendModal(false)
                setSendStatus('idle')
              }}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
            >
              {t('clinicalNotes.view.close')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-on-surface-variant">
              {t('clinicalNotes.view.sendNoteDesc')}
            </p>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                {t('clinicalNotes.view.patientEmail')}
              </label>
              <input
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-container dark:border-slate-700 bg-surface dark:bg-slate-900 text-on-surface"
                placeholder={t('clinicalNotes.view.emailPlaceholder')}
              />
              {emailError && (
                <p className="text-error text-sm mt-1">{emailError}</p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowSendModal(false)
                  setSendStatus('idle')
                }}
                className="px-4 py-2 text-on-surface-variant hover:bg-surface-container dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {t('clinicalNotes.view.cancel')}
              </button>
              <button
                onClick={handleSendToPatient}
                disabled={!patientEmail || sendStatus === 'sending'}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {sendStatus === 'sending' && <Loader className="w-4 h-4 animate-spin" />}
                {t('clinicalNotes.view.send')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}