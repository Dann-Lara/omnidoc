# 04-New Appointment - Formulario Nueva Cita

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Fase** | 04 - New Appointment |
| **Estado** | 🔄 Pendiente |
| **Dependencias** | Fase 02 (API), maqueta "Nueva Cita" |

---

## 🎯 Propósito

Crear el formulario para agendar nuevas citas (`/[slug]/operations/appointments/new/page.tsx`) basado en la maqueta "Nueva Cita" con selección de paciente, médico, especialidad, fecha/hora y modalidad.

---

## 📁 Estructura de Archivos

```
apps/web/src/app/[slug]/operations/appointments/
├── page.tsx                      # (ya creada en Fase 03)
├── new/
│   └── page.tsx                  # Formulario nueva cita
└── components/
    ├── PatientSelector.tsx        # Búsqueda/selección de paciente
    ├── DoctorSelector.tsx         # Selección de médico por especialidad
    ├── DateTimePicker.tsx          # Calendario y select de hora
    └── AppointmentForm.tsx        # Formulario completo
```

---

## 🎨 Diseño Basado en Maqueta

La maqueta "Nueva Cita" muestra:
1. **Header** "Schedule New Appointment" con botón "Exit Editor"
2. **Patient Selection**: Búsqueda + preview del paciente seleccionado
3. **Specialty & Provider**: Dropdowns para especialidad y médico
4. **Location & Mode**: Consultorio + Presencial/Telemedicina (toggle)
5. **Consultation Purpose**: Textarea para motivo
6. **Clinical Hours**: Calendario + slots de hora disponibles
7. **Appointment Snapshot**: Resumen a la derecha
8. **Action Bar**: Cancelar + Confirmar Cita (fijo abajo)

---

## 🏗️ `new/page.tsx` - Estructura

```tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function NewAppointmentPage() {
  const { t, lang } = useI18n()
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    specialtyId: '',
    scheduledAt: '',
    time: '',
    duration: 30,
    type: '',
    mode: 'IN_PERSON',
    room: '',
    reason: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          scheduledAt: `${formData.scheduledAt}T${formData.time}:00`,
        }),
      })

      if (response.ok) {
        router.push(`/${slug}/operations/appointments`)
      }
    } catch (error) {
      console.error('Failed to create appointment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-32 pb-24 px-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-header border-none shadow-sm">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <PlusCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-primary">
                {t('appointments.form.newTitle')}
              </h1>
              <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant/70">
                Medical Center Operations
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/${slug}/operations/appointments`)}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold text-sm">Exit Editor</span>
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-12">
          {/* Left: Form */}
          <div className="col-span-12 lg:col-span-8 space-y-12">
            {/* Patient Selection */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary tracking-tight">
                  {t('appointments.form.patientSelection')}
                </h2>
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase rounded-full">
                  Required
                </span>
              </div>
              <PatientSelector
                selected={formData.patientId}
                onSelect={(id) => setFormData({ ...formData, patientId: id })}
              />
            </section>

            {/* Specialty & Provider */}
            <section className="grid grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-primary tracking-tight mb-6">
                  {t('appointments.form.specialty')}
                </h2>
                <DoctorSelector
                  specialtyId={formData.specialtyId}
                  onSelect={(id) => setFormData({ ...formData, doctorId: id })}
                />
              </div>
            </section>

            {/* More sections... */}
          </div>

          {/* Right: Snapshot + Actions */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              {/* Snapshot Card */}
              <AppointmentSnapshot formData={formData} />
              
              {/* Calendar/Time Picker */}
              <DateTimePicker
                date={formData.scheduledAt}
                time={formData.time}
                onSelect={(date, time) => setFormData({ ...formData, scheduledAt: date, time })}
              />
            </div>
          </div>
        </div>

        {/* Action Bar (Fixed Footer) */}
        <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-surface-container-high py-5 px-8 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push(`/${slug}/operations/appointments`)}
              className="px-8 py-3 text-sm font-extrabold text-on-surface-variant hover:text-error transition-colors uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-lg text-sm font-extrabold shadow-lg hover:shadow-primary/20 active:scale-95 transition-all uppercase tracking-widest flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {t('appointments.form.confirm')}
            </button>
          </div>
        </footer>
      </form>
    </div>
  )
}
```

---

## 🔧 `PatientSelector.tsx`

Debe permitir:
1. Búsqueda por nombre, ID o fecha de nacimiento
2. Mostrar preview del paciente seleccionado (avatar + nombre + ID + última visita)
3. Botón "Change" para cambiar

```tsx
'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Search } from 'lucide-react'

