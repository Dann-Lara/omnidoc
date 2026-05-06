# 06-Team/04-Flow - Flujos de Invitación y Login

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 03-tenant/06-team/04-flow |
| **Depende de** | 03-frontend.md |

---

## 🎯 Propósito

Documentar los flujos de invitación, signup y login con redirect personalizado según tipo de usuario.

---

## 1. Flujo Completo

### Diagrama General

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FLUJ O COMPLETO                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐         │
│  │  ADMIN  │ ───▶ │  API     │ ───▶ │  EMAIL   │         │
│  │  crea   │      │  crea   │      │  envía   │         │
│  │invitación│      │ token   │      │  links   │         │
│  └──────────┘      └──────────┘      └──────────┘         │
│                                         │                │
│                                         ▼                │
│                                  ┌──────────┐         │
│                                  │  USUARIO │         │
│                                  │recibe    │         │
│                                  │email     │         │
│                                  └──────────┘         │
│                                         │                │
│                                         ▼                │
│                              ┌─────────────────────────┐      │
│                              │  SETUP PAGE        │      │
│                              │  /setup/[token]   │      │
│                              │  +/password      │      │
│                              └─────────────────────────┘      │
│                                         │                │
│                                         ▼                │
│                              ┌─────────────────────────┐      │
│                              │SUPABASE AUTH         │      │
│                              │  + USER en DB       │      │
│                              └─────────────────────────┘      │
│                                         │                │
│                                         ▼                │
│                              ┌─────────────────────────┐      │
│                              │  LOGIN PAGE          │      │
│                              │  /login             │      │
│                              └─────────────────────────┘      │
│                                         │                │
│                                         ▼                │
│                              ┌─────────────────────────┐      │
│                              │  AUTH CONTROLLER     │      │
│                              │  calcula redirect   │      │
│                              └─────────────────────────┘      │
│                                         │                │
│                                         ▼                │
│                              ┌─────────────────────────┐      │
│                              │  DASHBOARD          │      │
│                              │  personalizado      │      │
│                              └─────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Flujo de Invitación

### 2.1 Admin crea invitación

```
Admin en /[slug]/areas/team/add
         │
         ├──▶ 1. Selecciona tipo (doctor, nurse, etc.)
         │
         ├──▶ 2. Ingresa email
         │
         ├──▶ 3. Asigna especialidades (opcional)
         │
         ├──▶ 4. Configura permisos (opcional)
         │
         └──▶ 5. Click "Enviar Invitación"
                          │
                          ▼
                 ┌─────────────────────┐
                 │ POST /team/invite  │
                 │ {                │
                 │   email,         │
                 │   userType,     │
                 │   specialtyIds,  │
                 │   permissions   │
                 │ }               │
                 └─────────────────────┘
                          │
                          ▼
                 ┌─────────────────────┐
                 │ TeamInvitation     │
                 │ - token           │
                 │ - expiresAt       │
                 │ - status=PENDING │
                 └─────────────────────┘
                          │
                          ▼
                 ┌─────────────────────┐
                 │ Resend Email       │
                 │ - to: email       │
                 │ - subject        │
                 │ - body + link   │
                 └─────────────────────┘
```

### 2.2 Email de invitación

**Asunto:** `Invitación para unirse a [Nombre de Organización]`

**Cuerpo:**
```
Hola,

Has sido invitado a unirte al equipo de [NombreOrg] como [Tipo de Usuario].

Para aceptar la invitación, haz click en el siguiente enlace:
[Set up my account]

Este enlace expirará en 7 días.

Si no esperabas esta invitación, por favor ignora este email.

Saludos,
El equipo de [NombreOrg]
```

### 2.3 Link de invitación

El link redirige a:
```
/setup/[token]

Ejemplo: /setup/abc123def456...
```

---

## 3. Flujo de Setup (Signup)

### 3.1 Página de Setup

