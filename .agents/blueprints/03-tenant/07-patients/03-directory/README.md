# 07-Patients - Directorio (Lista de Pacientes)

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Módulo** | Patients Directory |
| **Estado** | ⏳ Pendiente |
| **Dependencias** | 01-schema, 02-api |

---

## 🎯 Propósito

Implementar el directorio de pacientes - una tabla/listado de respuesta inmediata con filtros rápidos por Nombre, ID único y Fecha de Nacimiento.

Criterio AC 1.1: El sistema debe permitir el listado de pacientes con filtros rápidos por Nombre, ID único (DNI/CURP/SSN) y Fecha de Nacimiento.

---

## 📋 Diseño UI

### Desktop - Tabla

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Buscador por nombre...]    [Filtro ID ▼]    [Más filtros ▼]   [+ Nuevo] │
├─────────────────────────────────────────────────────────────────────────────┤
│ #  │ Nombre completo    │ ID          │ Teléfono   │ Fecha Nac. │ Alergias │ Acciones │
├────┼───────────────┼─────────────┼───────────┼──────────┼─────────┼─────────┤
│ 1  │ Juan Pérez    │ DNI-12345   │ 555-1234 │ 15/03/80│ Penicil. │ ⋯       │
│ 2  │ María García│ CURP-ABC   │ 555-5678 │ 22/08/95│ Ninguna │ ⋯       │
│ 3  │ Carlos López│ SSN-999    │ 555-0000 │ 01/01/70│ Polen    │ ⋯       │
└─────────────────────────────────────────────────────────────────────────────┘
│                                                   « 1 2 3 4 5 » │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Móvil - Cards

```
┌────────────────────────────┐
│ 👤 Juan Pérez      │
│ ID: DNI-12345      │
│ 📞 555-1234      │
│ ⚠️ Alergia: Penicilina │
└────────────────────────────┘
```

---

## 🎨 Componentes Requeridos

### PatientsTable.tsx

```tsx
import { useI18n } from '@/lib/i18n'

interface Patient {
  id: string
  firstName: string
  lastName: string
  documentType: string
  documentId: string
  phone: string
  dateOfBirth?: string
  allergies: string[]
  emergencyContact?: string
  createdAt: string
}

interface Props {
  patients: Patient[]
  onEdit: (patient: Patient) => void
  onView: (patient: Patient) => void
  permissions: Record<string, boolean>
}

export function PatientsTable({ patients, onEdit, onView, permissions }: Props) {
  const { t } = useI18n()
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th>{t('patients.directory.name')}</th>
            <th>{t('patients.directory.id')}</th>
            <th>{t('patients.directory.phone')}</th>
            <th>{t('patients.directory.dateOfBirth')}</th>
            <th>{t('patients.directory.allergies')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.firstName} {patient.lastName}</td>
              <td>{patient.documentType}-{patient.documentId}</td>
              <td>{patient.phone}</td>
              <td>{patient.dateOfBirth}</td>
              <td>
                {patient.allergies.length > 0 && (
                  <span className="text-red-500">⚠️ {patient.allergies.join(', ')}</span>
                )}
              </td>
              <td>
                <button onClick={() => onView(patient)}>⋯</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### PatientCard.tsx (Móvil)

```tsx
export function PatientCard({ patient, onClick }: Props) {
  return (
    <button 
      onClick={onClick}
      className="w-full text-left bg-surface-container rounded-xl p-4"
    >
      <div className="flex items-center gap-3">
        <Avatar firstName={patient.firstName} lastName={patient.lastName} />
        <div className="flex-1">
          <p className="font-semibold">{patient.firstName} {patient.lastName}</p>
          <p className="text-sm text-on-surface-variant">
            {patient.documentType}-{patient.documentId}
          </p>
        </div>
        {patient.allergies.length > 0 && (
          <span className="text-red-500 text-xl">⚠️</span>
        )}
      </div>
    </button>
  )
}
```

---

## 🎯 Página: /[slug]/areas/patients

Ubicación: `apps/web/src/app/[slug]/areas/patients/page.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { Search, Filter, Plus, User } from 'lucide-react'
import { PatientsTable } from '../components/PatientsTable'
import { PatientCard } from '../components/PatientCard'
import { PatientModal } from '../components/PatientModal'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Patient {
  id: string
  firstName: string
  lastName: string
  documentType: string
  documentId: string
  email: string
  phone: string
  dateOfBirth?: string
  gender?: string
  bloodType?: string
  emergencyContact?: string
  emergencyPhone?: string
  allergies: string[]
  isChronic: boolean
}

