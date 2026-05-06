# 07-Patients - Acto Médico (Nueva Nota)

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Módulo** | Acto Médico |
| **Estado** | ⏳ Pendiente |
| **Dependencias** | 01-schema, 02-api, 03-directory |

---

## 🎯 Propósito

Implementar la interfaz de "Nueva Nota" para el registro de la consulta médica. Este registro es inmutable por cumplimiento normativo.

Criterios AC 2.1, 2.2, 2.3

---

## 📋 Diseño UI

### Página: Nueva Nota

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Volver                                     Dr. Juan Pérez │
├─────────────────────────────────────────────────────────────────────────┤
│ DATOS DEL PACIENTE                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Nombre: Carlos López    │ ID: DNI-12345 │ F.Nac: 01/01/70│ │
│ │ Alergias: ⚠️ Penicilina │ Tipo Sangre: O+               │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ SIGNOS VITALES                                          │
│ ┌──────────────┬──────────────┬──────────────┬───────────┐ │
│ │ P. Arterial │ Frec. Card. │ Temperatura │ Frec.    │ │
│ │ 120/80 mmHg│ 72 ppm      │ 36.5 °C    │ 16 rpm   │ │
│ └──────────────┴──────────────┴──────────────┴───────────┘ │
│ ┌──────────────┬──────────────┬──────────────┐                 │
│ │ Sat. O2    │ Peso       │ Talla      │ → IMC: 24.5 │
│ │ 98%       │ 70 kg     │ 170 cm     │            │
│ └──────────────┴──────────────┴──────────────┘                 │
├─────────────────────────────────────────────────────────────────────────┤
│ RESUMEN / SUBJETIVO                                      │
│ │ [Motivo de consulta y padecimiento actual...]           │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ DIAGNÓSTICO                                             │
│ │ [Impresión diagnóstica...]                           │ │
│ │ Suggestion: [Hipertensión] [Diabetes] [Gripe]      │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ PLAN / RECETA                                            │
│ │ [Medicamentos, dosis y duración...]                    │ │
│ │ Catálogo: [Losartán 50mg] [Metformina 500mg]           │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ☑ Paciente con enfermedades crónicas                       │
├─────────────────────────────────────────────────────────────────────────┤
│                        [CANCELAR]  [GUARDAR Y SELLAR]   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Modal de Confirmación (Sellado)

```
┌─────────────────────────────────────────┐
│ ⚠️Confirmar Registro                   │
├─────────────────────────────────────────┤
│                                         │
│ Estás por finalizar el registro.          │
│ Una vez guardado, esta nota no podrá ser   │
│ editada ni eliminada por motivos legales.   │
│                                         │
│ ¿Deseas confirmar?                     │
│                                         │
│         [CANCELAR]  [CONFIRMAR]        │
└─────────────────────────────────────────┘
```

---

## 🎯 Form: MedicalNoteForm

