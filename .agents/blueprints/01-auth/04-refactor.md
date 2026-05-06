# 04-Refactor - Plan de Ejecución

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 01-auth/04-refactor |
| **Estado** | ✅ Completado |

---

## 🎯 Propósito

Detallar el orden específico de cambios para ejecutar el refactor de seguridad del módulo auth sin romper la funcionalidad existente.

---

## 📋 Refactor: Separación User y Organization

### Contexto

El login ahora retornan datos separados del usuario y la organización:

```typescript
// LoginResponse del API
{
  user: {
    id: string;           // User.id
    email: string;
    role: UserRole;
    org_id: string;     // organizationId del USER (FK)
    first_name: string;
    last_name: string;
    avatar: string;
  },
  organization: {
    org_id: string;     // Organization.id
    org_slug: string;
    org_name: string;
    specialties: string[] // specialtyIds
  } | null,
  dashboard_route: string
}
```

### Tipos en Frontend

```typescript
// types.ts
interface UserInfo {
  id: string;
  email: string;
  role: UserRole | null;
  org_id: string | null;  // Del USER
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
}

interface OrganizationInfo {
  org_id: string;
  org_slug: string;
  org_name: string;
  specialties: string[];
}
```

### Storage Keys

```typescript
const AUTH_STORAGE_KEYS = {
  USER: 'sb-user',          // UserInfo JSON
  ROLE: 'sb-role',
  EMAIL: 'sb-email',
  USER_ID: 'sb-user-id',
  ORG_ID: 'sb-org-id',      // organization.id
  ORG_SLUG: 'sb-org-slug',
  ORG_NAME: 'sb-org-name',
  SPECIALTIES: 'sb-specialties', // JSON array
} as const;
```

### Funciones de Lectura

```typescript
// session.ts
getStoredUser(): UserInfo | null
getStoredOrgId(): string | null
getStoredOrgSlug(): string | null
getStoredOrgName(): string | null
getStoredSpecialties(): string[]
```

### AuthContext

```typescript
interface AuthContextType {
  user: UserInfo | null;
  organization: OrganizationInfo | null;
  isLoading: boolean;
  updateUser: (updates: Partial<UserInfo>) => void;
  updateOrganization: (updates: Partial<OrganizationInfo>) => void;
  logout: () => void;
}
```

### Usuarios Subordinados

- Los usuarios subordinados (SUBORDINATE) ya tienen `organizationId` en la tabla User
- Login retorna ese `org_id` directamente en el user
- Frontend puede usar `org_id` parafetch de especialidades

---

## 📋 Checklist - Refactor User/Organization

### Backend (API)

- [x] LoginResponse con estructura separada user + organization
- [x] API retorna specialtyIds de la organización
- [x] org_id viene del User (no de Organization en user)

### Frontend (Web)

- [x] types.ts: UserInfo + OrganizationInfo separados
- [x] session.ts: funciones de lectura para org
- [x] AuthContext: expose organization
- [x] login/page.tsx: usa organization.org_slug para redirect

### Tenant Pages

- [x] [slug]/layout.tsx: usa getStoredOrgSlug()
- [x] [slug]/profile/specialties/page.tsx: usa org_id del storage
- [x] TenantNavbar: usa getStoredOrgSlug()

---

## 📋 Orden de Ejecución

### Fase 1: Preparación (Sin cambios funcionales)

1. **Instalar dependencias necesarias**
   ```bash
   cd apps/api
   pnpm add @nestjs/throttler class-validator class-transformer
   ```

2. **Crear estructura de DTOs**
   ```bash
   mkdir -p apps/api/src/auth/dto
   ```

---

### Fase 2: Backend (Cambios en API)

**Orden específico:**

1. **Crear DTOs** (archivos nuevos)
   - `login.dto.ts`
   - `signup.dto.ts`
   - `forgot-password.dto.ts`
   - `reset-password.dto.ts`

2. **Actualizar auth.controller.ts**
   - Importar DTOs
   - Agregar `@UseGuards(ThrottlerGuard)`
   - Agregar `@Throttle` decorators
   - Agregar `@Res()` para cookies
   - Modificar responses para setear cookies
   - Proteger/eliminar dev-login

3. **Actualizar app.module.ts**
   - Importar `ThrottlerModule`
   - Configurar limits

4. **Actualizar main.ts**
   - Configurar `ValidationPipe` con `whitelist: true`
   - Configurar CORS

5. **Testear backend**
   ```bash
   cd apps/api
   pnpm dev
   ```

---

### Fase 3: Frontend (Cambios en Web)

**Orden específico:**

1. **Actualizar session.ts**
   - Agregar función `getCookie()`
   - Actualizar funciones de lectura
   - Simplificar `saveAuthSession()`
   - Actualizar `clearAuthSession()`

