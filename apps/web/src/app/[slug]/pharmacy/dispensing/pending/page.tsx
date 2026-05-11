'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { Pill, PackageCheck, Loader, Clock, User, ArrowLeft, X, AlertTriangle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface PendingNote {
  id: string
  createdAt: string
  patient: { id: string; firstName: string; lastName: string }
  doctor: { id: string; firstName: string; lastName: string }
}

interface ConfirmMedication {
  productId: string
  productName: string
  quantity: number
  instructions?: string
}

export default function PendingDispensingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader className="w-6 h-6 animate-spin text-primary" />
      </div>
    }>
      <PendingDispensingContent />
    </Suspense>
  )
}

function PendingDispensingContent() {
  const { t, lang } = useI18n()
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const searchParams = useSearchParams()
  const highlightNoteId = searchParams.get('noteId')

  const [pendings, setPendings] = useState<PendingNote[]>([])
  const [loading, setLoading] = useState(true)
  const [dispensingId, setDispensingId] = useState<string | null>(null)

  const [confirmNote, setConfirmNote] = useState<PendingNote | null>(null)
  const [confirmMeds, setConfirmMeds] = useState<ConfirmMedication[]>([])
  const [confirmError, setConfirmError] = useState('')
  const autoOpened = useRef(false)

  useEffect(() => {
    fetchPending()
  }, [])

  useEffect(() => {
    if (highlightNoteId && pendings.length > 0 && !autoOpened.current) {
      const note = pendings.find(n => n.id === highlightNoteId)
      if (note) {
        autoOpened.current = true
        handleOpenConfirm(note)
      }
    }
  }, [highlightNoteId, pendings])

  const fetchPending = async () => {
    try {
      const res = await fetch(`${API_URL}/pharmacy/dispens/pending`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setPendings(data)
      }
    } catch (err) {
      console.error('Failed to fetch pending:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenConfirm = async (note: PendingNote) => {
    setConfirmError('')
    try {
      const noteDetail = await fetch(`${API_URL}/patients/${note.patient.id}/notes/${note.id}`, { credentials: 'include' })
      if (!noteDetail.ok) throw new Error('Failed to fetch note')
      const noteData = await noteDetail.json()

      let planText = noteData.plan || ''
      let medications: ConfirmMedication[] = []
      try {
        const parsed = JSON.parse(planText)
        if (parsed?.medications) medications = parsed.medications
      } catch {}

      if (medications.length === 0) {
        setConfirmError('No medications found in this note')
        return
      }

      setConfirmNote(note)
      setConfirmMeds(medications)
    } catch (err) {
      setConfirmError('Failed to load medication details')
    }
  }

  const handleConfirmDispense = async () => {
    if (!confirmNote) return
    setDispensingId(confirmNote.id)
    setConfirmError('')
    try {
      const res = await fetch(`${API_URL}/pharmacy/dispens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          patientId: confirmNote.patient.id,
          noteId: confirmNote.id,
          medications: confirmMeds.map((m) => ({
            productId: m.productId,
            quantity: m.quantity,
          })),
        }),
      })

      const body = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(body?.message || 'Dispense failed')
      }

      setPendings(prev => prev.filter(p => p.id !== confirmNote.id))
      setConfirmNote(null)
      setConfirmMeds([])
    } catch (err: any) {
      setConfirmError(err.message || 'Dispense failed')
    } finally {
      setDispensingId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(`/${slug}/pharmacy/dispensing`)}
          className="p-2 rounded-lg hover:bg-surface-container transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface dark:text-white">
            {t('dispensing.pending.title')}
          </h1>
          <p className="text-sm text-on-surface-variant dark:text-slate-400">
            {pendings.length} {t('dispensing.pending.count')}
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-xl overflow-hidden">
        {pendings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PackageCheck className="w-12 h-12 text-on-surface-variant/40 mb-4" />
            <p className="text-sm text-on-surface-variant dark:text-slate-500">
              {t('dispensing.pending.empty')}
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-on-surface-variant dark:text-slate-500 uppercase tracking-widest border-b border-surface-container dark:border-slate-700">
                <th className="px-4 py-3">{t('dispensing.pending.patient')}</th>
                <th className="px-4 py-3">{t('dispensing.pending.doctor')}</th>
                <th className="px-4 py-3">{t('dispensing.pending.date')}</th>
                <th className="px-4 py-3 text-right">{t('dispensing.pending.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container dark:divide-slate-700/50">
              {pendings.map((note) => (
                <tr
                  key={note.id}
                  className={`hover:bg-surface-container dark:hover:bg-slate-700/30 transition-colors ${
                    highlightNoteId === note.id ? 'bg-primary/5 dark:bg-primary/10' : ''
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-on-surface dark:text-white">
                        {note.patient.firstName} {note.patient.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-on-surface-variant dark:text-slate-400">
                    {note.doctor.firstName} {note.doctor.lastName}
                  </td>
                  <td className="px-4 py-4 text-sm text-on-surface-variant dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(note.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => handleOpenConfirm(note)}
                      disabled={dispensingId === note.id}
                      className="px-4 py-2 bg-gradient-to-br from-primary to-primary-container text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5 ml-auto"
                    >
                      {dispensingId === note.id ? (
                        <Loader className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <PackageCheck className="w-3.5 h-3.5" />
                      )}
                      {t('dispensing.pending.dispense')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!dispensingId) { setConfirmNote(null); setConfirmMeds([]) } }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-surface-container-lowest rounded-xl shadow-[0_40px_80px_-15px_rgba(25,28,30,0.1)] overflow-hidden border border-outline-variant/10"
            >
              <div className="bg-gradient-to-br from-primary to-primary-container px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <PackageCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Confirmar Despacho</h2>
                    <p className="text-white/80 text-xs">
                      {confirmNote.patient.firstName} {confirmNote.patient.lastName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { if (!dispensingId) { setConfirmNote(null); setConfirmMeds([]) } }}
                  className="p-1.5 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <p className="text-sm text-on-surface-variant">
                  Revisa los medicamentos a despachar:
                </p>

                <div className="space-y-3">
                  {confirmMeds.map((med, i) => (
                    <div key={med.productId || i} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Pill className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-on-surface">{med.productName}</p>
                            {med.instructions && (
                              <p className="text-xs text-on-surface-variant mt-0.5">{med.instructions}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-extrabold text-primary whitespace-nowrap">
                          x{med.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {confirmError && (
                  <div className="p-3 rounded-lg bg-error-container/10 border border-error-container/30 flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-error flex-shrink-0" />
                    <p className="text-xs font-medium text-error">{confirmError}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setConfirmNote(null); setConfirmMeds([]); setConfirmError('') }}
                    disabled={!!dispensingId}
                    className="flex-1 px-4 py-2.5 border border-outline-variant text-on-surface-variant rounded-lg text-sm font-bold hover:bg-surface-container transition-all disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmDispense}
                    disabled={!!dispensingId}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {dispensingId === confirmNote.id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <PackageCheck className="w-4 h-4" />
                    )}
                    Despachar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
