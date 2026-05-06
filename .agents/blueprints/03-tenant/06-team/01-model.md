# 06-Team/01-Model - Modelos de Datos

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 03-tenant/06-team/01-model |
| **Depende de** | README.md |

---

## 🎯 Propósito

Documentar los modelos de datos necesarios para el sistema de equipo subordinado.

---

## 1. Extensión del Modelo User

### Campos a agregar en Prisma

```prisma
model User {
  // ...existing fields
  specialtyIds   String[]     // Especialidades asignadas al usuario
  permissions    Json?         // Override de permisos (null = usar role.permissions)
  userType       String?       // Tipo de usuario (doctor, nurse, receptionist, subadmin)
  status         UserStatus   @default(ACTIVE)
  lastLoginAt    DateTime?    // Último login
}

enum UserStatus {
  ACTIVE
  INACTIVE
  PENDING_INVITATION
}
```

### Descripción de campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `specialtyIds` | String[] | IDs de especialidades asignadas. Vacío = tiene acceso a todas |
| `permissions` | Json | Override de permisos específicos del usuario. Si es null, usa `role.permissions` |
| `userType` | String | Tipo de usuario definido por tenant ( doctor, nurse, receptionist, subadmin ) |
| `status` | Enum | Estado del usuario: ACTIVE, INACTIVE, PENDING_INVITATION |
| `lastLoginAt` | DateTime? | Fecha del último login |

---

## 2. Modelo TeamInvitation

### Schema Prisma

```prisma
model TeamInvitation {
  id             String    @id @default(uuid())
  organizationId String
  email          String
    
  // Asignación
  userType       String    // Tipo de usuario asignado (doctor, nurse, etc.)
  specialtyIds  String[]  // Especialidades/áreas asignadas
  permissions   Json     // Override de permisos específicos
  
  // Referencia al rol base
  roleId         String
  
  // metadata
  invitedBy      String
  expiresAt      DateTime
  status         InvitationStatus @default(PENDING)
  token          String    @unique
  
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  role         Role          @relation(fields: [roleId], references: [id])

  @@index([organizationId])
  @@index([email])
  @@index([token])
  @@index([status])
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  EXPIRED
  REVOKED
}
```

---

## 3. Configuración de Tipos de Usuario

Los tipos de usuario se configuran en el objeto `settings` de la `Organization`.

### Estructura JSON

```json
{
  "userTypes": {
    "doctor": {
      "name": "Médico",
      "nameEn": "Doctor",
      "description": "Profesional médico con licencia",
      "descriptionEn": "Licensed medical professional",
      "icon": "medical_services",
      "dashboard": "/specialties",
      "permissions": [
        "appointments:read",
        "appointments:write",
        "patients:read",
        "patients:write",
        "clinical_history:read",
        "clinical_history:write"
      ],
      "canHaveSpecialties": true,
      "canViewOwnOnly": true
    },
    "nurse": {
      "name": "Enfermero",
      "nameEn": "Nurse",
      "description": "Personal de enfermería",
      "descriptionEn": "Nursing staff",
      "icon": "health_and_safety",
      "dashboard": "/nursing",
      "permissions": [
        "appointments:read",
        "patients:read",
        "clinical_history:read"
      ],
      "canHaveSpecialties": true,
      "canViewOwnOnly": false
    },
    "receptionist": {
      "name": "Recepcionista",
      "nameEn": "Receptionist",
      "description": "Personal de recepción",
      "descriptionEn": "Reception staff",
      "icon": "desk",
      "dashboard": "/reception",
      "permissions": [
        "appointments:read",
        "appointments:write",
        "patients:read",
        "patients:write"
      ],
      "canHaveSpecialties": true,
      "canViewOwnOnly": false
    },
    "subadmin": {
      "name": "Subadministrador",
      "nameEn": "Subadmin",
      "description": "Administrador de área",
      "descriptionEn": "Area administrator",
      "icon": "admin_panel_settings",
      "dashboard": "/admin",
      "permissions": [
        "inventory:read",
        "inventory:write",
        "users:read",
        "users:manage",
        "settings:read",
        "settings:manage"
      ],
      "canHaveSpecialties": true,
      "canViewOwnOnly": false
    }
  }
}
```