2. **Actualizar login/page.tsx**
   - Quitar guardado de tokens
   - Mantener solo user data

3. **Actualizar signup/page.tsx**
   - Quitar guardado de tokens
   - Mantener solo user data

4. **Verificar middleware.ts**
   - Ya debería funcionar con cookies

5. **Testear flujo completo**
   - Login con credenciales nuevas
   - Verificar cookies en DevTools
   - Logout y login de nuevo

---

## 📝 Comandos de Verificación

### Verificar Cookies en Browser
```javascript
// Console
document.cookie  // No debería mostrar access_token (es HttpOnly)

// Application > Cookies
// debería mostrar:
// - sb-access-token
// - sb-refresh-token
// - sb-user
// - sb-user-id
// - sb-role
// - sb-email
```

### Verificar que localStorage NO tenga tokens
```javascript
// Console
localStorage.getItem('sb-access-token')  // null
localStorage.getItem('sb-refresh-token') // null
localStorage.getItem('sb-user')          // debería tener user data
```

---

## 🔴 Rollback Plan (Si algo falla)

1. **Si el backend falla:**
   - Revertir cambios en auth.controller.ts
   - Mantener DTOs pero no usarlos
   - Volver a localStorage temporalmente

2. **Si el frontend falla:**
   - Reviertir session.ts
   - Mantener login/signup originales

3. **Debugging steps:**
   - Verificar que el backend setea cookies (Response headers)
   - Verificar CORS permite cookies
   - Verificar que secure=false en desarrollo

---

## 📋 Checklist de Ejecución

### Backend

- [x] Instalar @nestjs/throttler
- [x] Crear login.dto.ts
- [x] Crear signup.dto.ts
- [x] Crear forgot-password.dto.ts
- [x] Crear reset-password.dto.ts
- [x] Actualizar auth.controller.ts
- [x] Configurar ThrottlerModule
- [x] Configurar ValidationPipe
- [x] Proteger dev-login
- [x] Testear endpoint login
- [x] Testear endpoint signup

### Frontend

- [x] Actualizar getCookie() en session.ts
- [x] Actualizar getStoredUser()
- [x] Actualizar getStoredRole()
- [x] Actualizar getStoredUserId()
- [x] Simplificar saveAuthSession()
- [x] Actualizar clearAuthSession()
- [x] Actualizar login/page.tsx
- [x] Actualizar signup/page.tsx
- [x] Testear flujo login completo
- [x] Testear flujo signup completo

### Middleware (Post-Refactor)

- [x] Verificar que middleware lee HttpOnly cookies correctamente
- [x] Verificar protección de rutas: /admin, /[slug]/dashboard
- [x] Actualizar regex para proteger /[slug]/dashboard/* (calendar, metrics, etc)
- [x] Proteger rutas /[slug]/profile
- [x] Testear logout limpia cookies correctamente
- [x] Verificar redirect a /login cuando no hay cookie
- [x] Testear logout

---

## ⚠️ Errores Comunes y Soluciones

### Error: "Cannot set cookie"
- **Causa**: CORS no permite credentials
- **Solución**: Verificar `credentials: true` en CORS config y frontend fetch

### Error: "HttpOnly cookie not set"
- **Causa**: secure=true en desarrollo
- **Solución**: Usar `secure: process.env.NODE_ENV === 'production'`

### Error: Rate limit too aggressive
- **Solución**: Ajustar valores en ThrottlerModule

### Error: Validation not working
- **Causa**: ValidationPipe no global
- **Solución**: Verificar `app.useGlobalPipes()` en main.ts

---

## ✅ Criterios de Aceptación Final

### Funcionalidad
- [x] Login funciona correctamente
- [x] Signup funciona correctamente
- [x] Logout funciona correctamente
- [x] Redirects funcionan (admin vs tenant)

### Seguridad
- [x] Tokens NO en localStorage
- [x] Tokens en HttpOnly cookies
- [x] Rate limiting activo
- [x] DTOs validan inputs

### UX
- [x] UI sin cambios visuales
- [x] Flujo de usuario igual
- [x] Errores claros para el usuario

---

## 🔗 Dependencias

- [01-overview.md](./01-overview.md) - Overview
- [02-backend.md](./02-backend.md) - Detalle backend
- [03-frontend.md](./03-frontend.md) - Detalle frontend

---

## 🎯 Después del Refactor

Una vez completado el refactor, actualizar el estado del blueprint:

```markdown
## Estado General
- [x] 01-overview.md ✅
- [x] 02-backend.md ✅
- [x] 03-frontend.md ✅
- [x] 04-refactor.md - Completar checklist
```

---

## 🔭 Siguiente Módulo

**02-admin** → Layout admin, sidebar, navbar