export default function PatientsPage() {
  const { lang, t } = useI18n()
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterDocType, setFilterDocType] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  useEffect(() => {
    fetchPatients()
  }, [search, filterDocType])

  const fetchPatients = async () => {
    try {
      const urlParams = new URLSearchParams()
      if (search) urlParams.append('search', search)
      if (filterDocType) urlParams.append('documentType', filterDocType)
      
      const res = await fetch(`${API_URL}/patients?${urlParams}`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setPatients(data)
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewPatient = (patient: Patient) => {
    router.push(`/${slug}/areas/patients/${patient.id}`)
  }

  return (
    <motion.div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('patients.directory.title')}</h1>
        {permissions.patients?.write && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            {t('patients.directory.new')}
          </button>
        )}
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
          <input
            type="text"
            placeholder={t('patients.directory.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10"
          />
        </div>
        
        <select
          value={filterDocType}
          onChange={(e) => setFilterDocType(e.target.value)}
          className="w-40"
        >
          <option value="">{t('patients.directory.allIds')}</option>
          <option value="DNI">{t('patients.directory.dni')}</option>
          <option value="CURP">{t('patients.directory.curp')}</option>
          <option value="SSN">{t('patients.directory.ssn')}</option>
        </select>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block">
            <PatientsTable
              patients={patients}
              onView={handleViewPatient}
              permissions={permissions}
            />
          </div>
          
          {/* Móvil */}
          <div className="md:hidden space-y-3">
            {patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onClick={() => handleViewPatient(patient)}
              />
            ))}
          </div>
        </>
      )}

      {showModal && (
        <PatientModal
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false)
            fetchPatients()
          }}
        />
      )}
    </motion.div>
  )
}
```

---

## 🎯 Página: Ficha del Paciente

Ubicación: `apps/web/src/app/[slug]/areas/patients/[patientId]/page.tsx`

```tsx
// Datos base del paciente
// Acciones: Editar, Nueva Nota, Ver Historial
```

---

## 🔐 Permisos Requeridos

| Permiso | Acción |
|--------|--------|
| `patients:read` | Ver directorio |
| `patients:write:base` | Crear paciente |
| `patients:write` | Editar datos base |
| `notes:write` | Nueva nota |

---

## ✅ Criterios de Aceptación (AC)

| AC | Descripción | Criterio |
|----|------------|----------|
| 1.1 | Filtros por Nombre | Input search con ILIKE |
| 1.1 | Filtros por ID | Select documentType + input documentId |
| 1.1 | Filtros por Fecha | Input dateOfBirth |
| 1.2 | Datos administrativos | Nombre, género, teléfono, contacto emergencia, alergias, tipo sangre |
| 1.3 | Auditoría | Guardar en API al actualizar |
| 1.2 | Alergias visibles | Icono ⚠️ en lista |

---

## 🎨 Estilos (Tailwind)

```css
/* Tabla */
.patients-table {
  @apply w-full text-left;
}

.patients-table th {
  @apply text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-4 py-3;
}

.patients-table td {
  @apply px-4 py-3 border-t border-outline-variant/20;
}

/* Alergia warning */
.allergy-badge {
  @apply px-2 py-1 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-xs font-bold rounded;
}
```

---

## 🚀 Pasos de Ejecución

1. **Crear página** `/areas/patients/page.tsx`
2. **Crear componentes**: `PatientsTable`, `PatientCard`, `PatientModal`
3. **Implementar fetch** con filtros
4. **Conexión con API**: `GET /patients`
5. **Verificar permisos**: desde cookie
6. **Typecheck**: `pnpm typecheck`

---

## 🔗 Dependencias

- API en `02-api`
- i18n existente (`useI18n`)
- Permisos existentes