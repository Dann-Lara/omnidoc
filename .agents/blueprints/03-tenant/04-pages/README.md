# 04-Pages - Páginas del Módulo Tenant

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 03-tenant/04-pages |
| **Estado** | 🔄 Actualizado según auditoría 2026-05-05 |

---

## 🎯 Propósito

Documentar las páginas del módulo tenant, su estado actual (FUNCTIONAL, MOCK, PARTIAL) y páginas futuras.

**Leyenda de Estado:**
- **FUNCTIONAL**: Página conectada a API real, completamente funcional
- **MOCK**: Página con datos hardcodeados, requiere implementación de API
- **PARTIAL**: Mezcla de datos reales y hardcodeados

---

## 📁 Estructura de Páginas (Actualizada)

```
apps/web/src/app/[slug]/
├── page.tsx                                    # Landing tenant (MOCK - placeholder)
├── dashboard/
│   └── page.tsx                              # Dashboard (PARTIAL - some mock data)
├── profile/
│   ├── page.tsx                              # Perfil de usuario (FUNCTIONAL)
│   ├── edit/page.tsx                         # Editar perfil (FUNCTIONAL)
│   ├── specialties/page.tsx                   # Mis especialidades (FUNCTIONAL)
│   └── user-types/page.tsx                   # Tipos de usuario (FUNCTIONAL)
├── areas/
│   ├── team/
│   │   ├── page.tsx                         # Equipo médico (FUNCTIONAL - API connected)
│   │   ├── [userId]/page.tsx                # Detalle miembro (FUNCTIONAL - API connected)
│   │   ├── add/page.tsx                     # Invitar miembro (FUNCTIONAL - API connected)
│   │   └── invitations/page.tsx             # Invitaciones (FUNCTIONAL - API connected)
│   └── specialties/
│       └── page.tsx                         # Especialidades del tenant (FUNCTIONAL)
├── operations/
│   ├── patients/
│   │   ├── page.tsx                         # Directorio pacientes (FUNCTIONAL - API connected)
│   │   ├── new/page.tsx                     # Nuevo paciente (FUNCTIONAL - API connected)
│   │   └── [patientId]/
│   │       ├── page.tsx                     # Ficha paciente (FUNCTIONAL - API connected)
│   │       ├── history/page.tsx             # Historial clínico (FUNCTIONAL - API connected)
│   │       └── notes/
│   │           ├── new/page.tsx             # Nueva nota (FUNCTIONAL - API connected)
│   │           └── [noteId]/page.tsx       # Ver nota (FUNCTIONAL - API connected)
│   └── appointments/
│       ├── page.tsx                         # Citas médicas (FUNCTIONAL - API connected)
│       ├── new/page.tsx                     # Nueva cita (FUNCTIONAL - API connected)
│       └── [appointmentId]/
│           ├── page.tsx                     # Detalle cita (FUNCTIONAL - API connected)
│           └── edit/page.tsx                # Editar cita (FUNCTIONAL - API connected)
├── specialties/
│   └── [specialtyId]/page.tsx              # Detalle especialidad (FUNCTIONAL)
├── audits/
│   └── page.tsx                            # Auditoría tenant (FUNCTIONAL - API connected)
└── settings/
    └── page.tsx                             # Configuración tenant (PARTIAL - mixed)
```

---

## 📄 Páginas Existentes

### 01-Landing (`/[slug]`) - MOCK

**Archivo:** `apps/web/src/app/[slug]/page.tsx`

**Estado:** MOCK (placeholder)

**Contenido:**
- Página de aterrizaje del tenant
- Información pública de la organización

**TODO:** Implementar contenido real y API endpoint

**Características:**
- Diseño responsivo
- Dark mode soportado
- i18n: Has ternarios `lang === 'en'` pendientes

---

### 02-Dashboard (`/[slug]/dashboard`) - PARTIAL

**Archivo:** `apps/web/src/app/[slug]/dashboard/page.tsx`

**Estado:** PARTIAL (mezcla de real y mock)

**Endpoints utilizados:**
- GET `/tenants/dashboard-stats` - Stats del dashboard (parcial)
- GET `/appointments` - Citas próximas (FUNCTIONAL)

