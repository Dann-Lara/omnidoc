# 03-Directory - Directorio de Citas

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Fase** | 03 - Directory |
| **Estado** | ✅ Completado |
| **Dependencias** | Fase 02 (API), maqueta "Gestión de Citas" |

---

## 🎯 Propósito

Crear la página principal del directorio de citas (`/[slug]/operations/appointments/page.tsx`) basada en la maqueta "Gestión de Citas" con tabla Bento, filtros y KPIs.

---

## 📁 Estructura de Archivos

```
apps/web/src/app/[slug]/operations/appointments/
├── page.tsx                      # Directorio principal
└── components/
    ├── AppointmentsTable.tsx       # Tabla de citas
    └── AppointmentsFilters.tsx     # Filtros (búsqueda, especialidad, médico, fecha)
```

---

## 🎨 Diseño Basado en Maqueta

La maqueta "Gestión de Citas" muestra:
1. **Header** con título "Gestión de Citas" y botón "Nueva Cita"
2. **KPIs** (3 cards): Citas Hoy, Pendientes, Cancelaciones
3. **Filtros**: Búsqueda, Especialidad, Médico, Fecha
4. **Tabla**: Paciente, Médico, Especialidad, Fecha/Hora, Estado, Acciones
5. **Paginación**

---

## 🏗️ `page.tsx` - Estructura

```tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { useParams } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function AppointmentsPage() {
  const { t, lang } = useI18n()
  const params = useParams()
  const slug = params.slug as string
  
  const [kpis, setKpis] = useState({ today: 0, pending: 0, cancelled: 0 })
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch KPIs y lista de citas
  useEffect(() => {
    fetchKpis()
    fetchAppointments()
  }, [])

  const fetchKpis = async () => {
    try {
      const res = await fetch(`${API_URL}/appointments/kpis`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setKpis(data)
      }
    } catch (error) {
      console.error('Failed to fetch KPIs:', error)
    }
  }

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_URL}/appointments`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setAppointments(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-24"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.15rem] text-primary/60 mb-2 block">
            {t('appointments.directory.title')}
          </span>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">
            {t('appointments.directory.title')}
          </h1>
        </div>
        <button
          onClick={() => router.push(`/${slug}/operations/appointments/new`)}
          className="flex items-center space-x-2 bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('appointments.form.newTitle')}</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex items-center space-x-6 group">
          <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface-variant mb-1">Citas Hoy</p>
            <h3 className="text-3xl font-extrabold text-primary">{kpis.today}</h3>
          </div>
        </div>
        {/* Similar para pending y cancelled */}
      </div>

      {/* Filtros */}
      <AppointmentsFilters />

      {/* Tabla */}
      <AppointmentsTable appointments={appointments} isLoading={isLoading} />
    </motion.div>
  )
}
```

---

## 🔧 `AppointmentsTable.tsx`

Basado en la maqueta, la tabla debe mostrar:
- Paciente (avatar + nombre + ID)
- Médico (icono + nombre)
- Especialidad (badge)
- Fecha y Hora
- Estado (badge: Confirmada/Pendiente/Cancelada)
- Acciones (Editar, Más)

```tsx
interface Appointment {
  id: string
  patient: { firstName: string; lastName: string; id: string }
  doctor: { firstName: string; lastName: string; specialty: string }
  specialty?: { nameEn: string; nameEs: string }
  scheduledAt: string
  status: string
  room?: string
  mode?: string
}
```

Estados visuales:
- **Confirmada**: `bg-green-100 text-green-700` + circle verde
- **Pendiente**: `bg-amber-100 text-amber-700` + circle ambar
- **Cancelada**: `bg-error-container text-error` + circle rojo
- **En Progreso**: `bg-tertiary-container/10 text-tertiary-container` + icono sensor_door

---

## 🔧 `AppointmentsFilters.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Search, Filter } from 'lucide-react'

export function AppointmentsFilters() {
  const { t } = useI18n()
  
  return (
    <div className="bg-surface-container-low p-2 rounded-2xl mb-8 flex flex-wrap items-center gap-3">
      {/* Búsqueda */}
      <div className="flex-1 min-w-[240px] relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          className="w-full bg-white border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 shadow-sm"
          placeholder={t('appointments.directory.searchPlaceholder')}
        />
      </div>
      
      {/* Filtro Especialidad */}
      <select className="bg-white border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 shadow-sm appearance-none min-w-[180px]">
        <option>{t('appointments.directory.allSpecialties')}</option>
      </select>
      
      {/* Filtro Médico */}
      <select className="bg-white border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 shadow-sm appearance-none min-w-[180px]">
        <option>{t('appointments.directory.allDoctors')}</option>
      </select>
      
      {/* Filtro Fecha */}
      <div className="bg-white px-4 py-3 rounded-xl shadow-sm flex items-center space-x-3 text-sm">
        <CalendarIcon className="w-4 h-4 text-on-surface-variant" />
        <span>12 May - 18 May</span>
      </div>
      
      <button className="p-3 bg-white text-primary rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
        <Filter className="w-4 h-4" />
      </button>
    </div>
  )
}
```

---

## 🔗 Integración en Sidebar

En `TenantSidebar.tsx`, sección `operacionesItems`:

```tsx
const operacionesItems = [
  { href: `${basePath}/operations/patients`, icon: UserCog, labelKey: 'tenant.nav.patients' },
  { href: `${basePath}/operations/appointments`, icon: Calendar, labelKey: 'nav.appointments' },
]
```

---

## ✅ Criterios de Aceptación

- [ ] Página `page.tsx` creada
- [ ] Componente `AppointmentsTable.tsx` creado
- [ ] Componente `AppointmentsFilters.tsx` creado
- [ ] KPIs conectados a API real (`/appointments/kpis`)
- [ ] Tabla conectada a API real (`/appointments`)
- [ ] Filtros funcionales
- [ ] Paginación implementada
- [ ] Estados visuales (Confirmada, Pendiente, Cancelada)
- [ ] i18n con claves `appointments.directory.*`

---

## 🔗 Siguiente Fase

**04-new-appointment/README.md** → Formulario nueva cita