```
GET /setup/:token
         │
         ▼
┌─────────────────────┐
│ Validar token       │
│ - ¿Existe?        │
│ - ¿PENDING?       │
│ - ¿No expirado?    │
└─────────────────────┘
         │
    ���─��──┴────┐
    │         │
    ▼         ▼
 Error    Return: { email, userType, organization }
    │         │
    │         ▼
    │    ┌─────────────────────┐
    │    │ SETUP PAGE        │
    │    │ - Email (readonly)│
    │    │ - First Name     │
    │    │ - Last Name     │
    │    │ - Password     │
    │    │ - Confirm      │
    │    └─────────────────────┘
    │              │
    │              ▼
    │     ┌─────────────────────┐
    │     │ POST /setup/:token │
    │     │ + password      │
    │     └─────────────────────┘
    │              │
    │              ▼
    │     ┌─────────────────────┐
    │     │ Create user in   │
    │     │ Supabase Auth  │
    │     └─────────────────────┘
    │              │
    │              ▼
    │     ┌─────────────────────┐
    │     │ Create User in DB  │
    │     │ + userType        │
    │     │ + specialtyIds   │
    │     │ + permissions   │
    │     │ + status=ACTIVE │
    │     └─────────────────────┘
    │              │
    │              ▼
    │     ┌─────────────────────┐
    │     │ Mark invitation   │
    │     │ as ACCEPTED       │
    │     └─────────────────────┘
    │              │
    │              ▼
    │     ┌─────────────────────┐
    │     │ Redirect to login   │
    │     └─────────────────────┘
```

### 3.2 Código de setup

El setup usa el endpoint existente de invitaciones con algunas extensiones:

```typescript
// POST /invitations/:token/complete (extend existing)
interface SetupBody {
  firstName: string
  lastName: string
  password: string
}

// El controller actual ya hace:
// 1. Valida token
// 2. Crea usuario en Supabase
// 3. Crea User en DB
// 4. Actualiza invitación a ACCEPTED

// Extension necesaria:
// - Leer userType, specialtyIds, permissions de TeamInvitation
// - Guardar en User creado
```

---

## 4. Flujo de Login

### 4.1 Login estándar

```
/login
         │
 POST /auth/login
 { email, password }
         │
         ▼
┌─────────────────────┐
│ Supabase Auth API   │
│ /auth/v1/token     │
└─────────────────────┘
         │
   ┌─────┴─────┐
   │           │
   ▼           ▼
 Success    Error
   │           │
   ▼           ▼
Get user   Return error
from DB     │
   │        │
   ▼        │
┌─────────────────────┐
│ Calcular redirect  │ ◄── EXTENDER ESTO
│ según userType   │
└─────────────────────┘
```

### 4.2 Cálculo de redirect

**Lógica actual** (`auth.controller.ts`):
```typescript
// Ya existe lógica para SUPERADMIN, OPERATOR, CLIENT
// EXTENDER para subordinados
```

**Nueva lógica a agregar:**

```typescript
async calculateDashboardRoute(user: User): Promise<string> {
  const orgSlug = user.organization?.slug
  
  // 1. Si es tenant admin (CLIENT con isTenantAdmin)
  if (user.isTenantAdmin) {
    return `/${orgSlug}/dashboard`
  }
  
  // 2. Si es subordinado con userType
  const userType = user.userType
  
  if (!userType) {
    // Subordinado sin tipo específico → dashboard genérico
    return `/${orgSlug}/dashboard`
  }
  
  // 3. Obtener configuración del tipo de usuario
  const orgSettings = user.organization?.settings as any
  const userTypes = orgSettings?.userTypes || {}
  const typeConfig = userTypes[userType]
  
  if (!typeConfig) {
    return `/${orgSlug}/dashboard`
  }
  
  // 4. Calcular redirect según tipo
  switch (userType) {
    case 'doctor':
      // Si tiene especialidades, ir a la primera
      if (user.specialtyIds?.length > 0) {
        return `/${orgSlug}/specialties/${user.specialtyIds[0]}`
      }
      return `/${orgSlug}/specialties`
    
    case 'nurse':
      return `/${orgSlug}/nursing`
    
    case 'receptionist':
      return `/${orgSlug}/reception`
    
    case 'subadmin':
      // Ir al área asignada (primera specialty)
      if (user.specialtyIds?.length > 0) {
        return `/${orgSlug}/admin/${user.specialtyIds[0]}`
      }
      return `/${orgSlug}/admin`
    
    default:
      return `/${orgSlug}/dashboard`
  }
}
```

### 4.3 Guardar lastLoginAt

Actualizar `lastLoginAt` cuando el usuario hace login:

```typescript
// En auth.controller.ts - después de login exitoso
await this.prisma.user.update({
  where: { id: user.id },
  data: { lastLoginAt: new Date() },
})
```

---

## 5. Redirects por Tipo