export function PatientSelector({ selected, onSelect }: any) {
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [patient, setPatient] = useState(null)

  // Fetch patient if selected exists
  useEffect(() => {
    if (selected) {
      fetchPatient(selected)
    }
  }, [selected])

  const fetchPatient = async (id: string) => {
    // Fetch from API
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="bg-surface-container-lowest p-1 rounded-xl shadow-sm">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
          <input
            className="w-full bg-surface-container-high border-none rounded-lg py-5 pl-14 pr-6 focus:ring-0 focus:bg-surface-container-lowest transition-all font-medium"
            placeholder={t('appointments.form.searchPatient')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Selected Patient Preview */}
      {patient && (
        <div className="mt-6 flex items-center gap-6 p-6 bg-surface-container rounded-xl">
          <div className="relative">
            <img src={patient.avatar} alt="" className="w-20 h-20 rounded-full object-cover grayscale-[20%] border-4 border-white shadow-sm" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white">
              <CheckCircle className="w-3 h-3" />
            </div>
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-on-background">{patient.name}</h3>
              <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-outline-variant/30 text-on-surface-variant">
                ID: {patient.id}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant font-medium mt-1">
              Last Visit: {patient.lastVisit} • {patient.condition}
            </p>
          </div>
          <button
            type="button"
            className="text-on-primary-fixed-variant text-sm font-bold flex items-center gap-1 hover:underline"
          >
            Change <SwapHoriz className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## 🔧 `DateTimePicker.tsx`

Basado en la maqueta "Clinical Hours":
1. Calendario (mes actual con días disponibles)
2. Slots de hora disponibles (09:15 AM, 10:30 AM, etc.)
3. Indicador visual de disponibilidad

```tsx
'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'

export function DateTimePicker({ date, time, onSelect }: any) {
  const { t } = useI18n()
  const [selectedDate, setSelectedDate] = useState(date)
  const [selectedTime, setSelectedTime] = useState(time)

  const availableSlots = ['09:15 AM', '10:30 AM', '11:45 AM', '02:15 PM']

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary tracking-tight">
          Clinical Hours
        </h2>
        <span className="text-xs font-bold text-surface-tint">October 2023</span>
      </div>
      
      {/* Calendar Widget */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
        {/* Days of week + Calendar grid (simplified) */}
        <div className="grid grid-cols-7 gap-2 mb-4 text-center">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => (
            <div key={d} className="text-[10px] font-extrabold text-outline uppercase tracking-widest">{d}</div>
          ))}
        </div>
        {/* Calendar days... */}
      </div>

      {/* Available Slots */}
      <div className="mt-8 space-y-3">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-outline ml-1">
          Available Slots
        </p>
        <div className="grid grid-cols-2 gap-2">
          {availableSlots.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => {
                setSelectedTime(slot)
                onSelect(selectedDate, slot)
              }}
              className={`py-3 px-4 rounded-lg font-bold text-sm transition-colors ${
                selectedTime === slot
                  ? 'bg-primary-container text-white shadow-md ring-2 ring-primary ring-offset-2'
                  : 'bg-surface-container text-on-surface hover:bg-primary-container hover:text-white'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## 🔧 `AppointmentSnapshot.tsx`

Resumen visual a la derecha (como en la maqueta):
- Paciente seleccionado
- Médico asignado
- Fecha y hora
- Duración

```tsx
'use client'

export function AppointmentSnapshot({ formData }: any) {
  return (
    <div className="bg-primary p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <VerifiedUserIcon className="w-20 h-20" />
      </div>
      <h4 className="text-sm font-extrabold uppercase tracking-widest opacity-80 mb-6">
        Appointment Snapshot
      </h4>
      <div className="space-y-4 relative z-10">
        <div className="flex justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-medium opacity-70">Patient</span>
          <span className="text-sm font-bold">{formData.patientId || 'Not selected'}</span>
        </div>
        <div className="flex justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-medium opacity-70">Consultant</span>
          <span className="text-sm font-bold">{formData.doctorId || 'Not selected'}</span>
        </div>
        <div className="flex justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-medium opacity-70">Date</span>
          <span className="text-sm font-bold">{formData.scheduledAt || '--'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-medium opacity-70">Time</span>
          <span className="text-sm font-bold">{formData.time || '--'} (30m)</span>
        </div>
      </div>
    </div>
  )
}
```

---

## ✅ Criterios de Aceptación

- [ ] Página `new/page.tsx` creada
- [ ] Componente `PatientSelector.tsx` funcional (búsqueda + preview)
- [ ] Componente `DoctorSelector.tsx` funcional (filtrado por especialidad)
- [ ] Componente `DateTimePicker.tsx` funcional (calendario + slots)
- [ ] Componente `AppointmentSnapshot.tsx` muestra resumen
- [ ] Formulario envía datos a API `POST /appointments`
- [ ] Modo presencial/telemedicina toggle implementado
- [ ] i18n con claves `appointments.form.*`
- [ ] Action Bar fijo al footer

---

## 🔗 Siguiente Fase

**05-edit-appointment/README.md** → Edición de cita
