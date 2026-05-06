# 04-Pages - Páginas del Módulo Admin

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 02-admin/04-pages |
| **Estado** | 🔄 Actualizado según auditoría 2026-05-05 |

---

## 🎯 Propósito

Documentar las páginas del módulo admin, su estado actual (FUNCTIONAL, MOCK, PARTIAL) y páginas futuras.

**Leyenda de Estado:**
- **FUNCTIONAL**: Página conectada a API real, completamente funcional
- **MOCK**: Página con datos hardcodeados, requiere implementación de API
- **PARTIAL**: Mezcla de datos reales y hardcodeados

---

## 📁 Estructura de Páginas (Actualizada)

```
apps/web/src/app/admin/
├── page.tsx                        # Dashboard (MOCK - hardcoded data)
├── profile/
│   └── page.tsx                   # Perfil de usuario (FUNCTIONAL)
├── operators/
│   ├── page.tsx                   # Lista de operadores (FUNCTIONAL - API connected)
│   ├── [id]/page.tsx              # Detalle de operador (FUNCTIONAL - API connected)
│   ├── add/page.tsx               # Invitar operador (FUNCTIONAL - API connected)
│   └── invitations/page.tsx       # Invitaciones pendientes (FUNCTIONAL - API connected)
├── tenants/
│   ├── page.tsx                   # Directorio de tenants (FUNCTIONAL - API connected)
│   └── [id]/page.tsx             # Detalle de tenant (FUNCTIONAL - API connected)
├── audits/
│   └── page.tsx                   # Auditoría del sistema (MOCK - hardcoded data)
├── parameters/
│   └── specialties/
│       ├── page.tsx               # Catálogo de especialidades (FUNCTIONAL - API connected)
│       ├── new/page.tsx           # Nueva especialidad (FUNCTIONAL - API connected)
│       └── [id]/page.tsx         # Editar especialidad (FUNCTIONAL - API connected)
└── settings/
    └── page.tsx                   # Configuración global (PARTIAL - mixed)
```

---

## 📄 Páginas Existentes

### 01-Dashboard (`/admin`) - MOCK

**Archivo:** `apps/web/src/app/admin/page.tsx`

**Estado:** MOCK (datos hardcodeados)

**Contenido:**
- Stats cards: Active Tenants, Total Users, System Health, API Requests
- Gráficos de métricas (placeholder)
- Lista de actividad reciente (placeholder)

**TODO:** Conectar a endpoints `/admin/stats` y `/admin/activity`

**Características:**
- Usa Framer Motion para animaciones
- Responsive grid
- Dark mode soportado
- i18n: Migrado a useI18n

---

### 02-Profile (`/admin/profile`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/admin/profile/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/admin/profile` - Datos del perfil
- PUT `/admin/profile` - Actualizar perfil
- POST `/admin/profile/avatar` - Upload avatar

**Contenido:**
- Avatar upload
- Formulario de información personal
- Cambio de contraseña
- Session key management

**Características:**
- Form con validaciones
- Upload de imagen
- Dark mode soportado
- i18n: Has ternarios `lang === 'en'` pendientes de migración

---

### 03-Operators (`/admin/operators`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/admin/operators/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/admin/operators` - Lista de operadores
- DELETE `/admin/operators/:id` - Desactivar operador

**Características:**
- Tabla con filtros (status, search)
- Paginación
- Botón invitar nuevo operador
- i18n: Has ternarios `lang === 'en'` pendientes

---

### 04-Operator Detail (`/admin/operators/[id]`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/admin/operators/[id]/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/admin/operators/:id` - Detalle de operador
- PUT `/admin/operators/:id/tenants` - Actualizar tenants asignados

**Características:**
- Vista detalle con tenants asignados
- Formulario edición de tenants
- i18n: Has ternarios pendientes

---

### 05-Add Operator (`/admin/operators/add`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/admin/operators/add/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- POST `/invitations` - Crear invitación con role OPERATOR
- GET `/admin/tenants` - Lista de tenants para asignar

**Características:**
- Formulario invitación
- Selección múltiple de tenants
- i18n: Migrado a useI18n

---

### 06-Operator Invitations (`/admin/operators/invitations`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/admin/operators/invitations/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/invitations?role=OPERATOR` - Lista invitaciones
- DELETE `/invitations/:id` - Revocar invitación
- POST `/invitations/:id/resend` - Reenviar invitación

**Características:**
- Tabla de invitaciones pendientes
- Acciones: reenviar, revocar
- i18n: Has ternarios pendientes

---

### 07-Tenants Directory (`/admin/tenants`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/admin/tenants/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/admin/tenants` - Lista paginada de tenants
- GET `/admin/tenants/stats` - KPIs del directorio

**Características:**
- KPIs: total tenants, MRR, active users, churn risk
- Tabla con filtros (status, plan, search)
- Paginación
- i18n: Has ternarios pendientes