### Descripción de campos de tipo

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | String | Nombre localized del tipo |
| `nameEn` | String | Nombre en inglés |
| `description` | String | Descripción localized |
| `descriptionEn` | String | Descripción en inglés |
| `icon` | String | Icono Material Symbols |
| `dashboard` | String | Ruta de dashboard relativa |
| `permissions` | String[] | Permisos base del tipo |
| `canHaveSpecialties` | Boolean | Puede tener especialidades asignadas |
| `canViewOwnOnly` | Boolean | Solo ve sus propios datos |

---

## 4. Estructura de Permisos

### Tipos de permisos disponibles

```typescript
type PermissionKey = 
  // Citas
  | 'appointments:read'
  | 'appointments:write'
  | 'appointments:delete'
  // Pacientes
  | 'patients:read'
  | 'patients:write'
  | 'patients:delete'
  // Historial clínico
  | 'clinical_history:read'
  | 'clinical_history:write'
  // Inventario
  | 'inventory:read'
  | 'inventory:write'
  | 'inventory:delete'
  // Equipo
  | 'team:read'
  | 'team:manage'
  // Configuración
  | 'settings:read'
  | 'settings:manage'
  // Billing
  | 'billing:read'
  | 'billing:manage'
  // Analytics
  | 'analytics:view'
```

### Permisos granulares (JSON)

```typescript
type GranularPermissions = {
  appointments: {
    read: boolean
    write: boolean
    delete: boolean
    cancel: boolean
    reschedule: boolean
  }
  patients: {
    read: boolean
    write: boolean
    delete: boolean
    sensitive: boolean  // acceso a datos sensibles
  }
  clinicalHistory: {
    read: boolean
    write: boolean
    accessSensitive: boolean
  }
  inventory: {
    read: boolean
    write: boolean
    order: boolean
    receive: boolean
  }
  team: {
    read: boolean
    invite: boolean
    manage: boolean
    remove: boolean
  }
  settings: {
    read: boolean
    manage: boolean
  }
}
```

---

## 5. Migración de Base de Datos

### script SQL (para referencia)

```sql
-- Agregar campos a User
ALTER TABLE "User" 
ADD COLUMN "specialtyIds" TEXT[] DEFAULT '{}',
ADD COLUMN "permissions" JSONB,
ADD COLUMN "userType" TEXT,
ADD COLUMN "status" "UserStatus" DEFAULT 'ACTIVE',
ADD COLUMN "lastLoginAt" TIMESTAMP;

CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING_INVITATION');

-- Crear tabla TeamInvitation
CREATE TABLE "TeamInvitation" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organizationId" UUID NOT NULL REFERENCES "Organization"("id"),
  "email" TEXT NOT NULL,
  "userType" TEXT NOT NULL,
  "specialtyIds" TEXT[] DEFAULT '{}',
  "permissions" JSONB,
  "roleId" UUID REFERENCES "Role"("id"),
  "invitedBy" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "status" "InvitationStatus" DEFAULT 'PENDING',
  "token" TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX "TeamInvitation_org_idx" ON "TeamInvitation"("organizationId");
CREATE INDEX "TeamInvitation_email_idx" ON "TeamInvitation"("email");
CREATE INDEX "TeamInvitation_token_idx" ON "TeamInvitation"("token");
CREATE INDEX "TeamInvitation_status_idx" ON "TeamInvitation"("status");
```

---

## 6. Ubicación de Archivos

| Modelo | Archivo |
|--------|----------|
| User extendido | `apps/api/prisma/schema.prisma` |
| TeamInvitation | `apps/api/prisma/schema.prisma` |
| UserStatus enum | `apps/api/prisma/schema.prisma` |
| Configuración tipos | `Organization.settings` JSON |

---

## 📝 Notas de Implementación

1. **No modificar modelos existentes** - Los nuevos campos se agregan a User existente
2. **Usar JSON para flexibilidad** - `permissions` y configuración de tipos usan JSON para permitir cambios sin migraciones
3. **Tokens únicos** - Usar `crypto.randomBytes(32)` para tokens de invitación
4. **Expiración** - 7 días por defecto (configurable)

---

## ✅ Criterios de Aceptación

- [ ] Campos agregados a User en schema.prisma
- [ ] Modelo TeamInvitation creado
- [ ] Enum UserStatus creado
- [ ] Índices creados para queries eficientes
- [ ] Configuración de tipos documentada