**Contenido:**
- Stats cards: Today's Appointments, Active Patients, Revenue, Upcoming
- Quick actions
- Recent activity section

**TODO:** Completar conexión de todas las stats a APIs reales

**Características:**
- Usa Framer Motion para animaciones
- Responsive grid
- Dark mode soportado
- Usa `useParams()` para obtener el slug
- i18n: Has ternarios pendientes

---

### 03-Profile (`/[slug]/profile`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/[slug]/profile/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/profile` - Datos del perfil
- PUT `/profile` - Actualizar perfil

**Contenido:**
- Avatar del usuario
- Información personal
- Security Vault Status
- Emergency Lock button
- Account management

**Características:**
- Usa Framer Motion para animaciones
- Dark mode soportado
- i18n: Has ternarios pendientes

---

### 04-Profile Edit (`/[slug]/profile/edit`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/[slug]/profile/edit/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- PUT `/profile` - Actualizar perfil

**Características:**
- Formulario edición de perfil
- i18n: Migrado a useI18n

---

### 05-Profile Specialties (`/[slug]/profile/specialties`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/[slug]/profile/specialties/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/profile/specialties` - Mis especialidades
- POST `/profile/specialties` - Agregar especialidad
- DELETE `/profile/specialties/:id` - Remover especialidad

**Características:**
- Gestión de especialidades del usuario
- i18n: Migrado a useI18n

---

### 06-Profile User Types (`/[slug]/profile/user-types`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/[slug]/profile/user-types/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/team/user-types` - Tipos de usuario configurados

**Características:**
- Ver tipos de usuario disponibles
- i18n: Migrado a useI18n

---

### 07-Team (`/[slug]/areas/team`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/[slug]/areas/team/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/team` - Lista de miembros del equipo
- POST `/team/invite` - Invitar miembro

**Características:**
- Tabla con filtros (status, userType, specialty, search)
- Paginación
- Botón invitar miembro
- i18n: Has ternarios pendientes

---

### 08-Team Detail (`/[slug]/areas/team/[userId]`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/[slug]/areas/team/[userId]/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/team/:id` - Detalle de miembro
- PUT `/team/:id` - Actualizar miembro
- DELETE `/team/:id` - Desactivar miembro

**Características:**
- Vista detalle con permisos y especialidades
- Formulario edición
- i18n: Has ternarios pendientes

---

### 09-Team Add (`/[slug]/areas/team/add`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/[slug]/areas/team/add/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- POST `/team/invite` - Invitar miembro
- GET `/team/user-types` - Tipos de usuario

**Características:**
- Formulario invitación
- Selección de especialidades y permisos
- i18n: Has ternarios pendientes

---

### 10-Team Invitations (`/[slug]/areas/team/invitations`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/[slug]/areas/team/invitations/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/team/invitations` - Lista invitaciones
- DELETE `/team/invite/:id` - Revocar invitación
- POST `/team/invite/:id/resend` - Reenviar invitación

**Características:**
- Tabla de invitaciones pendientes
- Acciones: reenviar, revocar
- i18n: Migrado a useI18n

---

### 11-Specialties (`/[slug]/areas/specialties`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/[slug]/areas/specialties/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/specialties?organizationId=X` - Especialidades del tenant
- POST `/specialties` - Crear especialidad
- PUT `/specialties/:id` - Actualizar especialidad

**Características:**
- Catálogo de especialidades del tenant
- CRUD completo
- i18n: Migrado a useI18n

---

### 12-Patients (`/[slug]/operations/patients`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/[slug]/operations/patients/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/patients` - Directorio de pacientes
- POST `/patients` - Nuevo paciente

**Características:**
- Tabla con filtros (status, search, specialty)
- Paginación
- Acciones: ver, editar, nueva nota
- i18n: Has ternarios pendientes

---

### 13-Patient Detail (`/[slug]/operations/patients/[patientId]`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/[slug]/operations/patients/[patientId]/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/patients/:id` - Detalle de paciente
- PUT `/patients/:id` - Actualizar paciente

**Características:**
- Ficha completa del paciente
- Signos vitales
- Alergias y condiciones crónicas
- i18n: Has ternarios pendientes

---