### 5.1 Tabla de Redirects

| Tipo | specialtyIds | Redirect |
|------|-------------|----------|
| `doctor` | `["7"]` | `/[slug]/specialties/7` |
| `doctor` | `["7", "1"]` | `/[slug]/specialties/7` (primera) |
| `doctor` | `[]` | `/[slug]/specialties` |
| `nurse` | cualquier | `/[slug]/nursing` |
| `receptionist` | cualquier | `/[slug]/reception` |
| `subadmin` | `["3"]` | `/[slug]/admin/3` |
| `subadmin` | `[]` | `/[slug]/admin` |
| (sin tipo) | cualquier | `/[slug]/dashboard` |

### 5.2 Dashboard personalizado según tipo

**Para médicos:**
- En `/[slug]/specialties/[specialtyId]`, filtrar:
  - Citas: solo del doctor actual
  - Pacientes: solo龌特殊 edad

**Para enfermeros:**
- En `/[slug]/nursing`:
  - Ver pacientes asignados
  - Ver citas del día

**Para recepcionistas:**
- En `/[slug]/reception`:
  - Gestión completa de citas

**Para subadmin:**
- En `/[slug]/admin/[area]`:
  - Solo el módulo asignado (inventario, etc.)

---

## 6. Permisos en Runtime

### 6.1 Guardar permisos en sesión

Después de login, guardar permisos en cookie o localStorage:

```typescript
// En auth response:
{
  user: { ... },
  permissions: effectivePermissions,  // merge de user.permissions ?? role.permissions
  organization: { ... },
  dashboard_route: "...",
}
```

### 6.2 Verificar permisos en frontend

```typescript
// usePermissions hook
function usePermissions() {
  const user = getStoredUser()
  
  function hasPermission(permission: string): boolean {
    const perms = getStoredPermissions()
    return perms?.includes(permission)
  }
  
  function hasAll(...permissions: string[]): boolean {
    const perms = getStoredPermissions()
    return permissions.every(p => perms?.includes(p))
  }
  
  return { hasPermission, hasAll }
}

// Uso en componentes
function AppointmentList() {
  const { hasPermission } = usePermissions()
  
  if (!hasPermission('appointments:read')) {
    return <NoAccess />
  }
  
  // ... render list
}
```

---

## 7. Casos Especiales

### 7.1 Invitación expirada

```
Link expirado (>7 days)
         │
         ▼
/setup/:token
         │
         ▼
"Esta invitación ha expirado"
         │
         ▼
"Contacta a tu administrador para reenviar la invitación"
```

### 7.2 Email ya usado

```
Mismo email otra invitación
         │
         ▼
 "¿Ya tienes una invitación pendiente?"
         │
         └── "Reenviar invitación"
```

### 7.3 Usuario ya existe

```
Email ya registrado
         │
         ▼
 Error en creación
         │
         ▼
 "Ya existe un usuario con este email"
```

---

## 8. Configuración de Tipo en Organización

### 8.1获取 tipos de usuario

El frontend obtiene los tipos de `/team/user-types`:

```typescript
// GET /team/user-types
// Return: { userTypes: { doctor: {...}, nurse: {...}, ... } }

// El tenant puede personalizar en Organization.settings
// Por defecto, usa los tipos hardcoded
```

### 8.2 Personalización (ejemplo)

```json
// En Organization.settings
{
  "userTypes": {
    "medical": {
      "name": "Doctor",
      "nameEn": "Medical Doctor",
      "dashboard": "/specialties",
      "permissions": ["appointments:*", "patients:*"]
    },
    "nursing": {
      "name": "Enfermera",
      "nameEn": "Nurse",
      "dashboard": "/nursing",
      "permissions": ["appointments:read", "patients:read"]
    }
  }
}
```

---

## 📝 Notas de Implementación

1. **Reutilizar endpoints** - Extender `/invitations/:token/complete` existente
2. **Guardar lastLoginAt** - Para tracking de actividad
3. **Redirect en login** - Modificar lógica existente en auth.controller
4. **Permisos en sesión** - Incluir en respuesta de login

---

## ✅ Criterios de Aceptación

- [ ] Flujo invitación → email completado
- [ ] Setup page funcionando
- [ ] Redirect por tipo implementado
- [ ] lastLoginAt actualizándose
- [ ] Permisos en frontend funcionando
- [ ] Casos especiales manejados