# 06-Team/03-Frontend - Páginas del Equipo

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 03-tenant/06-team/03-frontend |
| **Depende de** | 02-api.md |

---

## 🎯 Propósito

Documentar las páginas y componentes del frontend para la gestión del equipo.

---

## 1. Estructura de Rutas

### Ruta del módulo

```
apps/web/src/app/[slug]/
├── areas/
│   └── team/
│       ├── page.tsx           # Listado de equipo
│       ├── add/
│       │   └── page.tsx     # Crear nuevo miembro
│       └── [userId]/
│           └── page.tsx     # Ver/editar miembro
```

### Navegación (TenantSidebar)

Agregar en `TenantSidebar.tsx` (dentro de `areasItems`):

```typescript
const areasItems = [
  { href: `${basePath}/areas/specialties`, icon: Folder, labelKey: 'tenant.nav.specialties' },
  { href: `${basePath}/areas/team`, icon: Users, labelKey: 'tenant.nav.team' },  // NUEVO
]
```

---

## 2. Página: /areas/team - Listado de Equipo

### Ubicación
`apps/web/src/app/[slug]/areas/team/page.tsx`

### Funcionalidades
- Listar todos los miembros del equipo
- Filtrar por tipo de usuario, status, especialidad
- Buscar por nombre/email
- Acciones: Ver, Editar, Desactivar
- Botón "Agregar miembro" → `/areas/team/add`

### UI Sketch

```
┌─────────────────────────────────────────────────────────┐
│ EQUIPO                                          [+ Nuevo Miembro]
├───────────────────────────────────────────────────────── │
│ [Buscar...] [Tipo ▼] [Status ▼] [Especialidad ▼]       │
├───────────────────────────────────────────────────────── │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 🔵 Dr. Juan Pérez       Médico    Activo    📧   │   │
│ │    Cardiología           Last login: 2h ago          │   │
│ └─────────────────────────────────────────────────┘   │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 🟢 María Garcia       Recepcionista Activo    📧   │   │
│ │    Recepción          Last login: 1d ago          │   │
│ └─────────────────────────────────────────────────┘   │
│ ┌─────────────────────────────────────────────────┐   │
│ │ ⚪ Ana López          Enfermera   Inactivo 📧    │   │
│ │    Pediatrics        Last login: 5d ago         │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Componentes reutilizables

- `TeamMemberCard` - Card de miembro
- `TeamFilters` - Filtros
- `TeamStats` - Stats rápidos

---

## 3. Página: /areas/team/add - Crear Miembro

### Ubicación
`apps/web/src/app/[slug]/areas/team/add/page.tsx`

### Pasos del formulario

#### Step 1: Tipo de usuario
```
Selecciona el tipo de usuario:
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│  👨‍⚕️   │  │  👩‍⚕️   │  │  👨‍💼   │  │  ⚙️    │
│ Médico  │  │Enfermera│  │Recepcio.│  │Subadmin │
│         │  │        │  │        │  │        │
└─────────┘  └─────────┘  └─────────┘  └─────────┘
```

#### Step 2: Email e información
```
Email: [__________________]
Nombre: [__________________]
Apellido: [__________________]
```

#### Step 3: Especialidades (si aplica)
```
Especialidades asignadas:
☐ Cardiología
☐ Pediatrics  
☐ Dermatology
(Checkbox multi-select)
```

#### Step 4: Permisos (opcional)
```
Permisos específicos:
☑ Citas - Leer
☑ Citas - Escribir
☐ Citas - Eliminar
☑ Pacientes - Leer
☑ Pacientes - Escribir

[Cancelar] [Enviar Invitación]
```

### UI States

- Loading mientras carga tipos de usuario
- Validación de email
- Confirmación de envío

---

## 4. Página: /areas/team/[userId] - Editar Miembro

### Ubicación
`apps/web/src/app/[slug]/areas/team/[userId]/page.tsx`

### Funcionalidades
- Ver información del miembro
- Editar especialidades
- Editar permisos
- Cambiar status (Activar/Desactivar)
- Ver historial de Invitaciones

### UI Sketch

```
┌─────────────────────────────────────────────────────────┐
│ ← Volver al equipo                                    │
├───────────────────────────────────────────────────────── │
│PERFIL                                            [Editar] │
│ ┌───────────────┐                                    │
│ │    Foto     │ Juan Pérez                       │
│ │   Avatar   │ juan@clinic.com                 │
│ └───────────────┘ Dr. Juanito                      │
├───────────────────────────────────────────────────────── │
│                                                   │
│ Tipo: Médico                                       │
│ Especialidades: Cardiología, Pediatrics             │
│ Estado: Activo                                    │
│ Último login: 2 horas atrás                        │
│                                                   │
├───────────────────────────────────────────────────────── │
│ PERMISOS                                         │
│ ┌──────────────────────────────────────────────┐   │
│ │ Citas           │ ✓ Leer ✓ Escribir ☐ Elim  │   │
│ │ Pacientes      │ ✓ Leer ✓ Escribir          │   │
│ │ Historial     │ ✓ Leer ☐ Escribir           │   │
│ └──────────────────────────────────────────────┘   │
│                                                   │
├────────��──────────────────────────────────────────────── │
│ [Desactivar] [Eliminar]        [Guardar Cambios]        │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Tipos de TypeScript

### 5.1 TeamMember