### 14-Patient History (`/[slug]/operations/patients/[patientId]/history`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/[slug]/operations/patients/[patientId]/history/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/patients/:id/notes` - Historial de notas médicas

**Características:**
- Timeline de notas médicas
- Filtros por especialidad, fecha
- Expandir/colapsar notas
- i18n: Has ternarios pendientes

---

### 15-New Patient Note (`/[slug]/operations/patients/[patientId]/notes/new`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/[slug]/operations/patients/[patientId]/notes/new/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- POST `/patients/:id/notes` - Nueva nota médica
- GET `/patients/:id` - Datos del paciente

**Características:**
- Formulario nota médica (SOAP)
- Signos vitales
- Sellado de nota (no editable después)
- i18n: Has ternarios pendientes

---

### 16-View Note (`/[slug]/operations/patients/[patientId]/notes/[noteId]`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/[slug]/operations/patients/[patientId]/notes/[noteId]/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/patient-notes/:id` - Detalle de nota
- GET `/patients/:id` - Datos del paciente

**Características:**
- Vista sellada de nota médica
- No editable después del sellado
- i18n: Has ternarios pendientes

---

### 17-Appointments (`/[slug]/operations/appointments`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/[slug]/operations/appointments/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/appointments` - Lista de citas
- POST `/appointments` - Nueva cita

**Características:**
- Calendario y lista de citas
- Filtros por fecha, doctor, status
- Acciones: ver, editar, cancelar
- i18n: Has ternarios pendientes

---

### 18-New Appointment (`/[slug]/operations/appointments/new`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/[slug]/operations/appointments/new/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- POST `/appointments` - Crear cita
- GET `/patients` - Lista de pacientes
- GET `/team` - Lista de doctores

**Características:**
- Formulario nueva cita
- Selección paciente, doctor, especialidad
- i18n: Has ternarios pendientes

---

### 19-Appointment Detail (`/[slug]/operations/appointments/[appointmentId]`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/[slug]/operations/appointments/[appointmentId]/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/appointments/:id` - Detalle de cita
- PUT `/appointments/:id` - Actualizar cita

**Características:**
- Vista detalle de cita
- Información paciente y doctor
- i18n: Has ternarios pendientes

---

### 20-Edit Appointment (`/[slug]/operations/appointments/[appointmentId]/edit`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/[slug]/operations/appointments/[appointmentId]/edit/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- PUT `/appointments/:id` - Actualizar cita

**Características:**
- Formulario edición de cita
- i18n: Has ternarios pendientes

---

### 21-Specialty Detail (`/[slug]/specialties/[specialtyId]`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/[slug]/specialties/[specialtyId]/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/specialties/:id` - Detalle de especialidad

**Características:**
- Info de la especialidad
- Doctores asignados
- i18n: Migrado a useI18n

---

### 22-Audits (`/[slug]/audits`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/[slug]/audits/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/audit?organizationId=X` - Log de auditoría del tenant

**Características:**
- Timeline de eventos de auditoría
- Filtros por tipo, fecha, usuario
- i18n: Migrado a useI18n

---

### 23-Settings (`/[slug]/settings`) - PARTIAL

**Archivo:** `apps/web/src/app/[slug]/settings/page.tsx`

**Estado:** PARTIAL (mezcla de real y mock)

**Características:**
- Configuración del tenant
- Secciones: general, medical, notifications
- i18n: Has ternarios pendientes

---

## 📄 Páginas Próximamente

### 24-Futuro - Calendar

```
/[slug]/dashboard/calendar
```

**Propósito:** Calendario de citas y turnos

**Estado:** ⏳ Pendiente

---

### 25-Futuro - Metrics

```
/[slug]/dashboard/metrics
```

**Propósito:** Métricas y analytics de la organización

**Estado:** ⏳ Pendiente

---

### 26-Futuro - Tenant Landing

```
/[slug]/
```

**Propósito:** Landing page de la organización (público)

**Estado:** 🔄 Parcial (MOCK implementado, requiere API)

---

## 🎨 Patrón de Página

Cada página nueva debe seguir este patrón:

```tsx
'use client'

import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { getStoredUser } from '@/lib/auth'
import type { Variants } from 'framer-motion'

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  }
}

export default function PageName() {
  const params = useParams()
  const slug = params.slug as string
  const { t } = useI18n()
  const user = getStoredUser()
  
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="show">
      {/* Contenido usando t('section.key') en lugar de ternarios */}
    </motion.div>
  )
}
```

