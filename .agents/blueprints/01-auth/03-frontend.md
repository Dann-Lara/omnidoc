# 03-Frontend - Páginas de Autenticación

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 01-auth/03-frontend |
| **Estado** | ✅ Completado (actualizado según auditoría 2026-05-05) |

---

## 🎯 Propósito

Documentar las páginas de autenticación en el frontend y su estado actual de implementación y i18n.

---

## 📁 Archivos Involucrados

```
apps/web/src/
├── lib/
│   └── auth/
│       ├── session.ts         # ✅ Leer de cookies implementado
│       ├── types.ts
│       └── index.ts
├── middleware.ts             # ✅ Lee de cookies
└── app/
    └── (auth)/
        ├── layout.tsx         # ✅ Mantener igual
        ├── login/
        │   └── page.tsx       # ✅ No guarda tokens en localStorage
        ├── signup/
        │   └── page.tsx       # ✅ No guarda tokens en localStorage
        ├── forgot-password/
        │   └── page.tsx       # ✅ Funcional
        ├── reset-password/
        │   └── page.tsx       # ✅ Funcional
        ├── invitation/
        │   └── [token]/
        │       └── page.tsx   # ✅ Funcional (invitation flow)
        └── confirm-email/
            └── [token]/
                └── page.tsx   # ✅ Funcional (email confirmation)
```

---

## 🔧 Estado de Implementación (Auditoría 2026-05-05)

### Páginas de Autenticación

| Ruta | Estado | i18n Status | Notas |
|------|--------|-------------|-------|
| `/(auth)/login` | ✅ FUNCTIONAL | ⚠️ Has ternarios | Guarda solo user metadata en localStorage |
| `/(auth)/signup` | ✅ FUNCTIONAL | ⚠️ Has ternarios | Guarda solo user metadata en localStorage |
| `/(auth)/forgot-password` | ✅ FUNCTIONAL | ✅ useI18n | Envía email de recuperación |
| `/(auth)/reset-password` | ✅ FUNCTIONAL | ✅ useI18n | Actualiza password |
| `/(auth)/invitation/[token]` | ✅ FUNCTIONAL | ⚠️ Has ternarios | Completa registro con invitación |
| `/(auth)/confirm-email/[token]` | ✅ FUNCTIONAL | ⚠️ Has ternarios | Confirma email vía token |

---

## 📋 Checklist de Implementación (Actualizado)

### Session.ts
- [x] Crear función `getCookie()` (no requerida - se mantiene metadata localStorage)
- [x] Actualizar `getStoredUser()` para usar cookies (se mantiene metadata localStorage)
- [x] Actualizar `getStoredRole()` para usar cookies (se mantiene metadata localStorage)
- [x] Actualizar `getStoredUserId()` para usar cookies (se mantiene metadata localStorage)
- [x] Simplificar `saveAuthSession()` (solo user data, tokens en cookies HttpOnly)
- [x] Actualizar `clearAuthSession()`

### Login Page
- [x] Quitar guardado de tokens en localStorage
- [x] Solo guardar user data en localStorage
- [x] Mantener redirect logic
- [x] Usa endpoint `/auth/login` (backend setea cookies HttpOnly)

### Signup Page
- [x] Quitar guardado de tokens en localStorage
- [x] Solo guardar user data en localStorage
- [x] Usa endpoint `/auth/signup` (backend setea cookies HttpOnly)

### Invitation Page
- [x] Completa registro con token de invitación
- [x] Usa endpoint `/invitations/complete`
- [x] Redirige según rol (admin, operator, tenant user)

### Confirm Email Page
- [x] Confirma email con token
- [x] Usa endpoint `/auth/confirm-email`

### Middleware
- [x] Verificar que lea cookies correctamente (implementado)
- [x] Verifica token en cookies HttpOnly

---

## ⚠️ Notas Importantes

1. **UI sin cambios**: Las páginas se ven igual que antes del refactor
2. **Flujo sin cambios**: El usuario no nota la diferencia (excepto más seguro)
3. **Cookies HttpOnly**: Tokens se setean en backend, frontend solo guarda metadata
4. **Debugging**: Verificar DevTools > Application > Cookies para tokens
5. **i18n Pendiente**: 4 páginas aún usan ternarios `lang === 'en'` en lugar de `t('key')`

---

## 🔧 Cambios Requeridos (Histórico - Completado)

### 1. Session.ts - Leer de Cookies (✅ Completado)

```typescript
// ANTES (localStorage)
export function getStoredUser(): UserInfo | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
  // ...
}

// DESPUÉS (cookies - implementado en middleware)
// El frontend ya no lee tokens de localStorage
// Solo lee metadata del usuario (no sensible)
```

### 2. Login Page - No Guardar Tokens (✅ Completado)

```typescript
// apps/web/src/app/(auth)/login/page.tsx

// IMPLEMENTADO - No guardar tokens en localStorage
const response = await fetch(`${API_URL}/auth/login`, { ... })
const data = await response.json()

if (data.access_token) {
  // No guardar tokens - el backend ya setea las cookies HttpOnly
  // Solo guardar datos del usuario (no sensibles)
  localStorage.setItem('sb-user', JSON.stringify(data.user))
  localStorage.setItem('sb-user-id', data.user.id)
  localStorage.setItem('sb-role', data.user.role || '')
  localStorage.setItem('sb-email', data.user.email)
  
  // Redirect
  router.push(data.dashboard_route || '/tenant')
}
```

### 3. Signup Page - Mismo Cambio (✅ Completado)

```typescript
// apps/web/src/app/(auth)/signup/page.tsx

// IMPLEMENTADO - no guardar tokens en localStorage
// El backend setea las cookies automáticamente
```

---

## ✅ Criterios de Aceptación

- [x] Tokens NO en localStorage
- [x] Tokens en HttpOnly cookies (via backend)
- [x] Login page funciona correctamente
- [x] Signup page funciona correctamente
- [x] Invitation flow funciona correctamente
- [x] Email confirmation funciona correctamente
- [x] Middleware lee tokens de cookies
- [x] Logout limpia correctamente
- [ ] i18n migration pendiente (4 páginas con ternarios)

---

## 📊 Resumen de Estado i18n (Auditoría 2026-05-05)

| Archivo | Estado i18n | Ternarios detectados |
|---------|-------------|---------------------|
| `login/page.tsx` | ⚠️ Has ternarios | Sí, `lang === 'en'` |
| `signup/page.tsx` | ⚠️ Has ternarios | Sí, `lang === 'en'` |
| `invitation/[token]/page.tsx` | ⚠️ Has ternarios | Sí, `lang === 'en'` |
| `confirm-email/[token]/page.tsx` | ⚠️ Has ternarios | Sí, `lang === 'en'` |
| `forgot-password/page.tsx` | ✅ useI18n | No |
| `reset-password/page.tsx` | ✅ useI18n | No |

**Acción requerida**: Migrar 4 páginas restantes a `useI18n` con `t('key')`.

---

## 🔗 Dependencias

- [02-backend.md](./02-backend.md) - Backend debe estar actualizado primero ✅
- [06-security.md](../00-global/06-security.md) - Reglas de seguridad ✅
- [Skill: next-best-practices](../skills/next-best-practices/SKILL.md)
- [Skill: i18n-migration](../skills/i18n-migration/SKILL.md) - Para migrar ternarios pendientes

---

## 🔭 Siguiente Step

[04-refactor.md](./04-refactor.md) → Plan de ejecución del refactor (COMPLETADO)

**Pendiente**: Migración i18n de 4 páginas con ternarios `lang === 'en'`.
