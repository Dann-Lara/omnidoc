# 06-Team - Gestión de Equipo (Subordinados)

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 03-tenant/06-team |
| **Estado** | 🔄 Parcialmente implementado |

---

## 🎯 Propósito

Sistema de gestión de usuarios subordinados del tenant. El tenant puede crear diferentes tipos de usuarios con permisos específicos y asignaciones por especialidad.

**Características principales:**
- Tipos de usuario genéricos configurables por tenant
- Permisos granulares por usuario
- Asignación por especialidades
- Invitaciones por email
- Dashboard personalizado según tipo

---

## 📁 Estructura de Blueprints

```
03-tenant/06-team/
├── README.md           # Este archivo - índice
├── 01-model.md         # Modelos de datos ✅
├── 02-api.md          # Endpoints API ✅
├── 03-frontend.md     # Páginas Frontend ⏳
└── 04-flow.md         # Flujo invitación y login ⏳
```

---

## ✅ Fases Completadas

| Fase | Descripción | Estado |
|------|-------------|--------|
| **Fase 1** | Extender Prisma (User + TeamInvitation + enum) | ✅ Completado |
| **Fase 2** | Crear API endpoints (/team) | ✅ Completado |
| **Fase 3** | Frontend /areas/team pages | ✅ Completado |

---

## 📋 Resumen de Funcionalidad

### 1. Tipos de Usuario Genéricos

Cada tenant define sus propios tipos de usuarios subordinados. Ejemplo por defecto:

| Tipo Key | Nombre | Permisos Base | Dashboard |
|----------|--------|--------------|----------|
| `doctor` | Médico | appointments, patients, clinical_history | `/specialties/[id]` |
| `nurse` | Enfermero | appointments, patients | `/nursing` |
| `receptionist` | Recepcionista | appointments, patients | `/reception` |
| `subadmin` | Subadministrador | inventory, users, settings | `/admin/[area]` |

El tenant puede personalizar estos tipos en su configuración.

### 2. Permisos Granulares

```typescript
type UserPermissions = {
  appointments: { read: boolean, write: boolean, delete: boolean }
  patients: { read: boolean, write: boolean, sensitive: boolean }
  clinicalHistory: { read: boolean, write: boolean }
  inventory: { read: boolean, write: boolean }
  team: { read: boolean, manage: boolean }
  settings: { read: boolean, manage: boolean }
  billing: { read: boolean, manage: boolean }
  analytics: { view: boolean }
}
```

### 3. Sistema de Invitaciones

- El admin crea invitación → se guarda en DB → se envía email
- Usuario hace click en link → completa signup → se crea usuario en Supabase
- Login → redirect según tipo de usuario

---

## 📄 Documentación Detallada

### [01-Model](./01-model.md)

Modelos de datos en Prisma y estructura de configuraciones.

### [02-API](./02-api.md)

Endpoints REST para CRUD de subordinados e invitaciones.

### [03-Frontend](./03-frontend.md)

Páginas y componentes del frontend.

### [04-Flow](./04-flow.md)

Flujo de invitación, signup y login con redirect personalizado.

---

## 🗺️ Roadmap de Implementación (actualizado)

| Fase | Descripción | Estado |
|------|-------------|--------|
| **Fase 1** | Extender Prisma + TeamInvitation | ✅ Completado |
| **Fase 2** | Crear API endpoints (/team) | ✅ Completado |
| **Fase 3** | Crear páginas frontend (/areas/team) | ✅ Completado |
| **Fase 4** | Integrar email (Resend) | 🔄 Parcial |
| **Fase 5** | Redirect personalizado en login | 🔄 Parcial |

---

## 🔗 Dependencias

- [Auth Backend](../01-auth/02-backend.md) - Login y signup
- [Resend API](https://resend.com) - Envío de emails (ya configurado en .env)
- [Prisma Schema](./01-model.md) - Modelos de datos
- [Skills: NestJS](../skills/nestjs-best-practices/)
- [Skills: Next.js](../skills/next-best-practices/)

---

## ✅ Criterios de Aceptación (estado)

- [x] Modelos de datos creados
- [x] API de team implementada
- [x] Página /areas/team implementada
- [x] Invitaciones por email funcionando
- [x] Redirect por tipo de usuario funcionando
- [ ] Permisos granulares aplicados