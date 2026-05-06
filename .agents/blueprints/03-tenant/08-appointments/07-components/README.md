# 07-Components - Componentes Reutilizables

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Fase** | 07 - Components |
| **Estado** | 🔄 Pendiente |
| **Dependencias** | Fase 03, 04, 05 |

---

## 🎯 Propósito

Crear componentes reutilizables para el módulo de citas que mantengan consistencia visual y funcional con las maquetas proporcionadas.

---

## 📁 Estructura de Archivos

```
apps/web/src/components/appointments/
├── AppointmentsTable.tsx           # Tabla principal (Bento style)
├── AppointmentForm.tsx             # Formulario completo (new/edit)
├── AppointmentKPIs.tsx             # Cards de resumen (Citas Hoy, Pendientes, etc.)
├── ConfirmAppointmentModal.tsx      # Modal de confirmación (para email)
├── StatusBadge.tsx                # Badge de estado (Confirmada, Pendiente, etc.)
├── AppointmentCard.tsx             # Card para vista de especialidad
└── CalendarGrid.tsx               # Calendario para selección de fecha
```

---

## 🏗️ `StatusBadge.tsx`

Componente para mostrar el estado de la cita con colores correctos:

```tsx
'use client'

import { AppointmentStatus } from '@prisma/client'
import { CheckCircle, Clock, XCircle, Play, Pause } from 'lucide-react'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = {
    SCHEDULED: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: CheckCircle,
      label: 'Confirmada',
    },
    IN_PROGRESS: {
      bg: 'bg-tertiary-container/10',
      text: 'text-tertiary-container',
      icon: Play,
      label: 'En Progreso',
    },
    WAITING: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      icon: Clock,
      label: 'Esperando',
    },
    COMPLETED: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: CheckCircle,
      label: 'Completada',
    },
    CANCELED: {
      bg: 'bg-error-container',
      text: 'text-error',
      icon: XCircle,
      label: 'Cancelada',
    },
    NO_SHOW: {
      bg: 'bg-slate-100',
      text: 'text-slate-500',
      icon: XCircle,
      label: 'No Asistió',
    },
  }

  const { bg, text, icon: Icon, label } = config[status] || config.SCHEDULED
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-bold ${bg} ${text} ${sizeClass}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}
```

---

## 🏗️ `AppointmentKPIs.tsx`

Cards de resumen basadas en la maqueta "Gestión de Citas":

```tsx
'use client'

import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { Calendar, Clock, XCircle } from 'lucide-react'

interface KPI {
  title: string
  value: number
  change: string
  changeType: 'up' | 'down' | 'neutral'
  icon: any
  color: string
}

export function AppointmentKPIs({ today, pending, cancelled }: { today: number; pending: number; cancelled: number }) {
  const { t } = useI18n()

  const kpis: KPI[] = [
    {
      title: t('appointments.directory.today'),
      value: today,
      change: '+12%',
      changeType: 'up',
      icon: Calendar,
      color: 'text-primary',
    },
    {
      title: t('appointments.directory.pending'),
      value: pending,
      change: '+5%',
      changeType: 'up',
      icon: Clock,
      color: 'text-amber-600',
    },
    {
      title: t('appointments.directory.cancellations'),
      value: cancelled,
      change: '-5%',
      changeType: 'down',
      icon: XCircle,
      color: 'text-error',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex items-center space-x-6 group"
          >
            <div className={`w-14 h-14 rounded-2xl bg-${kpi.color.split('-')[1]}-fixed flex items-center justify-center ${kpi.color} transition-transform group-hover:scale-110`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant mb-1">{kpi.title}</p>
              <h3 className="text-3xl font-extrabold text-primary">{kpi.value}</h3>
              <p className={`text-[10px] font-bold mt-1 ${
                kpi.changeType === 'up' ? 'text-green-600' : 
                kpi.changeType === 'down' ? 'text-error/60' : 'text-primary/40'
              }`}>
                {kpi.change} vs ayer
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
```

---

## 🏗️ `ConfirmAppointmentModal.tsx`

Modal para confirmar cita (basado en maqueta "Confirmación de Cita"):

