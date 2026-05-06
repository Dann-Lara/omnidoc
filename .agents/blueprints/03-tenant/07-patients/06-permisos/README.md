# 07-Patients - Permisos y Blindaje (PHI)

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Módulo** | Permisos y Blindaje PHI |
| **Estado** | ⏳ Pendiente |
| **Dependencias** | 01-schema |

---

## 🎯 Propósito

Implementar el control de roles y permisos para pacientes (AC 4.3) y el blindaje de datos sensibles.

Criterios AC 4.1, 4.2, 4.3

---

## 📋 Control de Roles (AC 4.3)

Usar el sistema existente en `/areas/team/[userId]` con permisos granulares.

### Permisos para Pacientes

| Permiso | Recepcionista | Enfermería | Médico |
|--------|---------------|-------------|--------|
| `patients:read` | ✅ | ✅ | ✅ |
| `patients:write` | ✅ | ✅ | ✅ |
| `patients:delete` | ❌ | ❌ | ✅ |
| `notes:read` | ❌ | ✅ | ✅ |
| `notes:write` | ❌ | ❌ | ✅ |
| `notes:seal` | ❌ | ❌ | ✅ |
| `vitals:write` | ❌ | ✅ | ✅ |

### Cómo Integrar

En el frontend, obtener permisos del collaborador y verificar antes de renderizar:

```typescript
// lib/permissions.ts
export function hasPermission(permission: string): boolean {
  const perms = getStoredPermissions()
  return perms[permission] === true
}

export function getPermissions(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  const stored = localStorage.getItem('sb-permissions')
  return stored ? JSON.parse(stored) : {}
}
```

En las páginas:

```tsx
// pages/patients/page.tsx
const canWrite = hasPermission('patients:write')
const canRead = hasPermission('patients:read')

if (!canRead) {
  return <Error403 />
}

return (
  <>
    {canWrite && <button onClick={...}>{t('patients.directory.new')}</button>}
  </>
)
```

---

## 🔐 RLS (AC 4.1)

Aislamiento de Tenant: Los datos de pacientes del Tenant A jamás deben ser accesibles desde el Tenant B.

### Implementación en NestJS

```typescript
// patients.service.ts
async findAll(organizationId: string, query: ListPatientsQuery) {
  // RLS: всегда filtrar por organizationId
  const where = { organizationId }
  
  if (query.search) {
    where.OR = [
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
      { documentId: { contains: query.search, mode: 'insensitive' } },
    ]
  }
  
  return this.prisma.patient.findMany({ where })
}

async findOne(organizationId: string, id: string) {
  const patient = await this.prisma.patient.findUnique({
    where: { id },
  })
  
  // RLS: verificar organización
  if (!patient || patient.organizationId !== organizationId) {
    throw new NotFoundException('Patient not found')
  }
  
  return patient
}

// Auditoría de acceso
async logAccess(user: User, patientId: string, action: PatientAuditAction) {
  await this.prisma.patientAuditLog.create({
    data: {
      patientId,
      userId: user.id,
      organizationId: user.organizationId,
      action,
      ipAddress: user.ipAddress,
    },
  })
}
```

### Middleware de Verificación

```typescript
// filters/rls.filter.ts
@Injectable()
export class RlsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user
    const patientId = request.params.id

    // Verificar que el paciente pertenece a la organización del usuario
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { organizationId: true },
    })

    return patient?.organizationId === user.organizationId
  }
}
```

---

## 🔒 Encriptación (AC 4.2)

Los datos sensibles del historial (notas médicas) deben estar encriptados en reposo.

### Implementación

Usar AES-256 con clave del entorno:

```typescript
// lib/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')

export function encrypt(text: string): string {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, KEY, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const tag = cipher.getAuthTag()
  
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedText: string): string {
  const [ivHex, tagHex, encrypted] = encryptedText.split(':')
  
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  
  const decipher = createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(tag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
```

### Aplicar en Notas

```typescript
// patient-notes.service.ts
async create(user: User, patientId: string, dto: CreateNoteDto) {
  // Encriptar campos sensibles
  const encryptedDiagnosis = dto.diagnosis 
    ? encrypt(dto.diagnosis) 
    : null
  const encryptedPlan = dto.plan 
    ? encrypt(dto.plan) 
    : null

  return this.prisma.patientNote.create({
    data: {
      patientId,
      doctorId: user.id,
      organizationId: user.organizationId,
      ...dto,
      diagnosis: encryptedDiagnosis,
      plan: encryptedPlan,
    },
  })
}

async findOne(organizationId: string, noteId: string) {
  const note = await this.prisma.patientNote.findUnique({
    where: { id: noteId },
  })

  // Desencriptar solo si el usuario tiene permiso
  if (note && note.diagnosis) {
    note.diagnosis = decrypt(note.diagnosis)
  }
  if (note && note.plan) {
    note.plan = decrypt(note.plan)
  }

  return note
}
```

---

## 📝 Auditoría (AC 1.3, 2.3)

Registrar quién cambió qué y cuándo:

```typescript
// patient-audit.service.ts
async logUpdate(
  user: User,
  patientId: string,
  fieldChanged: string,
  oldValue: unknown,
  newValue: unknown,
) {
  return this.prisma.patientAuditLog.create({
    data: {
      patientId,
      userId: user.id,
      organizationId: user.organizationId,
      action: PatientAuditAction.UPDATED,
      fieldChanged,
      oldValue,
      newValue,
      ipAddress: user.ipAddress,
    },
  })
}

async logSeal(user: User, noteId: string, signature: string) {
  return this.prisma.patientAuditLog.create({
    data: {
      patientId: noteId, // usar noteId como patientId para nota sellada
      userId: user.id,
      organizationId: user.organizationId,
      action: PatientAuditAction.SEALED,
      newValue: { signature },
    },
  })
}
```

---

## ✅ Criterios de Aceptación (AC)

| AC | Descripción | Criterio |
|----|------------|----------|
| 4.1 | Aislamiento tenant | organizationId en todas las queries |
| 4.2 | Encriptación | AES-256 para diagnosis, plan |
| 4.3 | Control de roles | Permisos del team |
| 1.3 | Auditoría | PatientAuditLog en cada cambio |

---

## 🎨 Permisos UI (Team)

En la página de edición de miembro del equipo (`/areas/team/[userId]`):

```typescript
const PERMISSIONS = [
  { key: 'patients', name: t('patients.permissions.patients'), nameEn: 'Patients', read: true, write: true, delete: false },
  { key: 'notes', name: t('patients.permissions.notes'), nameEn: 'Medical Notes', read: true, write: true, delete: false },
  { key: 'vitals', name: t('patients.permissions.vitals'), nameEn: 'Vital Signs', read: false, write: true, delete: false },
]
```

---

## 🚀 Pasos de Ejecución

1. **Atualizar** permisos en team page
2. **Crear** helper `hasPermission` en frontend
3. **Implementar** RLS en todos los endpoints patient
4. **Crear** servicio de encriptación
5. **Aplicar** encriptación a diagnosis/plan
6. **Crear** auditoría en cada mutation
7. **Probar** aislamiento entre organizaciones
8. **Typecheck**

---

## 🔗 Dependencias

- Schema en `01-schema`
- Team existente (`/areas/team/[userId]`)
- Auth existente