---

### 08-Tenant Detail (`/admin/tenants/[id]`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/admin/tenants/[id]/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/admin/tenants/:id` - Detalle de tenant
- PUT `/admin/tenants/:id/status` - Cambiar status

**Características:**
- Información general del tenant
- Plan y suscripción
- Usuarios en el tenant
- Acciones: suspender/activar
- i18n: Migrado a useI18n

---

### 09-Audits (`/admin/audits`) - MOCK

**Archivo:** `apps/web/src/app/admin/audits/page.tsx`

**Estado:** MOCK (datos hardcodeados)

**Contenido:**
- Lista de eventos de auditoría
- Filtros por tipo, fecha, usuario

**TODO:** Implementar endpoint `/admin/audits` y conectar datos reales

**Características:**
- Timeline de eventos
- Filtros y búsqueda
- i18n: Migrado a useI18n

---

### 10-Specialties (`/admin/parameters/specialties`) - FUNCTIONAL

**Archivo:** `apps/web/src/app/admin/parameters/specialties/page.tsx`

**Estado:** FUNCTIONAL (API connected)

**Endpoints utilizados:**
- GET `/specialties` - Lista de especialidades
- POST `/specialties` - Crear especialidad
- PUT `/specialties/:id` - Actualizar especialidad
- DELETE `/specialties/:id` - Eliminar especialidad

**Características:**
- Catálogo global de especialidades
- CRUD completo
- i18n: Migrado a useI18n

---

### 11-Settings (`/admin/settings`) - PARTIAL

**Archivo:** `apps/web/src/app/admin/settings/page.tsx`

**Estado:** PARTIAL (mezcla de real y mock)

**Características:**
- Configuración global de la plataforma
- Secciones: general, security, notifications
- i18n: Has ternarios pendientes

---

## 📄 Páginas Próximamente

### 12-Futuro - Users

```
/admin/users
```

**Propósito:** Gestión de usuarios de la plataforma

**Estado:** ⏳ Pendiente

---

### 13-Futuro - Platform Config

```
/admin/config
```

**Propósito:** Configuración global de la plataforma

**Estado:** ⏳ Pendiente (parcial en `/admin/settings`)

---

## 🎨 Patrón de Página

Cada página nueva debe seguir este patrón:

```tsx
'use client'

import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'

// Variants para animaciones
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  }
}

export default function PageName() {
  const { t } = useI18n()
  
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

- [x] Dashboard implementado (MOCK - requiere API)
- [x] Profile implementado (FUNCTIONAL)
- [x] Operators implementado (FUNCTIONAL)
- [x] Tenant Directory implementado (FUNCTIONAL)
- [x] Specialties implementado (FUNCTIONAL)
- [ ] Audits (MOCK - requiere API)
- [ ] Users (pendiente)
- [ ] Platform Config (pendiente)

---

## 📊 Resumen de Estado (Auditoría 2026-05-05)

| Página | Estado | i18n Status | API Endpoint |
|--------|--------|-------------|--------------|
| /admin | MOCK | ✅ useI18n | Requiere `/admin/stats` |
| /admin/profile | FUNCTIONAL | ⚠️ Has ternarios | `/admin/profile` |
| /admin/operators | FUNCTIONAL | ⚠️ Has ternarios | `/admin/operators` |
| /admin/operators/[id] | FUNCTIONAL | ⚠️ Has ternarios | `/admin/operators/:id` |
| /admin/operators/add | FUNCTIONAL | ✅ useI18n | `/invitations` |
| /admin/operators/invitations | FUNCTIONAL | ⚠️ Has ternarios | `/invitations` |
| /admin/tenants | FUNCTIONAL | ⚠️ Has ternarios | `/admin/tenants` |
| /admin/tenants/[id] | FUNCTIONAL | ✅ useI18n | `/admin/tenants/:id` |
| /admin/audits | MOCK | ✅ useI18n | Requiere `/admin/audits` |
| /admin/parameters/specialties | FUNCTIONAL | ✅ useI18n | `/specialties` |
| /admin/settings | PARTIAL | ⚠️ Has ternarios | Parcial |

---

## 🔗 Dependencias

- [Skill: framer-motion](../skills/framer-motion/SKILL.md) - Animaciones
- [Skill: tailwind-design-system](../skills/tailwind-design-system/SKILL.md) - Tokens
- [Skill: i18n-migration](../skills/i18n-migration/SKILL.md) - Migrar ternarios

---

## 📝 Notas de la Auditoría

1. **13 páginas documentadas** (blueprint anterior solo tenía 2)
2. **3 páginas MOCK** requieren implementación de API real
3. **27+ archivos** aún usan ternarios `lang === 'en'` en todo el proyecto
4. **APIs completas** en `apps/api/src/` para la mayoría de páginas
5. **i18n migration** es el siguiente paso crítico
