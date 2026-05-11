'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { Heart, X, Loader2, Activity, Thermometer, Wind, Droplets, Weight, Ruler, Calculator, CheckCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getBmiCategory(bmi: number, t: (path: string) => string): { label: string; color: string; bg: string } {
  if (bmi < 18.5) return { label: t('vitals.bmiUnderweight'), color: 'text-amber-700', bg: 'bg-amber-50' }
  if (bmi < 25) return { label: t('vitals.bmiNormal'), color: 'text-emerald-700', bg: 'bg-emerald-50' }
  if (bmi < 30) return { label: t('vitals.bmiOverweight'), color: 'text-amber-700', bg: 'bg-amber-50' }
  return { label: t('vitals.bmiObese'), color: 'text-rose-700', bg: 'bg-rose-50' }
}

interface VitalsModalProps {
  appointmentId: string
  patientName: string
  onClose: () => void
  onSaved: () => void
}

export function VitalsModal({ appointmentId, patientName, onClose, onSaved }: VitalsModalProps) {
  const { t } = useI18n()

  const [systolic, setSystolic] = useState('')
  const [diastolic, setDiastolic] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [temperature, setTemperature] = useState('')
  const [respRate, setRespRate] = useState('')
  const [oxygenSat, setOxygenSat] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [subjective, setSubjective] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const numWeight = weight ? parseFloat(weight) : null
  const numHeight = height ? parseFloat(height) : null
  const bmi = numWeight && numHeight ? numWeight / Math.pow(numHeight / 100, 2) : null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const bloodPressure = systolic || diastolic ? `${systolic || '?'}/${diastolic || '?'}` : undefined
      const res = await fetch(`${API_URL}/appointments/${appointmentId}/vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bloodPressure,
          heartRate: heartRate ? parseInt(heartRate) : undefined,
          temperature: temperature ? parseFloat(temperature) : undefined,
          respRate: respRate ? parseInt(respRate) : undefined,
          oxygenSat: oxygenSat ? parseInt(oxygenSat) : undefined,
          weight: numWeight,
          height: numHeight,
          subjective: subjective || undefined,
        }),
      })
      if (res.ok) {
        onSaved()
        onClose()
      }
    } catch (error) {
      console.error('Failed to save vitals:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const bmiCategory = bmi ? getBmiCategory(bmi, t) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-surface-container-lowest rounded-xl shadow-[0_40px_80px_-15px_rgba(25,28,30,0.1)] overflow-hidden border border-outline-variant/10"
      >
        {/* Patient Header */}
        <div className="bg-primary px-8 py-6 flex justify-between items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container opacity-90" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight leading-none">{patientName}</h2>
              <p className="text-white/80 font-medium text-sm mt-1">{t('vitals.title')}</p>
            </div>
          </div>
          <button onClick={onClose} className="relative z-10 p-2 text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-10 max-h-[70vh] overflow-y-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-on-surface">{t('vitals.title')}</h3>
              <p className="text-sm text-on-surface-variant">Real-time physiological assessment</p>
            </div>
            <div className="px-3 py-1 bg-surface-container-high rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Live Sync Active</span>
            </div>
          </div>

          {/* Vitals Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Blood Pressure — spans 2 cols */}
            <div className="md:col-span-2 p-5 rounded-xl bg-surface-container-low border-l-4 border-primary/40 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{t('vitals.bloodPressure')}</span>
              </div>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="120"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    className="w-full bg-surface-container-lowest border-none rounded-lg text-2xl font-bold text-on-surface p-3 focus:ring-2 ring-primary/20 transition-all text-center"
                  />
                  <span className="block text-[10px] text-center mt-1 font-medium text-on-surface-variant/60">{t('vitals.systolic')}</span>
                </div>
                <span className="text-3xl font-light text-outline-variant mb-4">/</span>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="80"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    className="w-full bg-surface-container-lowest border-none rounded-lg text-2xl font-bold text-on-surface p-3 focus:ring-2 ring-primary/20 transition-all text-center"
                  />
                  <span className="block text-[10px] text-center mt-1 font-medium text-on-surface-variant/60">{t('vitals.diastolic')}</span>
                </div>
                <span className="mb-5 font-semibold text-outline text-sm">mmHg</span>
              </div>
            </div>

            {/* Heart Rate */}
            <div className="p-5 rounded-xl bg-surface-container-low flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-rose-500" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{t('vitals.heartRate')}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  placeholder="72"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="w-full bg-surface-container-lowest border-none rounded-lg text-2xl font-bold text-on-surface p-3 focus:ring-2 ring-primary/20 transition-all"
                />
                <span className="font-semibold text-outline text-xs">bpm</span>
              </div>
            </div>

            {/* Temperature */}
            <div className="p-5 rounded-xl bg-surface-container-low flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <Thermometer className="w-5 h-5 text-amber-500" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{t('vitals.temperature')}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder="36.6"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full bg-surface-container-lowest border-none rounded-lg text-2xl font-bold text-on-surface p-3 focus:ring-2 ring-primary/20 transition-all"
                />
                <span className="font-semibold text-outline text-xs">°C</span>
              </div>
            </div>

            {/* O2 Sat */}
            <div className="p-5 rounded-xl bg-surface-container-low flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{t('vitals.oxygenSat')}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  placeholder="98"
                  value={oxygenSat}
                  onChange={(e) => setOxygenSat(e.target.value)}
                  className="w-full bg-surface-container-lowest border-none rounded-lg text-2xl font-bold text-on-surface p-3 focus:ring-2 ring-primary/20 transition-all"
                />
                <span className="font-semibold text-outline text-xs">%</span>
              </div>
            </div>

            {/* Respiratory */}
            <div className="p-5 rounded-xl bg-surface-container-low flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <Wind className="w-5 h-5 text-cyan-500" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{t('vitals.respiratoryRate')}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  placeholder="16"
                  value={respRate}
                  onChange={(e) => setRespRate(e.target.value)}
                  className="w-full bg-surface-container-lowest border-none rounded-lg text-2xl font-bold text-on-surface p-3 focus:ring-2 ring-primary/20 transition-all"
                />
                <span className="font-semibold text-outline text-xs">/min</span>
              </div>
            </div>

            {/* Weight */}
            <div className="p-5 rounded-xl bg-surface-container-low flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <Weight className="w-5 h-5 text-purple-500" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{t('vitals.weight')}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-surface-container-lowest border-none rounded-lg text-2xl font-bold text-on-surface p-3 focus:ring-2 ring-primary/20 transition-all"
                />
                <span className="font-semibold text-outline text-xs">kg</span>
              </div>
            </div>

            {/* Height */}
            <div className="p-5 rounded-xl bg-surface-container-low flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <Ruler className="w-5 h-5 text-emerald-600" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{t('vitals.height')}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder="170"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-surface-container-lowest border-none rounded-lg text-2xl font-bold text-on-surface p-3 focus:ring-2 ring-primary/20 transition-all"
                />
                <span className="font-semibold text-outline text-xs">cm</span>
              </div>
            </div>

            {/* Calculated BMI */}
            <div className="p-5 rounded-xl bg-secondary-container/30 border border-secondary-container flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-secondary" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-secondary">{t('vitals.bmi')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-secondary">
                  {bmi ? bmi.toFixed(1) : '—'}
                </span>
                {bmiCategory && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${bmiCategory.bg} ${bmiCategory.color}`}>
                    {bmiCategory.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Subjective Notes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{t('vitals.subjective')}</span>
              <span className="text-[10px] text-outline italic">Clinician Notes</span>
            </div>
            <textarea
              value={subjective}
              onChange={(e) => setSubjective(e.target.value)}
              placeholder={t('vitals.subjectivePlaceholder')}
              rows={4}
              className="w-full bg-surface-container-low border-none rounded-xl p-5 text-sm text-on-surface focus:ring-2 ring-primary/10 transition-all resize-none placeholder:text-outline/40 leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-outline-variant/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all active:scale-95"
            >
              Discard Entry
            </button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-3 text-sm font-bold text-primary-container border-2 border-primary-container hover:bg-primary-container/5 rounded-lg transition-all active:scale-95 disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                {t('vitals.saveAndWait')}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
