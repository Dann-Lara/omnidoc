# Módulo de Especialidades

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 07-specialties |
| **Estado** | ✅ Funcional (auditado 2026-05-05) |
| **Módulo** | Catálogo maestro de especialidades médicas |
| **Última actualización** | 2026-05-05 |

---

## 🎯 Propósito

Gestionar el catálogo maestro de especialidades médicas que estará disponible para los tenants. Cada especialidad tiene:
- Nombre bilingüe (nameEn/nameEs)
- Icono (Material Symbols)
- Descripción bilingüe
- Estado activo/inactivo (controlado por SaaS)
- ConfigSchema JSON para campos específicos futuros
- **Conteo real de citas** (appointmentCount via groupBy)

---

## 👥 Modelos de Datos (Prisma Schema)

### 1. Specialty - Catálogo Maestro (SaaS Global)

```prisma
model Specialty {
  id              String    @id @default(cuid())
  nameEn          String    // "Cardiology"
  nameEs          String?   // "Cardiología"
  icon            String?   // Material Symbols key: "cardiology"
  descriptionEs   String?   // Descripción en español
  descriptionEn   String?   // Descripción en inglés
  isActive        Boolean   @default(true) // Control de activación desde SaaS
  configSchema    Json?     // JSONB para campos específicos futuros

  tenantSpecialties TenantSpecialty[]

  @@index([isActive])
  @@index([nameEn])
}
```

### 2. TenantSpecialty - Relación Tenant → Specialty

```prisma
model TenantSpecialty {
  id              String    @id @default(cuid())
  tenantId        String    // Foreign Key a Organization
  specialtyId     String    // Foreign Key a Specialty
  statsVolume     Int       @default(0) // Volumen de pacientes para gráfica

  tenant      Organization @relation(fields: [tenantId], references: [id])
  specialty   Specialty  @relation(fields: [specialtyId], references: [id])

  @@unique([tenantId, specialtyId])
  @@index([tenantId])
  @@index([specialtyId])
}
```

### 3. Organización (campo specialtyIds)

El modelo `Organization` tiene un campo `specialtyIds String[]` que almacena las especialidades asignadas directamente (no usa TenantSpecialty para las queries actuales).

---

## 🔌 API Endpoints (12 endpoints reales)

### Público (sin auth)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/specialties` | Listado de especialidades activas (orderBy nameEn) |
| GET | `/specialties/:id` | Detalle de especialidad por ID |

### SaaS Admin (Protegido - Solo Superadmin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/admin/specialties` | Todas las especialidades (incluye inactivas) |
| GET | `/admin/specialties/stats` | Estadísticas: total, activas, top 3 más usadas |
| POST | `/admin/specialties` | Crear nueva especialidad |
| PATCH | `/admin/specialties/:id` | Actualizar especialidad (nombre, icono, config, isActive) |
| DELETE | `/admin/specialties/:id` | Desactivar especialidad (soft delete, isActive=false) |

### Tenant User (Autenticado)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/my-specialties` | Especialidades del tenant con **appointmentCount real** (groupBy) |
| POST | `/my-specialties` | Asignar especialidad al tenant (placeholder) |
| PUT | `/my-specialties` | Actualizar specialtyIds de la organización |
| GET | `/my-specialties/for-notes` | Especialidades filtradas por rol (COLLABORATOR usa specialtyIds del user) |

---

## 🌐 UI SaaS - Sidebar

```
Admin Sidebar:
├── Dashboard
├── Tenants
├── Operators
├── Users
├── Config
└── Parameters
    └── Specialties → /admin/parameters/specialties (CRUD completo)
```

### Páginas Admin
- **Listado**: `/admin/parameters/specialties` — tabla con toggle isActive
- **Crear**: `/admin/parameters/specialties/new` — re-export de `[id]/page.tsx`
- **Editar**: `/admin/parameters/specialties/[id]` — formulario completo

---

## 🌐 UI Tenant - Sidebar

```
Tenant Sidebar:
├── Dashboard
├── Profile
│   └── Especialidades → /[slug]/profile/specialties
├── Áreas
│   └── Especialidades → /[slug]/areas/specialties (grid con appointmentCount)
├── Patients
├── Appointments
└── Audits
```

### Páginas Tenant
- **Grid de especialidades**: `/[slug]/areas/specialties` — cards con size proporcional a `appointmentCount`
- **Detalle especialidad**: `/[slug]/specialties/[specialtyId]` — dashboard de la especialidad
- **Perfil especialidades**: `/[slug]/profile/specialties` — gestión de especialidades del perfil

---

## 📊 Lógica de `appointmentCount`

El endpoint `GET /my-specialties` calcula el conteo real de citas por especialidad:

```ts
const counts = await this.prisma.appointment.groupBy({
  by: ['specialtyId'],
  where: {
    organizationId: user.organizationId,
    specialtyId: { in: assignedIds },
  },
  _count: { specialtyId: true },
})
```

Esto alimenta el **grid de especialidades** del tenant donde las cards se dimensionan proporcionalmente al número real de citas.

---

## ✅ Criterios de Aceptación (estado actual)

- [x] Schema de Prisma con los 2 modelos
- [x] 12 API endpoints funcionando
- [x] Sidebar SaaS tiene "Parameters > Specialties"
- [x] Sidebar Tenant tiene "Áreas > Especialidades"
- [x] Page CRUD de especialidades en admin (create, edit, toggle isActive)
- [x] Page de áreas en tenant muestra specialties activas con `appointmentCount` real
- [x] Endpoint `/my-specialties` retorna conteo real de citas
- [x] Endpoint `/my-specialties/for-notes` filtra por rol
- [x] Endpoint `/specialties` público para queries sin auth
- [x] Endpoint `/specialties/:id` público para detalle

## ⏳ Pendientes reales

- **POST `/my-specialties`**: es un placeholder — no asigna realmente al tenant, retorna mensaje estático
- **Guards**: endpoints de admin no tienen SuperAdminGuard explícito (dependen de auth genérico)
- **DTOs estrictos**: el controller usa `@Body() data: any` en create/update (debería usar DTO tipados)
- **i18n**: 1 ternario pendiente en `/[slug]/areas/specialties/page.tsx`
- **Soft delete**: DELETE usa `isActive=false` pero no hay endpoint de hard delete ni de restore

---

## 🔗 Dependencias

- `01-auth/02-backend.md` - Sistema de auth
- `02-admin/02-sidebar.md` - Sidebar admin
- `03-tenant/02-sidebar.md` - Sidebar tenant
- `00-global/06-security.md` - Reglas de seguridad
- `03-tenant/08-appointments` - appointmentCount depende de citas