Ubicación: `apps/web/src/app/[slug]/areas/patients/[patientId]/new-note/page.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { 
  Heart, 
  Thermometer, 
  Wind, 
  Activity, 
  Scale, 
  Ruler,
  AlertTriangle,
  Save,
  X
} from 'lucide-react'
import { ConfirmSealModal } from '../../components/ConfirmSealModal'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Patient {
  id: string
  firstName: string
  lastName: string
  documentType: string
  documentId: string
  dateOfBirth?: string
  allergies: string[]
  bloodType?: string
}

interface NoteForm {
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
}

export default function NewNotePage() {
  const { lang, t } = useI18n()
  const params = useParams()
  const router = useRouter()
  const patientId = params.patientId as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [form, setForm] = useState<NoteForm>({
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
  })
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const bmi = form.weight && form.height 
    ? (parseFloat(form.weight) / Math.pow(parseFloat(form.height) / 100, 2)).toFixed(1)
    : null

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`${API_URL}/patients/${patientId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          bmi: bmi ? parseFloat(bmi) : null,
        }),
      })
      if (res.ok) {
        router.push(`/${params.slug}/areas/patients/${patientId}/history`)
      }
    } catch (error) {
      console.error('Failed to save note:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div className="space-y-6 max-w-4xl mx-auto">
      {/* Datos del paciente */}
      <section className="bg-surface-container rounded-xl p-4">
        <h2 className="text-sm font-bold text-on-surface-variant uppercase mb-3">
          {t('patients.directory.title')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-on-surface-variant">{t('patients.directory.name')}</span>
            <p className="font-semibold">{patient?.firstName} {patient?.lastName}</p>
          </div>
          <div>
            <span className="text-on-surface-variant">{t('patients.directory.id')}</span>
            <p className="font-semibold">{patient?.documentType}-{patient?.documentId}</p>
          </div>
          <div>
            <span className="text-on-surface-variant">{t('patients.directory.allergies')}</span>
            {patient?.allergies?.length > 0 ? (
              <p className="font-semibold text-red-500">⚠️ {patient.allergies.join(', ')}</p>
            ) : (
              <p className="text-on-surface-variant">Ninguna</p>
            )}
          </div>
          <div>
            <span className="text-on-surface-variant">{t('patients.form.bloodType')}</span>
            <p className="font-semibold">{patient?.bloodType || '-'}</p>
          </div>
        </div>
      </section>

      {/* Signos vitales */}
      <section className="bg-surface-container rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          {t('patients.act.vitalSigns')}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <VitalInput
            label={t('patients.act.bloodPressure')}
            icon={<Heart className="w-4 h-4" />}
            value={form.bloodPressure}
            onChange={(v) => setForm({ ...form, bloodPressure: v })}
            placeholder="120/80"
          />
          <VitalInput
            label={t('patients.act.heartRate')}
            icon={<Heart className="w-4 h-4" />}
            value={form.heartRate}
            onChange={(v) => setForm({ ...form, heartRate: v })}
            placeholder="72"
            suffix="ppm"
          />
          <VitalInput
            label={t('patients.act.temperature')}
            icon={<Thermometer className="w-4 h-4" />}
            value={form.temperature}
            onChange={(v) => setForm({ ...form, temperature: v })}
            placeholder="36.5"
            suffix="°C"
          />
          <VitalInput
            label={t('patients.act.respRate')}
            icon={<Wind className="w-4 h-4" />}
            value={form.respRate}
            onChange={(v) => setForm({ ...form, respRate: v })}
            placeholder="16"
            suffix="rpm"
          />
          <VitalInput
            label={t('patients.act.oxygenSat')}
            icon={<Activity className="w-4 h-4" />}
            value={form.oxygenSat}
            onChange={(v) => setForm({ ...form, oxygenSat: v })}
            placeholder="98"
            suffix="%"
          />
          <VitalInput
            label={t('patients.act.weight')}
            icon={<Scale className="w-4 h-4" />}
            value={form.weight}
            onChange={(v) => setForm({ ...form, weight: v })}
            placeholder="70"
            suffix="kg"
          />
          <VitalInput
            label={t('patients.act.height')}
            icon={<Ruler className="w-4 h-4" />}
            value={form.height}
            onChange={(v) => setForm({ ...form, height: v })}
            placeholder="170"
            suffix="cm"
          />
          <div className="flex items-center justify-center bg-surface-container-low rounded-lg">
            <span className="text-on-surface-variant text-sm">{t('patients.act.bmi')}</span>
            <span className="text-xl font-bold ml-2">{bmi || '-'}</span>
          </div>
        </div>
      </section>

      {/* Contenido clínico */}
      <div className="space-y-4">
        <ClinicalTextarea
          label={t('patients.act.subjective')}
          value={form.subjective}
          onChange={(v) => setForm({ ...form, subjective: v })}
          placeholder={t('patients.act.subjectivePlaceholder')}
        />
        
        <ClinicalTextarea
          label={t('patients.act.diagnosis')}
          value={form.diagnosis}
          onChange={(v) => setForm({ ...form, diagnosis: v })}
          placeholder={t('patients.act.diagnosisPlaceholder')}
        />
        
        <ClinicalTextarea
          label={t('patients.act.plan')}
          value={form.plan}
          onChange={(v) => setForm({ ...form, plan: v })}
          placeholder={t('patients.act.planPlaceholder')}
        />
      </div>

      {/* Cronicidad */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isChronic}
          onChange={(e) => setForm({ ...form, isChronic: e.target.checked })}
          className="w-5 h-5 rounded text-primary"
        />
        <span className="text-sm font-medium">
          {t('patients.form.isChronic')}
        </span>
      </label>

      {/* Acciones */}
      <div className="flex justify-end gap-4 pt-6 border-t border-outline-variant">
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 text-sm font-semibold text-on-surface-variant"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={() => setShowConfirmModal(true)}
          className="btn-primary"
        >
          <Save className="w-4 h-4" />
          {t('patients.act.saveAndSeal')}
        </button>
      </div>

      {showConfirmModal && (
        <ConfirmSealModal
          onConfirm={handleSubmit}
          onCancel={() => setShowConfirmModal(false)}
          isLoading={isSaving}
        />
      )}
    </motion.div>
  )
}
```

### Componente: ConfirmSealModal

```tsx
export function ConfirmSealModal({ onConfirm, onCancel, isLoading }: Props) {
  const { t } = useI18n()
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-xl p-6 max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-bold">{t('patients.act.confirmSeal')}</h3>
        </div>
        
        <p className="text-on-surface-variant mb-6">
          {t('patients.act.sealWarning')}
        </p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2.5 text-sm font-semibold text-on-surface-variant"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading 
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 🔐 Permisos Requeridos

| Permiso | Acción |
|--------|--------|
| `notes:write` | Crear nota |
| `notes:seal` | Sellar nota |

---

## ✅ Criterios de Aceptación (AC)

| AC | Descripción | Criterio |
|----|------------|----------|
| 2.1 | Signos vitales | bloodPressure, heartRate, temperature, respRate, oxygenSat, weight, height, bmi |
| 2.1 | Resumen/subjetivo | Campo text obligatorio |
| 2.1 | Diagnóstico | Campo text + sugerencias |
| 2.1 | Plan/receta | Campo text + catálogo medicamentos |
| 2.1 | Cronicidad | Toggle, actualiza `isChronic` en Patient |
| 2.2 | Modal confirmación | Antes de guardar |
| 2.3 | Sellado | timestamp + doctorId hash |

---

## 🎨 Estilos

```css
/* Vital input */
.vital-input {
  @apply bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm;
  @apply focus:ring-2 focus:ring-primary/20;
}

/* Clinical textarea */
.clinical-textarea {
  @apply w-full bg-surface-container rounded-xl p-4 min-h-[120px];
  @apply border-none text-sm;
  @apply focus:ring-2 focus:ring-primary/20;
}

/* Confirm modal */
.confirm-modal {
  @apply bg-surface-container-lowest dark:bg-slate-800 rounded-xl p-6 max-w-md;
}
```

---

## 🚀 Pasos de Ejecución

1. **Crear página** `/areas/patients/[patientId]/new-note/page.tsx`
2. **Crear componente** `MedicalNoteForm`
3. **Crear componente** `ConfirmSealModal`
4. **Implementar cálculo IMC** automático
5. **Integrar sugerencias** de diagnóstico (mockup pendiente)
6. **Integrar catálogo** medicamentos (pendiente)
7. **Probar** sellado
8. **Typecheck**

---

## 🔗 Dependencias

- Schema en `01-schema`
- API en `02-api`
- Directorio en `03-directory`