# 03-Tenant - Módulo de Tenant (Organizaciones)

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Módulo** | Tenant |
| **Estado** | ✅ Funcional (auditado 2026-05-05) |
| **Última actualización** | 2026-05-05 |

---

## 🎯 Propósito

Documentar el layout de las organizaciones (tenants), que permite a cada clínica/consultorio tener su propio espacio con dashboard, perfil y otras páginas.

Este módulo usa rutas dinámicas basadas en el `org_slug` de cada organización.

---

## 📁 Estructura de Archivos (Real)

```
apps/web/src/app/
└── [slug]/
    ├── layout.tsx                   # Layout principal con sidebar + navbar
    ├── page.tsx                     # Landing del tenant (MOCK - placeholder)
    ├── dashboard/
    │   ├── layout.tsx              # Layout del dashboard (simplificado)
    │   ├── page.tsx                # Dashboard del tenant (PARTIAL - API + mock stats)
    │   └── components/
    │       ├── TenantSidebar.tsx   # Sidebar específico del tenant
    │       └── TenantNavbar.tsx    # Navbar específico del tenant
    ├── profile/
    │   ├── page.tsx                # Perfil del usuario (FUNCTIONAL)
    │   ├── edit/page.tsx           # Editar perfil (FUNCTIONAL)
    │   ├── specialties/page.tsx     # Mis especialidades (FUNCTIONAL)
    │   └── user-types/page.tsx     # Tipos de usuario (FUNCTIONAL)
    ├── areas/
    │   ├── team/
    │   │   ├── page.tsx           # Equipo médico (FUNCTIONAL)
    │   │   ├── [userId]/page.tsx  # Detalle miembro (FUNCTIONAL)
    │   │   ├── add/page.tsx       # Invitar miembro (FUNCTIONAL)
    │   │   └── invitations/page.tsx # Invitaciones (FUNCTIONAL)
    │   └── specialties/
    │       └── page.tsx           # Especialidades tenant grid (FUNCTIONAL)
    ├── operations/
    │   ├── patients/
    │   │   ├── page.tsx           # Directorio pacientes (FUNCTIONAL)
    │   │   ├── new/page.tsx       # Nuevo paciente (FUNCTIONAL)
    │   │   └── [patientId]/
    │   │       ├── page.tsx       # Ficha paciente (FUNCTIONAL)
    │   │       ├── history/page.tsx # Historial clínico (FUNCTIONAL)
    │   │       └── notes/
    │   │           ├── new/page.tsx # Nueva nota (FUNCTIONAL)
    │   │           └── [noteId]/page.tsx # Ver nota (FUNCTIONAL)
    │   └── appointments/
    │       ├── page.tsx           # Citas médicas (FUNCTIONAL)
    │       ├── new/page.tsx       # Nueva cita (FUNCTIONAL)
    │       ├── [appointmentId]/
    │       │   ├── page.tsx       # Detalle cita (FUNCTIONAL)
    │       │   └── edit/page.tsx  # Editar cita (FUNCTIONAL)
    │       └── components/
    │           ├── AppointmentsTable.tsx
    │           ├── AgendaView.tsx
    │           ├── AppointmentForm.tsx
    │           ├── DateTimePicker.tsx
    │           └── UnifiedFilters.tsx
    ├── specialties/
    │   └── [specialtyId]/
    │       ├── layout.tsx         # Specialty layout
    │       └── page.tsx           # Detalle especialidad (FUNCTIONAL)
    ├── audits/
    │   └── page.tsx              # Auditoría tenant (MOCK)
    └── settings/
        └── page.tsx              # Configuración tenant (FUNCTIONAL)
```

---

## 🎨 Características del Layout

| Característica | Descripción |
|----------------|-------------|
| **Ruta dinámica** | `/[slug]/...` donde `slug` es el `org_slug` |
| **Sidebar** | Colapsable, muestra nombre de la organización |
| **Navbar** | Con nombre de la organización |
| **Auth** | Verifica que el usuario pertenezca a esa organización |
| **Dark Mode** | Soportado |

---

## 📋 Blueprint Index

| # | Archivo | Descripción | Estado |
|---|---------|-------------|--------|
| 01 | [01-layout/README.md](./01-layout/README.md) | Estructura del layout dinámico | ✅ |
| 02 | [02-sidebar/README.md](./02-sidebar/README.md) | TenantSidebar | ✅ |
| 03 | [03-navbar/README.md](./03-navbar/README.md) | TenantNavbar | ✅ |
| 04 | [04-pages/README.md](./04-pages/README.md) | Pages (24 páginas documentadas) | ✅ Actualizado |
| 05 | [05-middleware/README.md](./05-middleware/README.md) | Rutas protegidas | ✅ |
| 06 | [06-team/README.md](./06-team/README.md) | Gestión de equipo y permisos | ✅ |
| 07 | [07-patients/README.md](./07-patients/README.md) | Pacientes y Expediente Clínico | ✅ |
| 08 | [08-appointments/README.md](./08-appointments/README.md) | Citas médicas | ✅ Completado |
| 09 | [09-pharmacy/README.md](./09-pharmacy/README.md) | Farmacia e Inventario (FEAT-PHARMA-001) | ⏳ Pendiente |

