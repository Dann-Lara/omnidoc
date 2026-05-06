# 05-Edit Appointment - Edición de Cita

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Fase** | 05 - Edit Appointment |
| **Estado** | 🔄 Pendiente |
| **Dependencias** | Fase 02 (API), maqueta "Edit Appointment" |

---

## 🎯 Propósito

Crear la vista de edición de citas (`/[slug]/operations/appointments/[appointmentId]/edit/page.tsx`) basada en la maqueta "Edit Appointment" con soporte para cambio de estado y log de auditoría.

---

## 📁 Estructura de Archivos

```
apps/web/src/app/[slug]/operations/appointments/
├── [appointmentId]/
│   ├── page.tsx                  # Detalle de cita
│   └── edit/
│       └── page.tsx              # Editar cita
└── components/
    ├── AppointmentDetail.tsx      # Vista detalle
    ├── EditForm.tsx              # Formulario edición
    └── AuditLog.tsx             # Log de auditoría
```

---

## 🎨 Diseño Basado en Maqueta

La maqueta "Edit Appointment" muestra:
1. **Header** "Edit Appointment" con Record ID y estado actual
2. **Main Form Pane**:
   - Patient Identity (read-only con opción de cambiar)
   - Assigned Specialist (dropdown)
   - Schedule Window (fecha + hora)
   - Lifecycle Status (dropdown: Confirmada, Pendiente, Cancelada)
   - Consultation Context (textarea)
3. **Sidebar / Metadata Pane**:
   - History Log (auditoría)
   - Patient Overview (stats)
   - Map / Location
4. **Action Bar**: Eliminar Cita + Descartar + Actualizar Cita

---

## 🏗️ `edit/page.tsx` - Estructura

```tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { useRouter, useParams } from 'next/navigation'
import { Delete, CheckCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function EditAppointmentPage() {
  const { t, lang } = useI18n()
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const appointmentId = params.appointmentId as string

  const [appointment, setAppointment] = useState(null)
  const [formData, setFormData] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchAppointment()
  }, [appointmentId])

  const fetchAppointment = async () => {
    try {
      const res = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setAppointment(data)
        setFormData({
          patientId: data.patientId,
          doctorId: data.doctorId,
          scheduledAt: data.scheduledAt?.split('T')[0],
          time: data.scheduledAt?.split('T')[1]?.slice(0, 5),
          status: data.status,
          reason: data.reason,
        })
      }
    } catch (error) {
      console.error('Failed to fetch appointment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/${slug}/operations/appointments`)
      }
    } catch (error) {
      console.error('Failed to update appointment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(t('appointments.form.deleteConfirm'))) return

    try {
      await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      router.push(`/${slug}/operations/appointments`)
    } catch (error) {
      console.error('Failed to delete appointment:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="pt-24 pb-24 px-8 w-full max-w-7xl">
      {/* Header */}
      <header className="mb-10 flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <ArrowLeft className="text-blue-900 w-4 h-4 cursor-pointer" onClick={() => router.push(`/${slug}/operations/appointments`)} />
            <span className="text-xs font-bold text-blue-900/60 uppercase tracking-widest">
              Back to Calendar
            </span>
          </div>
          <h2 className="text-4xl font-extrabold text-blue-900 tracking-tight">
            {t('appointments.form.editTitle')}
          </h2>
          <p className="text-on-surface-variant font-medium">
            Record ID: #{appointment?.id?.slice(0, 8)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold tracking-tight flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            {appointment?.status}
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-8">
          {/* Main Form */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <EditForm
              appointment={appointment}
              formData={formData}
              onChange={setFormData}
            />
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <AuditLog appointmentId={appointmentId} />
            <PatientOverview patientId={appointment?.patientId} />
          </div>
        </div>

        {/* Action Bar */}
        <footer className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex items-center justify-between border-t border-slate-50 mt-8">
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-3 rounded-lg text-error font-bold text-sm flex items-center gap-2 hover:bg-error-container/20 transition-colors"
          >
            <Delete className="w-4 h-4" />
            Eliminar Cita
          </button>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push(`/${slug}/operations/appointments`)}
              className="px-6 py-3 rounded-lg text-on-surface-variant font-bold text-sm hover:bg-surface-container-high transition-colors"
            >
              Descartar Cambios
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-lg bg-gradient-to-br from-primary to-primary-container text-white font-bold text-sm shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Actualizar Cita
            </button>
          </div>
        </footer>
      </form>
    </div>
  )
}
```

---

## 🔧 `AuditLog.tsx`

Muestra el historial de cambios de la cita (basado en maqueta):

```tsx
'use client'

import { useI18n } from '@/lib/i18n'
import { History, CheckCircle } from 'lucide-react'

export function AuditLog({ appointmentId }: { appointmentId: string }) {
  const { t } = useI18n()
  
  // Mock data - replace with API call to /appointments/:id/audit
  const logs = [
    { id: 1, action: 'Created by Receptionist A', date: 'Oct 12, 2024 • 09:12 AM', icon: 'circle' },
    { id: 2, action: 'Status changed to Confirmada', date: 'Oct 14, 2024 • 11:30 AM', icon: 'circle' },
    { id: 3, action: 'Last updated by Dr. Smith', date: 'Oct 20, 2024 • 16:45 PM', icon: 'circle', note: 'Updated clinical notes...' },
  ]

  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
      <h3 className="text-sm font-extrabold text-blue-900 mb-6 flex items-center gap-2">
        <History className="w-4 h-4" />
        Audit Log
      </h3>
      <div className="relative space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
        {logs.map((log) => (
          <div key={log.id} className="relative pl-8">
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border-4 border-slate-200 flex items-center justify-center">
              <div className={`w-1.5 h-1.5 rounded-full ${
                log.icon === 'check' ? 'bg-primary' : 'bg-slate-400'
              }`}></div>
            </div>
            <p className="text-xs font-bold text-on-surface">{log.action}</p>
            <p className="text-[10px] text-on-surface-variant mt-1">{log.date}</p>
            {log.note && (
              <div className="mt-2 p-2 rounded bg-surface-container-low border border-slate-100 italic text-[10px] text-slate-500">
                "{log.note}"
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
```

---

## 🔧 Integración de Cambio de Estado

Usar `PATCH /appointments/:id/status` para cambios rápidos de estado sin actualizar todo el formulario:

```tsx
const handleStatusChange = async (newStatus: string) => {
  try {
    await fetch(`${API_URL}/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus }),
    })
    fetchAppointment() // Refresh
  } catch (error) {
    console.error('Failed to update status:', error)
  }
}
```

---

## ✅ Criterios de Aceptación

- [ ] Página `edit/page.tsx` creada
- [ ] Formulario pre-llenado con datos de la cita
- [ ] Campo "Lifecycle Status" funcional (dropdown)
- [ ] Componente `AuditLog.tsx` muestra historial
- [ ] Botón "Eliminar Cita" con confirmación
- [ ] Actualización via `PUT /appointments/:id`
- [ ] Cambio de estado via `PATCH /appointments/:id/status`
- [ ] i18n con claves `appointments.form.*`
- [ ] Botón "Back to Calendar" funcional

---

## 🔗 Siguiente Fase

**06-specialty-integration/README.md** → Integración con vista especialidad