```typescript
interface TeamMember {
  id: string
  email: string
  firstName: string
  lastName: string
  userType: string
  specialtyIds: string[]
  specialtyNames?: { id: string; nameEn: string; nameEs?: string }[]
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_INVITATION'
  permissions?: UserPermissions
  lastLoginAt?: string
  createdAt: string
  role: {
    id: string
    name: string
  }
}
```

### 5.2 UserType

```typescript
interface UserType {
  type: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  icon: string
  dashboard: string
  permissions: string[]
  canHaveSpecialties: boolean
  canViewOwnOnly: boolean
}
```

### 5.3 TeamInvitation

```typescript
interface TeamInvitation {
  id: string
  email: string
  userType: string
  specialtyIds: string[]
  permissions?: UserPermissions
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'
  token: string
  expiresAt: string
  createdAt: string
}
```

---

## 6. Hooks Personalizados

### 6.1 useTeam

```typescript
function useTeam(slug: string) {
  const { data, error, loading, refetch } = useFetch(`/team`)
  
  const members = data?.data || []
  const meta = data?.meta
  
  return { members, meta, error, loading, refetch }
}
```

### 6.2 useTeamInvite

```typescript
function useTeamInvite() {
  async function createInvitation(data: CreateInvitationDto) {
    return fetch('/team/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
  
  async function resendInvitation(invitationId: string) {
    return fetch('/team/invite/resend', {
      method: 'POST',
      body: JSON.stringify({ invitationId }),
    })
  }
  
  async function revokeInvitation(invitationId: string) {
    return fetch(`/team/invite/${invitationId}`, {
      method: 'DELETE',
    })
  }
  
  return { createInvitation, resendInvitation, revokeInvitation }
}
```

### 6.3 useUserTypes

```typescript
function useUserTypes(slug: string) {
  const { data, error, loading } = useFetch(`/team/user-types`)
  
  return data?.userTypes || {}
}
```

---

## 7. Componentes UI

### 7.1 TeamMemberCard

```typescript
interface TeamMemberCardProps {
  member: TeamMember
  onClick?: () => void
  onEdit?: () => void
  onDeactivate?: () => void
}

export function TeamMemberCard({ member, onClick, onEdit, onDeactivate }: TeamMemberCardProps) {
  const { lang, t } = useI18n()
  
  const statusColor = {
    ACTIVE: 'bg-emerald-500',
    INACTIVE: 'bg-slate-400',
    PENDING_INVITATION: 'bg-amber-500',
  }
  
  return (
    <motion.div onClick={onClick} className="...">
      <div className="flex items-center gap-4">
        <Avatar name={`${member.firstName} ${member.lastName}`} />
        <div className="flex-1">
          <h3 className="font-bold">{member.firstName} {member.lastName}</h3>
          <p className="text-sm text-on-surface-variant">
            {getUserTypeName(member.userType, lang)}
          </p>
        </div>
        <div className={statusColor[member.status]} />
      </div>
    </motion.div>
  )
}
```

### 7.2 UserTypeSelector

```typescript
interface UserTypeSelectorProps {
  types: UserType[]
  selected: string
  onChange: (type: string) => void
}

export function UserTypeSelector({ types, selected, onChange }: UserTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {types.map((type) => (
        <button
          key={type.type}
          onClick={() => onChange(type.type)}
          className={selected === type.type 
            ? 'border-primary border-2' 
            : 'border-outline-variant'
          }
        >
          <span className="material-symbols-outlined">{type.icon}</span>
          <span>{type.name}</span>
        </button>
      ))}
    </div>
  )
}
```

### 7.3 Specialty Multi-Select

```typescript
interface SpecialtySelectProps {
  specialties: Specialty[]
  selected: string[]
  onChange: (ids: string[]) => void
}

export function SpecialtySelect({ specialties, selected, onChange }: SpecialtySelectProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id))
    } else {
      onChange([...selected, id])
    }
  }
  
  return (
    <div className="space-y-2">
      {specialties.map((spec) => (
        <label key={spec.id} className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selected.includes(spec.id)}
            onChange={() => toggle(spec.id)}
          />
          <span>{spec.nameEn}</span>
        </label>
      ))}
    </div>
  )
}
```

---

## 8. API Integration

### 8.1 Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/team` | Listar equipo |
| GET | `/team/:id` | Ver miembro |
| PUT | `/team/:id` | Actualizar |
| DELETE | `/team/:id` | Desactivar |
| POST | `/team/invite` | Crear invitación |
| POST | `/team/invite/resend` | Reenviar |
| GET | `/team/user-types` | Tipos de usuario |

### 8.2 Manejo de Errores

```typescript
const handleError = (error: Error) => {
  if (error.status === 400) {
    // Email already exists
    return t('team.errors.emailExists')
  }
  if (error.status === 403) {
    // No permission
    return t('team.errors.noPermission')
  }
  return t('team.errors.generic')
}
```

---

## 📝 Notas de Implementación

1. **Usar componentes existentes** - Reutilizar Avatar, Button, Card del design system
2. **Skeleton loading** - Mostrar skeletons mientras carga datos
3. **Optimistic updates** - Actualizar UI óptimamente al crear/invitar
4. **Internationalization** - Todos los textos con useI18n()

---

## ✅ Criterios de Aceptación

- [ ] Página /areas/team implementada
- [ ] Página /areas/team/add implementada
- [ ] Página /areas/team/[userId] implementada
- [ ] Navegación actualizada en sidebar
- [ ] Hooks personalizados funcionando
- [ ] Estados de loading/error manejados