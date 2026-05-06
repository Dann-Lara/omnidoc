# 07-Patients - Historial Clínico (Línea de Tiempo)

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Módulo** | Historial Clínica |
| **Estado** | ⏳ Pendiente (mockup pendiente) |
| **Dependencias** | 01-schema, 02-api, 04-acto-medico |

---

## 🎯 Propósito

Implementar el historial clínico como una línea de tiempo invertible, fácil de escanear para interconsultas.

Criterios AC 3.1, 3.2, 3.3

---

## 📋 Diseño UI

### Timeline Vertical

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HISTORIAL CLÍNICO                                    [+ Nueva Nota]       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ▼ 21 abr 2026                                                           │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 🏥 Cardiología - Dr. Juan Pérez                                     │ │
│ │                                                                     │ │
│ │ Signs: 120/80 • 72 ppm • 36.5°C • 98% • 70kg • 170cm (24.5)     │ │
│ │                                                                     │ │
│ │ Resumen: Paciente refiere dolor torácico. No irradiation.             │ │
│ │ Diagnóstico: Dorsalgia mecánica                                        │ │
│ │ Plan: Diclofenaco 50mg c/8h x 5 días                             │ │
│ │                                                                     │ │
│ │ [🔒 SELLADO] 21 abr 2026 14:30 | Dr. Juan Pérez             │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│       └─ [COLAPSAR]                                                     │
│                                                                         │
│ ▼ 15 mar 2026                                                           │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 🏥 Medicina General - Dra. María García                           │ │
│ │                                                                     │ │
│ │ Resumen: Gripe común                                               │ │
│ │ Diagnóstico: Resfriado                                               │ │
│ │ Plan: Paracetamol 500mg c/6h                                     │ │
│ │                                                                     │ │
│ │ [🔒 SELLADO] 15 mar 2026 10:15 │ Dra. María García                 │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│       └��� [EXPANDIR]                                                     │
│                                                                         │
│ ▼ 02 feb 2026                                                           │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 🏥 Dermatología - Dr. Carlos López                                 │ │
│ │ ... (nota colapsada)                                             │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│       └─ [EXPANDIR]                                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Página: Historial

