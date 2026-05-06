# 08-Appointments - Módulo de Citas Médicas

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Módulo** | Appointments |
| **Estado** | ✅ Completado (auditado 2026-05-05) |
| **Última actualización** | 2026-05-05 |

---

## 🎯 Propósito

Implementar el módulo de **Super Agenda** en el tenant, permitiendo la gestión completa de citas médicas con integración a especialidades, KPIs, vista agenda (day/week/month), filtros unificados y notificaciones por email.

---

## 📁 Estructura de Archivos (Real)

```
apps/web/src/app/[slug]/
└── operations/
    └── appointments/
        ├── page.tsx                      # Directorio con vista tabla + agenda (FUNCTIONAL)
        ├── new/
        │   └── page.tsx                  # Nueva cita (FUNCTIONAL)
        └── [appointmentId]/
            ├── page.tsx                  # Detalle (FUNCTIONAL)
            └── edit/
                └── page.tsx              # Editar cita con status chips + audit log (FUNCTIONAL)

apps/web/src/app/[slug]/operations/appointments/components/
├── AppointmentsTable.tsx                 # Tabla con dropdown de acciones
├── AgendaView.tsx                        # Vista day/week/month con modal unificado
├── AppointmentForm.tsx                   # Formulario reutilizable (new + edit)
├── DateTimePicker.tsx                    # Selector fecha/hora
└── UnifiedFilters.tsx                    # Filtros por estado, médico, especialidad

apps/api/src/appointments/
├── appointments.module.ts
├── appointments.controller.ts            # 11 endpoints (ver abajo)
├── appointments.service.ts               # Lógica completa + email automático
└── dto/
    ├── create-appointment.dto.ts
    ├── update-appointment.dto.ts
    └── list-appointments-query.dto.ts
```

---