```tsx
'use client'

import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { CheckCircle, Calendar, Clock, MapPin } from 'lucide-react'

interface AppointmentData {
  patientName: string
  doctorName: string
  date: string
  time: string
  location: string
  specialty: string
}

export function ConfirmAppointmentModal({ 
  isOpen, 
  onClose, 
  appointment 
}: { 
  isOpen: boolean
  onClose: () => void
  appointment: AppointmentData 
}) {
  const { t, lang } = useI18n()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-[600px] w-full bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col"
      >
        {/* Header */}
        <header className="p-8 flex flex-col items-center text-center space-y-6">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-container rounded flex items-center justify-center">
              <ArchitectureIcon className="w-6 h-6 text-on-primary-container" />
            </div>
            <span className="brand-text text-2xl font-extrabold tracking-tight text-primary">
              Clinical Architect
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary tracking-tight">
              {t('appointments.emailConfirm.title')}
            </h1>
            <p className="text-on-surface-variant text-lg max-w-[400px] mx-auto">
              {t('appointments.emailConfirm.subtitle')}
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-col md:flex-row bg-surface-container-low mx-8 rounded-xl overflow-hidden mb-8">
          {/* Left: Doctor Image */}
          <div className="w-full md:w-2/5 p-6 bg-surface flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <img src={appointment.doctorAvatar} alt="" className="w-32 h-32 rounded-full object-cover border-4 border-surface-container-lowest shadow-md" />
              <div className="absolute bottom-1 right-1 bg-primary text-white p-1.5 rounded-full shadow-lg">
                <CheckCircle className="w-3 h-3" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Especialidad</p>
              <p className="text-primary font-bold text-lg">{appointment.specialty}</p>
            </div>
          </div>

          {/* Right: Details */}
          <div className="w-full md:w-3/5 p-8 bg-surface-container-lowest space-y-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <PersonIcon className="w-5 h-5 text-primary-container mt-1" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Paciente</p>
                  <p className="text-on-surface font-semibold">{appointment.patientName}</p>
                </div>
              </div>
              {/* More details... */}
            </div>
          </div>
        </main>

        {/* CTA */}
        <section className="px-8 pb-10 flex flex-col items-center space-y-4">
          <button className="w-full bg-gradient-to-br from-primary to-primary-container text-white font-semibold py-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-primary/10">
            <Calendar className="w-4 h-4" />
            <span>{t('appointments.emailConfirm.addToCalendar')}</span>
          </button>
        </section>
      </motion.div>
    </div>
  )
}
```

---

## 🏗️ `CalendarGrid.tsx`

Calendario para selección de fecha (basado en maqueta "Nueva Cita"):

```tsx
'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function CalendarGrid({ 
  selectedDate, 
  onSelect 
}: { 
  selectedDate: string
  onSelect: (date: string) => void 
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-bold text-primary">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-4 text-center">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => (
          <div key={d} className="text-[10px] font-extrabold text-outline uppercase tracking-widest">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {blanks.map((blank) => (
          <div key={`blank-${blank}`} className="h-10" />
        ))}
        {days.map((day) => {
          const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isSelected = selectedDate === dateStr
          const isToday = dateStr === new Date().toISOString().split('T')[0]
          
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelect(dateStr)}
              className={`h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-all ${
                isSelected 
                  ? 'bg-primary text-white font-bold shadow-md' 
                  : isToday
                  ? 'bg-primary-container text-on-primary-container'
                  : 'hover:bg-surface-container-high'
              }`}
            >
              {day}
              {isToday && !isSelected && (
                <div className="absolute bottom-1 w-1 h-1 bg-surface-tint rounded-full"></div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

---

## ✅ Criterios de Aceptación

- [ ] `StatusBadge.tsx` creado con todos los estados
- [ ] `AppointmentKPIs.tsx` creado con animaciones de framer-motion
- [ ] `ConfirmAppointmentModal.tsx` basado en maqueta de email
- [ ] `CalendarGrid.tsx` funcional con navegación mensual
- [ ] `AppointmentsTable.tsx` integra `StatusBadge`
- [ ] `AppointmentForm.tsx` integra `CalendarGrid`
- [ ] Todos los componentes usan `useI18n()`
- [ ] Colores y estilos siguen el design system (Tailwind v4)

---

## 🔗 Conclusión

**08-appointments** completa el módulo de citas con:
1. ✅ Schema actualizado
2. ✅ API NestJS funcional
3. ✅ Directorio con filtros y KPIs
4. ✅ Formularios new/edit
5. ✅ Integración con especialidades
6. ✅ Componentes reutilizables

---

## 📝 Notas Finales

- **Testing**: Pendiente implementar tests (Jest para API, Playwright para frontend)
- **Email Service**: Integrar con `MailModule` para envío de confirmaciones
- **AI Insights**: Futuro - implementar "Anti-NoShow Alert" con IA
- **Resource Mapping**: Futuro - integrar mapa de recursos (salas/equipos)

---

## 🔭 Blueprint Completado

**Siguiente paso sugerido**: Implementar Fase 01 (Schema) y ejecutar migración de Prisma.