Ubicación: `apps/web/src/app/[slug]/areas/patients/[patientId]/history/page.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { Plus, ChevronDown, ChevronUp, Lock, User } from 'lucide-react'
import { TimelineItem } from '../../components/TimelineItem'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface PatientNote {
  id: string
  createdAt: string
  isSealed: boolean
  sealedAt?: string
  signature?: string
  specialty: { id: string; name: string }
  doctor: { firstName: string; lastName: string }
  bloodPressure?: string
  heartRate?: number
  temperature?: number
  oxygenSat?: number
  weight?: number
  height?: number
  bmi?: number
  subjective?: string
  diagnosis?: string
  plan?: string
}

interface Props {
  patientId: string
}

export default function PatientHistoryPage() {
  const { lang, t } = useI18n()
  const params = useParams()
  const router = useRouter()
  const patientId = params.patientId as string

  const [notes, setNotes] = useState<PatientNote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchNotes()
  }, [patientId])

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API_URL}/patients/${patientId}/notes`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setNotes(data)
        // Por defecto, expandir solo las 3 más recientes
        const recent = new Set(data.slice(0, 3).map((n: PatientNote) => n.id))
        setExpandedIds(recent)
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleExpand = (noteId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(noteId)) {
        next.delete(noteId)
      } else {
        next.add(noteId)
      }
      return next
    })
  }

  const allExpanded = expandedIds.size === notes.length
  const toggleAll = () => {
    if (allExpanded) {
      setExpandedIds(new Set())
    } else {
      setExpandedIds(new Set(notes.map((n) => n.id)))
    }
  }

  return (
    <motion.div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('patients.history.title')}</h1>
        {permissions.notes?.write && (
          <button
            onClick={() => router.push(`/${slug}/areas/patients/${patientId}/new-note`)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            {t('patients.history.newNote')}
          </button>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={toggleAll}
          className="text-sm text-on-surface-variant flex items-center gap-1"
        >
          {allExpanded ? (
            <><ChevronUp className="w-4 h-4" /> {t('patients.history.collapseAll')}</>
          ) : (
            <><ChevronDown className="w-4 h-4" /> {t('patients.history.expandAll')}</>
          )}
        </button>
      </div>

      {isLoading ? (
        <Loader />
      ) : notes.length === 0 ? (
        <EmptyState message={t('patients.history.noNotes')} />
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <TimelineItem
              key={note.id}
              note={note}
              isExpanded={expandedIds.has(note.id)}
              onToggle={() => toggleExpand(note.id)}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
```

### Componente: TimelineItem

```tsx
interface TimelineItemProps {
  note: PatientNote
  isExpanded: boolean
  onToggle: () => void
}

export function TimelineItem({ note, isExpanded, onToggle }: TimelineItemProps) {
  const { t, lang } = useI18n()
  const date = new Date(note.createdAt)
  const formattedDate = date.toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="border-l-2 border-primary/30 pl-4 pb-4">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-left w-full"
      >
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <span>▼</span>
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button className="text-right">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        className="overflow-hidden"
      >
        {isExpanded && (
          <div className="bg-surface-container rounded-xl p-4 mt-2 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-on-surface-variant">{t('patients.history.specialty')}</span>
              <span className="font-semibold">{note.specialty?.name}</span>
              <span className="text-on-surface-variant">-</span>
              <span className="font-semibold">
                {note.doctor.firstName} {note.doctor.lastName}
              </span>
            </div>

            {/* Signos vitales */}

            {hasVitalSigns(note) && (
              <div className="flex flex-wrap gap-2 text-sm">
                {note.bloodPressure && (
                  <VitalBadge>{note.bloodPressure}</VitalBadge>
                )}
                {note.heartRate && (
                  <VitalBadge>{note.heartRate} ppm</VitalBadge>
                )}
                {note.temperature && (
                  <VitalBadge>{note.temperature}°C</VitalBadge>
                )}
                {note.oxygenSat && (
                  <VitalBadge>{note.oxygenSat}%</VitalBadge>
                )}
                {note.weight && note.height && note.bmi && (
                  <VitalBadge>
                    {note.weight}kg / {note.height}cm ({note.bmi})
                  </VitalBadge>
                )}
              </div>
            )}

            {/* Contenido */}
            {note.subjective && (
              <ContentBlock label={t('patients.act.subjective')} value={note.subjective} />
            )}
            {note.diagnosis && (
              <ContentBlock label={t('patients.act.diagnosis')} value={note.diagnosis} />
            )}
            {note.plan && (
              <ContentBlock label={t('patients.act.plan')} value={note.plan} />
            )}

            {/* Sellado */}
            {note.isSealed && (
              <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/20">
                <Lock className="w-4 h-4 text-green-500" />
                <span className="text-xs font-semibold text-green-500">
                  {t('patients.history.sealed')}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {note.sealedAt} | {note.doctor.firstName} {note.doctor.lastName}
                </span>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
```

---

## 🔐 Permisos Requeridos

| Permiso | Acción |
|--------|--------|
| `notes:read` | Ver historial |
| `notes:write` | Nueva nota |

---

## ✅ Criterios de Aceptación (AC)

| AC | Descripción | Criterio |
|----|------------|----------|
| 3.1 | Cronológico inverso | Ordenar por createdAt DESC |
| 3.2 | Info visible | Fecha, especialidad, nombre médico |
| 3.3 | Expandir/colapsar | Accordion con animation |

---

## 🎨 Estilos

```css
/* Timeline */
.timeline {
  @apply border-l-2 border-primary/30 pl-4;
}

.timeline-item {
  @apply bg-surface-container rounded-xl p-4;
}

/* Vital badge */
.vital-badge {
  @apply px-2 py-1 bg-surface-container-low rounded text-xs font-medium;
}
```

---

## 🚀 Pasos de Ejecución

1. **Crear página** `/areas/patients/[patientId]/history/page.tsx`
2. **Crear componente** `TimelineItem`
3. **Crear componente** `TimelineNote`
4. **Implementar** expand/collapse
5. **Integrar** fetch notes
6. **Mockup** pendiente (AC 3.2)
7. **Typecheck**

---

## 🔗 Dependencias

- Schema en `01-schema`
- API en `02-api`
- Acto médico en `04-acto-medico`