# 01-Auth - Módulo de Autenticación

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Módulo** | Auth |
| **Estado** | ✅ Funcional (auditado 2026-05-05) |
| **Última actualización** | 2026-05-05 |

---

## 🎯 Propósito

Documentar el sistema de autenticación completo (frontend + backend), incluyendo login, signup, confirmación de email, recovery de password y logout.

---

## 📁 Arquitectura Actual

```
apps/
├── api/
│   └── src/
│       └── auth/
│           ├── auth.controller.ts    # 6 endpoints + helpers
│           ├── auth.service.ts       # Lógica secundaria
│           ├── auth.module.ts        # NestJS module
│           ├── types/
│           │   └── user.types.ts     # UserRole enum
│           ├── dto/
│           │   ├── login.dto.ts
│           │   ├── signup.dto.ts
│           │   ├── forgot-password.dto.ts
│           │   └── reset-password.dto.ts
│           └── supabase-auth.guard.ts
│
└── web/
    └── src/
        ├── lib/
        │   └── auth/
        │       ├── session.ts         # Funciones auth
        │       ├── types.ts           # Tipos
        │       └── index.ts
        └── app/
            └── (auth)/
                ├── layout.tsx         # Layout auth (sin sidebar)
                ├── login/page.tsx     # Login page
                ├── signup/page.tsx    # Signup page
                ├── forgot-password/   # Password recovery
                ├── reset-password/    # Password reset
                └── confirm-email/     # Email confirmation
```

---

## 🔌 API Endpoints (6 endpoints reales)

| Método | Endpoint | Descripción | Throttle |
|--------|----------|-------------|----------|
| POST | `/auth/login` | Login con email/password (cookies HttpOnly) | 5/min |
| POST | `/auth/signup` | Crear usuario + organización (OWNER, plan Free) | 3/min |
| PUT | `/auth/confirm-email/:token` | Confirmar email con token de invitación | - |
| POST | `/auth/dev-login` | Login dev → sesión superadmin (solo non-prod) | 1/min |
| POST | `/auth/forgot-password` | Solicitar reset de password (envía email via Supabase) | - |
| POST | `/auth/reset-password` | Resetear password con access_token | - |
| POST | `/auth/logout` | Logout: limpia Supabase session + cookies | - |

---

## 🔐 Flujo de Autenticación

### Login Flow vigente

```
[Frontend]                    [API]                         [Supabase]
    │                            │                         │
    ├── POST /auth/login ──────► │                         │
    │   {email, password}         │                         │
    │                            ├── POST gotrue ─────────► │
    │                            │   /token?grant_type=    │
    │                            │   password              │
    │                            │                    ◄── │
    │                            │   {access_token,       │
    │                            │    refresh_token}      │
    │                            │                    ◄── │
    ◄── {user, dashboard_route} ─│ (tokens en cookies)     │
    │                            │                         │
    ├── Save metadata (user/org) │                         │
    │   en localStorage          │                         │
    │                            │                         │
    └── redirect to dashboard    │                         │
```

### Cookies Seteadas en Login

| Cookie | HttpOnly | Propósito |
|--------|----------|-----------|
| `sb-access-token` | ✅ | Token de acceso (expira según JWT) |
| `sb-refresh-token` | ✅ | Refresh token (30 días) |
| `sb-org-slug` | ❌ | Navegación frontend (slug de org) |
| `sb-org-name` | ❌ | Display name de org |
| `sb-user-role` | ❌ | Rol del user para middleware |

### Signup Flow

1. Crea user en Supabase Auth
2. Crea Organization en Prisma (plan Free, status TRIALING)
3. Crea Role "owner" con permisos completos
4. Crea User en Prisma (userType: OWNER)
5. Genera token de confirmación ( Invitation )
6. Envía welcome email con link de confirmación

### Confirm Email Flow

1. Valida token contra tabla `Invitation`
2. Verifica expiración (7 días)
3. Confirma email en Supabase (admin API)
4. Marca invitación como ACCEPTED

---

## 📋 Blueprint Index

| # | Archivo | Descripción | Estado |
|---|---------|-------------|--------|
| 01 | [README.md](./README.md) | Overview, arquitectura, flujos | ✅ |
| 02 | [02-backend.md](./02-backend.md) | API endpoints, DTOs, rate limiting, cookies | ✅ |
| 03 | [03-frontend.md](./03-frontend.md) | Pages auth, session, cookies | ✅ |
| 04 | [04-refactor.md](./04-refactor.md) | Plan de ejecución detallado | ✅ |

---

## 🔒 Reglas de Seguridad Aplicadas (06-security)

### Variables de Entorno
- ✅ NO hardcodear keys
- ✅ Usar process.env
- ✅ Validar presencia al iniciar

### Validación de Inputs
- ✅ DTOs con class-validator (LoginDto, SignupDto, ForgotPasswordDto, ResetPasswordDto)
- ✅ Sanitizar datos

### Auth Security
- ✅ Tokens en HttpOnly cookies
- ✅ Rate limiting (ThrottlerGuard)
- ✅ CSRF protection (SameSite=Strict)
- ✅ Dev login bloqueado en producción

---

## 📝 Estado de Archivos

### Backend - Estado actual

| Archivo | Estado |
|---------|--------|
| `auth.controller.ts` | ✅ 7 endpoints operativos (login, signup, confirm, dev, forgot, reset, logout) |
| `auth.service.ts` | Uso secundario (flujo principal en controller) |
| `supabase-auth.guard.ts` | ✅ Guard para rutas protegidas |
| DTOs | ✅ Tipados con class-validator |

### Frontend - Estado actual

| Archivo | Estado |
|---------|--------|
| `session.ts` | ✅ Guarda metadata local; tokens en cookies HttpOnly |
| `login/page.tsx` | ✅ Usa cookies del backend + metadata local |
| `signup/page.tsx` | ✅ Usa cookies del backend + metadata local |
| `forgot-password/` | ✅ Conectado a `/auth/forgot-password` |
| `reset-password/` | ✅ Conectado a `/auth/reset-password` |
| `confirm-email/` | ✅ Conectado a `/auth/confirm-email/:token` |
| `middleware.ts` | ✅ Lee cookies para acceso y redirect |

---

## 🔗 Dependencias

```
00-GLOBAL ✅
    │
    └── 01-AUTH (este blueprint)
          ├── security-best-practices skill
          ├── tailwind-design-system skill
          ├── next-best-practices skill
          └── nestjs-best-practices skill
```

---

## 📝 Notas Importantes

- **Mantener flujos visuales**: La UI debe mantener el mismo look & feel
- **Mantener rutas**: `/login`, `/signup`, `/forgot-password`, `/reset-password`
- **Mantener funcionalidad**: Mismo comportamiento, solo más seguro
- **JWT expiry**: Configurado en `GOTRUE_JWT_EXP: 86400` (24 horas)
- **Dev login**: `POST /auth/dev-login` → `superadmin@omnidoc.dev` (solo non-prod)
- **Role resolution**: El rol se determina por DB (role/userType), no por Supabase metadata

---

## 🔭 Siguiente Step

**Guards por endpoint**: Endpoints admin deben tener SuperAdminGuard explícito
**Token refresh**: Implementar refresh automático de access_token antes de expirar