**IMPORTANTE:** No usar `lang === 'en'` ternarios. Usar siempre `t('key')` con traducciones en `translations.ts`.

---

## ✅ Criterios de Aceptación (Actualizado)

- [x] Dashboard implementado (PARTIAL - requiere completar API)
- [x] Profile implementado (FUNCTIONAL)
- [x] Team implementado (FUNCTIONAL)
- [x] Patients implementado (FUNCTIONAL)
- [x] Appointments implementado (FUNCTIONAL)
- [x] Specialties implementado (FUNCTIONAL)
- [x] Audits implementado (FUNCTIONAL)
- [ ] Calendar (pendiente)
- [ ] Metrics (pendiente)
- [ ] Landing completo (PARTIAL - MOCK)

---

## 📊 Resumen de Estado (Auditoría 2026-05-05)

| Página | Estado | i18n Status | API Endpoint |
|--------|--------|-------------|--------------|
| /[slug] | MOCK | ⚠️ Has ternarios | Requiere `/tenants/landing` |
| /[slug]/dashboard | PARTIAL | ⚠️ Has ternarios | Parcial `/tenants/dashboard-stats` |
| /[slug]/profile | FUNCTIONAL | ⚠️ Has ternarios | `/profile` |
| /[slug]/profile/edit | FUNCTIONAL | ✅ useI18n | `/profile` |
| /[slug]/profile/specialties | FUNCTIONAL | ✅ useI18n | `/profile/specialties` |
| /[slug]/profile/user-types | FUNCTIONAL | ✅ useI18n | `/team/user-types` |
| /[slug]/areas/team | FUNCTIONAL | ⚠️ Has ternarios | `/team` |
| /[slug]/areas/team/[id] | FUNCTIONAL | ⚠️ Has ternarios | `/team/:id` |
| /[slug]/areas/team/add | FUNCTIONAL | ⚠️ Has ternarios | `/team/invite` |
| /[slug]/areas/team/invitations | FUNCTIONAL | ✅ useI18n | `/team/invitations` |
| /[slug]/areas/specialties | FUNCTIONAL | ✅ useI18n | `/specialties` |
| /[slug]/operations/patients | FUNCTIONAL | ⚠️ Has ternarios | `/patients` |
| /[slug]/operations/patients/[id] | FUNCTIONAL | ⚠️ Has ternarios | `/patients/:id` |
| /[slug]/operations/patients/[id]/history | FUNCTIONAL | ⚠️ Has ternarios | `/patients/:id/notes` |
| /[slug]/operations/patients/[id]/notes/new | FUNCTIONAL | ⚠️ Has ternarios | `/patients/:id/notes` |
| /[slug]/operations/appointments | FUNCTIONAL | ⚠️ Has ternarios | `/appointments` |
| /[slug]/operations/appointments/new | FUNCTIONAL | ⚠️ Has ternarios | `/appointments` |
| /[slug]/specialties/[id] | FUNCTIONAL | ✅ useI18n | `/specialties/:id` |
| /[slug]/audits | FUNCTIONAL | ✅ useI18n | `/audit` |
| /[slug]/settings | PARTIAL | ⚠️ Has ternarios | Parcial |

---

## 🔗 Dependencias

- [Skill: framer-motion](../skills/framer-motion/SKILL.md) - Animaciones
- [Skill: tailwind-design-system](../skills/tailwind-design-system/SKILL.md) - Tokens
- [Skill: i18n-migration](../skills/i18n-migration/SKILL.md) - Migrar ternarios

---

## 📝 Notas de la Auditoría

1. **23 páginas documentadas** (blueprint anterior solo tenía 2)
2. **2 páginas MOCK** requieren implementación de API real
3. **2 páginas PARTIAL** requieren completar conexión a APIs
4. **19 páginas FUNCTIONAL** completamente implementadas
5. **27+ archivos** en todo el proyecto aún usan ternarios `lang === 'en'`
6. **APIs completas** en `apps/api/src/` para casi todas las páginas
7. **i18n migration** es el siguiente paso crítico