---

## 🔐 Flujo de Autenticación

```
[Middleware]                    [Tenant Layout]              [Redirect]
    │                              │                          │
    ├── /clinic/dashboard ──────► │                          │
    │   (sin cookie)               │                          │
    │                              │ ◄── /login?redirect=... │
    │                              │                          │
    ├── /clinic/dashboard ──────► │                          │
    │   (con cookie)               │                          │
    │                              ├── getStoredUser() ─────► │
    │                              │   (org_slug != 'clinic') │
    │                              │ ◄── /[user_org]/dashboard│
    │                              │                          │
    │                              ├── getStoredUser() ─────► │
    │                              │   (org_slug == 'clinic') │
    │                              │ ◄── Render sidebar +     │
    │                              │     navbar + children   │
```

---

## 📝 Diferencias con Admin

| Aspecto | Admin | Tenant |
|---------|-------|--------|
| Ruta | `/admin` (fija) | `/[slug]/...` (dinámica) |
| Sidebar | Logo OmniDoc | Logo + nombre organización |
| Navbar | Buscador | Menú toggle + org name |
| Auth check | Solo SaaS users | Solo users con ese org_slug |

---

## 📊 Resumen de Estado (Auditoría 2026-05-05)

| Categoría | Count | Detalles |
|-----------|-------|----------|
| **Total Pages** | 24 | En `apps/web/src/app/[slug]/` |
| **FUNCTIONAL** | 20 | Conectadas a API real |
| **MOCK** | 2 | Landing (`/[slug]`), Audits |
| **PARTIAL** | 1 | Dashboard (API + mock stats) |
| **i18n con ternarios** | 19 archivos | ~197 ocurrencias (ver i18n-migration.md) |
| **i18n migrado** | 5 archivos | Usan `t('key')` sin ternarios |

---

## 🗺️ Roadmap de Implementación

| Fase | Descripción | Estado |
|------|-------------|--------|
| **Fase 1** | Layout base + Dashboard (PARTIAL) | ✅ Completado |
| **Fase 2** | Profile + Team + Specialties | ✅ Completado |
| **Fase 3** | Patients + Clinical Notes | ✅ Completado |
| **Fase 4** | Appointments + Calendar | ✅ Completado |
| **Fase 5** | Audits + Settings | ✅ Settings funcional, Audits MOCK |
| **Fase 6** | i18n Migration (19 archivos pendientes) | ⏳ Pendiente |
| **Fase 7** | Conectar Dashboard MOCK a endpoints reales | ⏳ Pendiente |

---

## 🔗 Dependencias

```
00-GLOBAL ✅
    │
    └── 03-TENANT (este blueprint)
          ├── 01-auth ✅ (requiere login primero)
          ├── 01-auth/04-refactor (middleware debe actualizar)
          ├── 07-patients ✅ (implementado completamente)
          ├── 08-appointments ✅ (implementado completamente)
          ├── 09-pharmacy ⏳ (pendiente - FEAT-PHARMA-001)
          ├── 07-specialties ✅ (12 endpoints)
          ├── tailwind-design-system skill
          ├── framer-motion skill
          └── next-best-practices skill
```

---

## 📝 Notas Importantes

- **Ruta**: `/[slug]/dashboard`, `/[slug]/profile`, etc.
- **Slug**: viene del `org_slug` del usuario
- **Verificación**: el layout verifica que el usuario pertenezca a esa organización
- **Links en sidebar**: deben usar el slug dinámico
- **Settings**: ahora es FUNCTIONAL — tiene `GET/PATCH /settings/org-lang/:slug`
- **Specialty detail**: `/[slug]/specialties/[specialtyId]` existe y es FUNCTIONAL
- **i18n**: 19 archivos con ternarios pendientes (~197 ocurrencias)

---

## 🔭 Siguiente Step

**i18n Migration** → Migrar 19 archivos de tenant que aún usan ternarios
**API Connection** → Conectar Dashboard stats mock a endpoints reales
**Audits Page** → Conectar a API real
**Pharmacy Module** → Implementar 09-pharmacy (FEAT-PHARMA-001) de auditoría
