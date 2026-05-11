# 10-Workflows: 01-Permissions — Homogeneizar Sistema de Permisos

## Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 10-workflows/01-permissions |
| **Estado** | ⏳ Pendiente de Implementación |
| **Impacto** | Frontend: `profile/user-types`, `areas/team/[userId]`, Backend: `SupabaseAuthGuard` |

## Problema

Actualmente hay **dos sistemas de permisos divergentes**:

| Aspecto | `profile/user-types` | `areas/team/[userId]` |
|---------|---------------------|----------------------|
| Módulos | 7 (`appointments`, `patients`, `clinical_history`, `inventory`, `billing`, `users`, `settings`) | 3 (`appointments`, `patients`, `clinicalHistory`) |
| Nombres | `clinical_history` (snake_case) | `clinicalHistory` (camelCase) |
| Formato | String array (`["appointments:read"]`) | JSON anidado (`{"appointments":{"read":true}}`) |
| Backend | `Organization.settings.userTypes[].permissions` (string[]) | `User.permissions` (JSON) |

Además, `req.user.permissions` **nunca se puebla** en `SupabaseAuthGuard`, lo que rompe los guards de pharmacy que esperan leerlo.

## Solución

### 1. Fuente única de módulos

Crear `apps/web/src/lib/permissions/modules.ts`:

```typescript
export interface PermissionModule {
  key: string
  label: string
  labelEn: string
  actions: string[]
}

export const PERMISSION_MODULES: PermissionModule[] = [
  { key: 'appointments',     label: 'Agenda',           labelEn: 'Appointments',     actions: ['read', 'write', 'delete'] },
  { key: 'patients',         label: 'Pacientes',        labelEn: 'Patients',         actions: ['read', 'write', 'delete', 'sensitive'] },
  { key: 'clinical_history', label: 'Expedientes',      labelEn: 'Clinical History', actions: ['read', 'write'] },
  { key: 'inventory',        label: 'Inventario',        labelEn: 'Inventory',        actions: ['read', 'write', 'delete'] },
  { key: 'pharmacy',         label: 'Farmacia',          labelEn: 'Pharmacy',         actions: ['read', 'dispense', 'restock', 'adjust'] },
  { key: 'notes',            label: 'Notas Clínicas',    labelEn: 'Clinical Notes',   actions: ['read', 'write', 'vitals'] },
  { key: 'billing',          label: 'Facturación',       labelEn: 'Billing',          actions: ['read', 'manage'] },
  { key: 'users',            label: 'Usuarios',          labelEn: 'Users',            actions: ['read', 'manage'] },
  { key: 'settings',         label: 'Configuración',     labelEn: 'Settings',         actions: ['read', 'manage'] },
  { key: 'analytics',        label: 'Analíticas',        labelEn: 'Analytics',        actions: ['view'] },
]
```

### 2. Refactorizar user-types page

- Reemplazar `PERMISSION_MODULES` inline por import desde `@/lib/permissions/modules`
- Mantener el mismo formato de guardado (string array) — no romper compatibilidad

### 3. Refactorizar team member edit page

- Reemplazar `PERMISSIONS` inline (3 items) por import desde `@/lib/permissions/modules`
- Unificar `clinicalHistory` → `clinical_history`
- Mantener el mismo formato de guardado (JSON anidado) — no romper compatibilidad
- Agregar columnas de acciones adicionales según el módulo:
  - `pharmacy`: read, dispense, restock, adjust
  - `notes`: read, write, vitals
  - `sensitive` para patients
  - `manage` para billing/users/settings
  - `view` para analytics

### 4. Poblar `req.user.permissions` en backend

En `apps/api/src/auth/supabase-auth.guard.ts`, después de obtener el user:

```typescript
// Si el user tiene permissions propias, usarlas
// Si no, obtener del role asociado
let permissions = user.permissions
if (!permissions && user.role) {
  permissions = flattenPermissions(user.role.permissions)
}
req.user = { ...req.user, permissions }
```

Implementar helper `flattenPermissions()` (ya existe en `team.service.ts` como método no utilizado — mover a util compartida):

```typescript
// Convierte ["appointments:read", "patients:write"]
// a { "appointments.read": true, "patients.write": true }
function flattenPermissions(perms: string[]): Record<string, boolean> {
  const flat: Record<string, boolean> = {}
  for (const p of perms) {
    flat[p.replace(':', '.')] = true
  }
  return flat
}
```

### 5. Sincronizar formatos

El equipo member edit guarda como `{ "appointments": { "read": true } }` pero los guards de pharmacy esperan `{ "pharmacy.read": true }`. Normalizar en backend al leer: aplanar el JSON anidado al mismo formato que `flattenPermissions`.

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `apps/web/src/lib/permissions/modules.ts` | **CREAR** — fuente única de módulos |
| `apps/web/src/app/[slug]/profile/user-types/page.tsx` | Importar desde `modules.ts`, agregar `pharmacy`, `notes`, `analytics` |
| `apps/web/src/app/[slug]/areas/team/[userId]/page.tsx` | Importar desde `modules.ts`, reemplazar inline, unificar `clinicalHistory` → `clinical_history`, agregar módulos faltantes |
| `apps/api/src/auth/supabase-auth.guard.ts` | Poblar `req.user.permissions` desde `user.permissions` o `user.role.permissions` |
| `apps/api/src/team/team.service.ts` | Mover/extrar `flattenPermissions` a util compartida |
| `apps/web/src/lib/i18n/translations.ts` | Agregar claves i18n para nuevos módulos (`pharmacy`, `notes`, `analytics`) en sección `team.*` y `userTypes.*` |

## Criterios de Aceptación

- [ ] `profile/user-types` y `areas/team/[userId]` muestran los mismos 10 módulos
- [ ] `clinicalHistory` reemplazado por `clinical_history` en team edit (migración de datos existentes)
- [ ] `req.user.permissions` poblado correctamente en `SupabaseAuthGuard`
- [ ] Guard de pharmacy funciona para collaborators con permiso
- [ ] Owner (isTenantAdmin) sigue teniendo bypass total
- [ ] Orgs existentes sin cambios en sus datos — migración sin pérdida
- [ ] Nuevos módulos extensibles: agregar uno nuevo es solo agregar una entrada en `modules.ts`

## Notas

- Los formatos de almacenamiento (string array vs JSON anidado) se mantienen por compatibilidad — la normalización ocurre al leer
- El orden de los módulos en la UI debe ser el mismo en ambas páginas para consistencia
- `notes:vitals` es el permiso clave para la Fase 2 — sin él, el modal de vitales no aparece
- `pharmacy.dispense` es el permiso clave para la Fase 3 — sin él, no hay notificaciones de dispensación
