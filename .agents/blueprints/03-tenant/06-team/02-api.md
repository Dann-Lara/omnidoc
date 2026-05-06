# 06-Team/02-API - Endpoints del Equipo

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 03-tenant/06-team/02-api |
| **Depende de** | 01-model.md |
| **Estado** | ✅ Completado |

---

## 🎯 Propósito

Documentar los endpoints REST para la gestión del equipo subordinado.

---

## ✅ Implementado

**Archivos creados:**
- `apps/api/src/team/team.module.ts`
- `apps/api/src/team/team.controller.ts`
- `apps/api/src/team/team.service.ts`
- `apps/api/src/team/team.dto.ts`
- `apps/api/src/team/index.ts`

**Registrado en:**
- `apps/api/src/app.module.ts` (TeamModule importado)

---

## 1. Estructura del Módulo

### Ruta del módulo

```
apps/api/src/team/
├── team.module.ts
├── team.controller.ts
├── team.service.ts
├── team.dto.ts
└── team-email.service.ts  (opcional, integrado en team.service)
```

### Declaración en app.module.ts

```typescript
import { TeamModule } from './team/team.module';

@Module({
  imports: [
    // ...existing imports
    TeamModule,
  ],
})
export class AppModule {}
```

---

## 2. Endpoints REST

### 2.1 GET /team - Listar equipo

**Descripción:** Lista todos los subordinados del tenant.

**Autenticación:** Requiere `team:read` o rol de admin.

**Query params:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `status` | string | Filtrar por status (ACTIVE, INACTIVE, PENDING_INVITATION) |
| `userType` | string | Filtrar por tipo de usuario |
| `specialtyId` | string | Filtrar por especialidad |
| `search` | string | Buscar por nombre/email |
| `page` | number | Página (default: 1) |
| `limit` | number | Items por página (default: 20) |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@clinic.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "userType": "doctor",
      "specialtyIds": ["7", "1"],
      "status": "ACTIVE",
      "lastLoginAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "role": {
        "id": "uuid",
        "name": "Doctor"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

### 2.2 GET /team/:id - Ver miembro

**Descripción:** Obtiene los detalles de un miembro del equipo.

**Autenticación:** Requiere `team:read`.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@clinic.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "userType": "doctor",
  "specialtyIds": ["7", "1"],
  "specialties": [
    { "id": "7", "nameEn": "Cardiology", "nameEs": "Cardiología" }
  ],
  "status": "ACTIVE",
  "permissions": {
    "appointments": { "read": true, "write": true },
    "patients": { "read": true, "write": true }
  },
  "lastLoginAt": "2024-01-15T10:30:00Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "role": {
    "id": "uuid",
    "name": "Doctor"
  }
}
```

### 2.3 PUT /team/:id - Actualizar miembro

**Descripción:** Actualiza un miembro del equipo (solo admin puede editar).

**Autenticación:** Requiere `team:manage`.

**Body:**
```json
{
  "specialtyIds": ["7", "1", "3"],
  "permissions": {
    "appointments": { "read": true, "write": true, "delete": false },
    "inventory": { "read": true, "write": false }
  },
  "status": "ACTIVE"
}
```

**Response:** Retorna el miembro actualizado.

### 2.4 DELETE /team/:id - Desactivar miembro

**Descripción:** Desactiva un miembro (soft delete).

**Autenticación:** Requiere `team:manage`.

**Body:** (vacío)

**Response:**
```json
{
  "message": "Team member deactivated",
  "id": "uuid"
}
```

### 2.5 POST /team/invite - Crear invitación

**Descripción:** Crea una invitación y envía email al nuevo miembro.

**Autenticación:** Requiere `team:manage`.

**Body:**
```json
{
  "email": "doctor@clinic.com",
  "userType": "doctor",
  "specialtyIds": ["7"],
  "permissions": {
    "appointments": { "read": true, "write": true },
    "clinicalHistory": { "read": true, "write": false }
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "doctor@clinic.com",
  "userType": "doctor",
  "specialtyIds": ["7"],
  "status": "PENDING",
  "token": "abc123...",
  "expiresAt": "2024-01-22T00:00:00Z",
  "createdAt": "2024-01-15T00:00:00Z"
}
```

### 2.6 POST /team/invite/resend - Reenviar invitación

**Descripción:** Reenvía una invitación existente.

**Autenticación:** Requiere `team:manage`.

**Body:**
```json
{
  "invitationId": "uuid"
}
```

**Response:** Retorna la invitación actualizada con nuevo token y expiresAt.

### 2.7 DELETE /team/invite/:id - Revocar invitación

**Descripción:** Cancela una invitación pendiente.

**Autenticación:** Requiere `team:manage`.

**Response:**
```json
{
  "message": "Invitation revoked",
  "id": "uuid"
}
```

### 2.8 GET /team/user-types - Obtener tipos de usuario

**Descripción:** Lista los tipos de usuario configurados para el tenant.

**Autenticación:** Requiere `team:read`.

**Response:**
```json
{
  "userTypes": {
    "doctor": {
      "name": "Médico",
      "nameEn": "Doctor",
      "description": "Profesional médico",
      "descriptionEn": "Licensed medical professional",
      "icon": "medical_services",
      "dashboard": "/specialties",
      "permissions": ["appointments:read", "appointments:write", "patients:read"],
      "canHaveSpecialties": true,
      "canViewOwnOnly": true
    },
    "nurse": { ... }
  }
}
```

---

## 3. DTOs y Validación

### 3.1 CreateInvitationDto

```typescript
import { z } from 'zod'

export const CreateInvitationSchema = z.object({
  email: z.string().email(),
  userType: z.string().min(1),
  specialtyIds: z.array(z.string()).optional(),
  permissions: z.record(z.unknown()).optional(),
})
```

### 3.2 UpdateMemberDto

```typescript
export const UpdateMemberSchema = z.object({
  specialtyIds: z.array(z.string()).optional(),
  permissions: z.record(z.unknown()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
})
```

---

## 4. Permisos y Guards

### 4.1 TeamPermissionsGuard

```typescript
@Injectable()
export class TeamPermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>(
      'permission',
      context.getHandler(),
    )
    
    const request = context.switchToHttp().getRequest()
    const user = request.user
    
    if (!user) return false
    
    // Get user permissions (from user.permissions or role.permissions)
    const userPermissions = await this.getUserPermissions(user.id)
    
    return userPermissions.includes(requiredPermission)
  }
  
  private async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    })
    
    if (user?.permissions) {
      // Flatten granular permissions to simple array
      return this.flattenPermissions(user.permissions)
    }
    
    return user?.role?.permissions || []
  }
}
```

### 4.2 Decorador de permisos

```typescript
export const RequirePermission = (permission: string) => 
  SetMetadata('permission', permission)
