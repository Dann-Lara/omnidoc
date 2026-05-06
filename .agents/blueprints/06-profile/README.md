# 06-Profile - Módulo de Perfil de Usuario

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 06-profile |
| **Estado** | ✅ Funcional (auditado 2026-05-05) |
| **Última actualización** | 2026-05-05 |

---

## 🎯 Propósito

Documentar el sistema de edición de perfiles de usuario para:
- **SAAS**: Superadmin y Operators pueden editar su perfil
- **Tenant**: Clientes pueden editar su perfil y datos de organización
- Incluye signup actualizado con tipo de organización (INDIVIDUAL/CLINIC)
- Página de auditorías (mock)

---

## 📁 Arquitectura Actual (código)

```
apps/
├── api/
│   └── src/
│       ├── profile/
│       │   ├── profile.controller.ts   # 5 endpoints
│       │   ├── profile.service.ts      # Lógica de negocio
│       │   ├── profile.dto.ts          # DTOs tipados
│       │   ├── profile.module.ts       # NestJS module
│       │   └── index.ts
│       └── auth/
│           └── auth.controller.ts      # Auth endpoints
│
└── web/
    └── src/
        └── app/
            ├── admin/
            │   ├── profile/
            │   │   └── page.tsx        # Admin profile (FUNCTIONAL)
            │   └── audits/
            │       └── page.tsx        # Admin audits (MOCK)
            │
            └── [slug]/
                ├── profile/
                │   ├── page.tsx        # Tenant profile (FUNCTIONAL)
                │   ├── edit/page.tsx   # Edit profile (FUNCTIONAL)
                │   ├── specialties/page.tsx  # Specialties (FUNCTIONAL)
                │   └── user-types/page.tsx   # User types (FUNCTIONAL)
                └── audits/
                    └── page.tsx        # Tenant audits (MOCK)
```

---

## 🔌 API Endpoints (5 endpoints reales)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/profile/me` | Obtener perfil del usuario actual | Cookie token |
| PUT | `/profile/me` | Actualizar perfil (nombre, email, specialties) | Cookie token |
| PUT | `/profile/avatar` | Actualizar avatar (base64) | Cookie token |
| PUT | `/profile/organization` | Actualizar datos de organización (solo OWNER) | Cookie token + role check |
| PUT | `/profile/specialties` | Actualizar specialtyIds del usuario/organización | Cookie token |

---

## 📋 Blueprint Index

| # | Archivo | Descripción | Estado |
|---|---------|-------------|--------|
| 01 | [README.md](./README.md) | Overview, arquitectura | ✅ |
| 02 | [02-backend.md](./02-backend.md) | Profile API endpoints | ✅ |
| 03 | [03-admin-profile.md](./03-admin-profile.md) | /admin/profile refactor | ✅ |
| 04 | [04-tenant-profile.md](./04-tenant-profile.md) | /[slug]/profile refactor | ✅ |
| 05 | [05-signup-update.md](./05-signup-update.md) | Tipo org en signup | ✅ |
| 06 | [06-audits-page.md](./06-audits-page.md) | Página auditorías | ⏳ MOCK |

---

## 🔗 Dependencias

- `01-auth` (auth existente)
- `07-specialties` (specialtyIds del usuario)

---

## 📝 Notas de alineación

- Avatar se guarda como base64 en campo `avatar` del modelo User
- Todos inician con plan "Free" (configurado en onboarding)
- orgName visible = organization.name (no el slug)
- Email en perfil es solo lectura (viene de Supabase Auth)
- **PUT `/profile/specialties`**: actualiza specialtyIds del user (para COLLABORATOR) o de la org (para OWNER)
- **PUT `/profile/organization`**: requiere rol OWNER, actualiza nombre y datos de la organización
- Las páginas de auditorías (admin y tenant) siguen usando datos MOCK

---

## 📊 Resumen de Estado

| Categoría | Estado |
|-----------|--------|
| **Profile API** | ✅ 5 endpoints funcionales |
| **Admin Profile UI** | ✅ Conectada a API |
| **Tenant Profile UI** | ✅ 4 páginas funcionales (profile, edit, specialties, user-types) |
| **Audits Pages** | ⏳ MOCK (admin + tenant) |

---

## 🔭 Siguiente Step

**Audits API** → Conectar páginas de auditorías a endpoints reales
**i18n** → Migrar 2 ternarios en `profile/page.tsx` y `profile/edit/page.tsx`