## 🔌 API Endpoints (Implementados)

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/appointments/kpis` | KPIs: total, today, confirmed, scheduled |
| GET | `/appointments` | Lista con filtros (status, doctorId, specialtyId, dateRange, page, limit) |
| GET | `/appointments/:id` | Detalle de cita (incluye patient, user, specialty) |
| POST | `/appointments` | Crear nueva cita |
| PATCH | `/appointments/:id` | Actualizar cita completa |
| DELETE | `/appointments/:id` | Eliminar cita |
| PATCH | `/appointments/:id/status` | Actualizar solo status (auto-envía email en CONFIRMED/CANCELED) |
| POST | `/appointments/:id/resend-email` | Reenviar email de confirmación |
| GET | `/appointments/specialty/:specialtyId` | Citas por especialidad |
| GET | `/appointments/stats` | Conteo de citas por especialidad (usado en specialty grid) |
| GET | `/appointments/:id/audit-log` | Historial de cambios de una cita |

---

## 📋 Fases de Desarrollo (Estado Real)

| Fase | Descripción | Estado |
|------|-------------|--------|
| 01 | Schema prisma (room, mode, specialtyId) | ✅ Completado |
| 02 | Endpoints backend NestJS (11 endpoints) | ✅ Completado |
| 03 | Directorio + tabla de citas | ✅ Completado |
| 04 | Formulario nueva cita | ✅ Completado |
| 05 | Edición de cita con status chips | ✅ Completado |
| 06 | Integración con vista especialidad | ✅ Completado |
| 07 | Componentes reutilizables | ✅ Completado |
| 08 | Email notifications (confirm/cancel) | ✅ Completado |
| 09 | Vista agenda (day/week/month) con modal | ✅ Completado |

---

## 🎨 Características del Frontend

### Vista Directorio (`/appointments`)
- **Tabla bento** con paginación y filtros unificados
- **Vista agenda** (day/week/month) con modal de acciones unificado
- KPIs en tiempo real desde `GET /appointments/kpis`
- Filtros por estado, médico, especialidad, rango de fechas

### Vista Nueva Cita (`/appointments/new`)
- Selección de paciente (search), médico, especialidad
- Date/time picker, modo (in-person/telehealth), sala
- Envía `POST /appointments` con email automático

### Vista Detalle (`/appointments/[id]`)
- Información completa de la cita
- Datos del paciente, médico, especialidad
- Status badge con color coding

### Vista Editar (`/appointments/[id]/edit`)
- Formulario pre-poblado
- Status chips clickeables (SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELED)
- Audit log visible
- Resend email button
- Confirm modal para delete

### Vista Agenda (`AgendaView.tsx`)
- Day view: timeline con citas
- Week view: grid semanal
- Month view: grid mensual con dots de status
- Modal unificado `⋮` para acciones (evita overflow en mobile)

---

## 📝 Modelo de Datos (Schema Prisma)

```prisma
model Appointment {
  id             String            @id @default(uuid())
  organizationId String
  patientId      String
  userId         String            // médico asignado
  specialtyId    String?           // especialidad (nullable)
  scheduledAt    DateTime
  duration       Int
  status         AppointmentStatus @default(SCHEDULED)
  type           String
  mode           String?           // IN_PERSON | TELEHEALTH
  room           String?           // sala/consultorio
  notes          String?
  aiPredictions  Json?
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  patient      Patient      @relation(fields: [patientId], references: [id])
  user         User         @relation(fields: [userId], references: [id])
  specialty    Specialty?   @relation(fields: [specialtyId], references: [id])

  @@index([organizationId])
  @@index([userId])
  @@index([patientId])
  @@index([scheduledAt])
  @@index([status])
  @@index([specialtyId])
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELED
}
```

---

## 📧 Email Notifications

El `MailService.sendAppointmentStatusChangeEmail` se dispara automáticamente cuando:
- Status cambia a `CONFIRMED` → email de confirmación
- Status cambia a `CANCELED` → email de cancelación
- Se usa manualmente desde el botón "Resend email" en edit page

Template HTML incluye: paciente, doctor, especialidad, fecha, hora, ubicación.

---

## 🔐 Control de Permisos

| Permiso | Recepcionista | Enfermería | Médico | Admin |
|---------|---------------|-------------|--------|-------|
| `appointments:read` | ✅ | ✅ | ✅ | ✅ |
| `appointments:write` | ✅ | ✅ | ✅ | ✅ |
| `appointments:delete` | ❌ | ❌ | ✅ | ✅ |
| `appointments:status` | ✅ (confirm/cancel) | ✅ | ✅ | ✅ |

---

## 🌐 i18n

- **Pages con i18n migrado**: `page.tsx`, `new/page.tsx`, `[id]/edit/page.tsx` (usan `t()`)
- **Components con ternarios pendientes**: `AgendaView.tsx` (6 ternarios)
- `[id]/page.tsx` usa strings hardcodeados (no ternarios, no i18n)

---

## 🔗 Dependencias

```
00-GLOBAL ✅
    │
    └── 03-TENANT
            ├── 08-appointments ✅
            ├── 07-patients (relación patientId)
            ├── 07-specialties (relación specialtyId)
            ├── 06-team (relación userId/médico)
            ├── mail service (notificaciones)
            ├── next-best-practices skill
            ├── nestjs-best-practices skill
            ├── tailwind-design-system skill
            └── framer-motion skill
```

---

## 📝 Notas Importantes

- **SpecialtyId**: es ULID, no UUID — evitar `ParseUUIDPipe` en este parámetro
- **Email automático**: `updateStatus` en service dispara email si CONFIRMED/CANCELED
- **Modal unificado**: AgendaView usa un solo modal para acciones (mejor UX en mobile)
- **GET /appointments/stats**: retorna conteo por specialtyId para grid de especialidades
- **i18n**: 6 ternarios pendientes en `AgendaView.tsx`

---

## 🔭 Siguiente Step

- **i18n Migration**: Migrar 6 ternarios en `AgendaView.tsx`
- **Audit Log UI**: Mejorar visualización del audit log en edit page
- **Real-time**: Considerar WebSockets para actualización de KPIs