```

### Uso en controller

```typescript
@Controller('team')
@UseGuards(AuthGuard, TeamPermissionsGuard)
export class TeamController {
  @Get()
  @RequirePermission('team:read')
  async getTeam() { ... }
  
  @Post('invite')
  @RequirePermission('team:manage')
  async createInvitation(@Body() body: CreateInvitationDto) { ... }
}
```

---

## 5. Filtros por Especialidad

### 5.1 En appointments

Cuando un usuario tiene `specialtyIds`, filtrar citas:

```typescript
async getAppointments(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  })
  
  const where: Prisma.AppointmentWhereInput = {
    doctorId: userId,
  }
  
  // Si tiene specialties asignadas, filtrar por ellas
  if (user.specialtyIds && user.specialtyIds.length > 0) {
    where.specialtyId = { in: user.specialtyIds }
  }
  // Si specialtyIds vacío = tiene acceso a todas
  
  return this.prisma.appointment.findMany({ where })
}
```

### 5.2 En patients

```typescript
const where: Prisma.PatientWhereInput = {
  organizationId: user.organizationId,
}

// Si tiene restrictOwnData, filtrar por specialty
if (user.canViewOwnOnly) {
  where.appointments = {
    some: {
      specialtyId: { in: user.specialtyIds }
    }
  }
}
```

---

## 6. Casos de Error

| Código | Mensaje | Causa |
|--------|--------|-------|
| 400 | Email already has pending invitation | Ya existe invitación pendiente |
| 400 | Email already in team | Usuario ya existe |
| 404 | Team member not found | ID no encontrado |
| 403 | No permission | Sin permisos |
| 400 | Invalid user type | Tipo no existe en config |
| 400 | Specialty not assigned to org | Specialty no pertenece al tenant |

---

## 📝 Notas de Implementación

1. **Usar guards existentes** - Extender el TeamPermissionsGuard basado en AuthGuard
2. **Respetar specialtyIds** - Always filtrar datos por especialidades asignadas
3. **Permisos override** - Si `user.permissions` existe, usar eso; si no, usar `role.permissions`
4. **Soft delete** - No eliminar usuarios, marcar como INACTIVE

---

## ✅ Criterios de Aceptación

- [x] Endpoints CRUD de team funcionando
- [x] Endpoints de invitación funcionando
- [x] DTOs con Zod validados
- [ ] Guards de permisos aplicados (pendiente - usar middleware existente)
- [x] Filtros por specialtyIds funcionando
- [x] Casos de error manejados