# 02-Admin - Módulo de Administración SaaS

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Módulo** | Admin |
| **Estado** | 🔄 Actualizado según auditoría 2026-05-05 |
| **Última actualización** | 2026-05-05 |

---

## 🎯 Propósito

Documentar el layout de administración del SaaS (Superadmin y Operators), incluyendo estructura, componentes y páginas.

Este módulo es la interfaz principal para la gestión de la plataforma por parte del equipo de OmniDoc.

---

## 📁 Estructura de Archivos (Actualizada)

```
apps/web/src/app/
└── admin/
    ├── layout.tsx                   # Layout principal (sidebar + navbar)
    ├── page.tsx                     # Dashboard (MOCK - requiere API)
    ├── components/
    │   ├── AdminSidebar.tsx         # Sidebar
    │   └── AdminNavbar.tsx          # Navbar
    ├── profile/
    │   └── page.tsx                 # Perfil de usuario (FUNCTIONAL)
    ├── operators/
    │   ├── page.tsx                # Lista operadores (FUNCTIONAL)
    │   ├── [id]/page.tsx           # Detalle operador (FUNCTIONAL)
    │   ├── add/page.tsx            # Invitar operador (FUNCTIONAL)
    │   └── invitations/page.tsx    # Invitaciones (FUNCTIONAL)
    ├── tenants/
    │   ├── page.tsx                # Directorio tenants (FUNCTIONAL)
    │   └── [id]/page.tsx          # Detalle tenant (FUNCTIONAL)
    ├── audits/
    │   └── page.tsx                # Auditoría (MOCK - requiere API)
    ├── parameters/
    │   └── specialties/
    │       ├── page.tsx            # Especialidades (FUNCTIONAL)
    │       ├── new/page.tsx        # Nueva especialidad (FUNCTIONAL)
    │       └── [id]/page.tsx      # Editar especialidad (FUNCTIONAL)
    └── settings/
        └── page.tsx                # Configuración (PARTIAL)
```

---

## 🎨 Características del Layout

| Característica | Descripción |
|----------------|-------------|
| **Sidebar** | Colapsable, empieza cerrado |
| **Navbar** | Fixed, con búsqueda y avatar |
| **Dark Mode** | Soportado |
| **Mobile** | Responsive, sidebar en drawer |
| **Auth** | Verifica que sea SaaS user (SUPERADMIN/OPERATOR) |

---

## 📋 Blueprint Index (Actualizado)

| # | Archivo | Descripción | Estado |
|---|---------|-------------|--------|
| 01 | [01-layout/README.md](./01-layout/README.md) | Estructura del layout | ✅ |
| 02 | [02-sidebar/README.md](./02-sidebar/README.md) | AdminSidebar | ✅ |
| 03 | [03-navbar/README.md](./03-navbar/README.md) | AdminNavbar | ✅ |
| 04 | [04-pages/README.md](./04-pages/README.md) | Pages (13 páginas documentadas) | 🔄 Actualizado |
| 05 | [05-operators/README.md](./05-operators/README.md) | Operators Module | ✅ |
| 06 | [05-tenants-directory.md](./05-tenants-directory.md) | Tenants Directory | 🔄 Implementado |

---

## 🔐 Flujo de Autenticación

```
[Middleware]                    [Admin Layout]              [Redirect]
    │                              │                          │
    ├── /admin request ──────────► │                          │
    │   (sin cookie)               │                          │
    │                              │ ◄── /login?redirect=...   │
    │                              │                          │
    ├── /admin request ──────────► │                          │
    │   (con cookie)               │                          │
    │                              ├── getStoredUser() ─────► │
    │                              │   (no es SaaS user)      │
    │                              │ ◄── /[org_slug]/dashboard│
    │                              │                          │
    │                              ├── getStoredUser() ─────► │
    │                              │   (es SaaS user)        │
    │                              │ ◄── Render sidebar +     │
    │                              │     navbar + children   │
```

---

## 📝 Funcionalidades (Actualizadas)

### Sidebar
- Navigation items: Dashboard, Tenant Directory, Operators, Specialties, Audits, Settings
- Toggle collapse/expand
- System status indicator
- Profile link
- Logout

### Navbar
- Search input
- User avatar con dropdown
- Menu toggle para mobile

### Pages Implementadas (13 total)
- **Dashboard** (MOCK): Stats, métricas - requiere API real
- **Profile** (FUNCTIONAL): Configuración de cuenta
- **Operators** (FUNCTIONAL): 4 páginas (lista, detalle, add, invitaciones)
- **Tenants** (FUNCTIONAL): 2 páginas (directorio, detalle)
- **Audits** (MOCK): Placeholder - requiere API real
- **Specialties** (FUNCTIONAL): 3 páginas (lista, new, edit)
- **Settings** (PARTIAL): Mezcla real/mock

---

## 📊 Resumen de Estado (Auditoría 2026-05-05)

| Categoría | Count | Detalles |
|-----------|-------|----------|
| **Total Pages** | 13 | En `apps/web/src/app/admin/` |
| **FUNCTIONAL** | 10 | Conectadas a API real |
| **MOCK** | 2 | Dashboard, Audits - requieren API |
| **PARTIAL** | 1 | Settings — `GET/POST /settings/global-lang` real, resto mock |
| **i18n Migrated** | 11 | Usan `t('key')` sin ternarios |
| **i18n Pending** | 2 archivos | 8 ternarios: `operators/add` (7), `AdminNavbar` (1) |

---

## 🔗 Dependencias

```
00-GLOBAL ✅
    │
    └── 02-ADMIN (este blueprint)
          ├── 01-auth ✅ (requiere login primero)
          ├── 07-specialties ✅ (12 endpoints)
          ├── tailwind-design-system skill
          ├── framer-motion skill
          └── next-best-practices skill
```

---

## 📝 Notas Importantes

- **Ruta**: `/admin` (fija, no dinámica)
- **Users autorizados**: Solo SUPERADMIN y OPERATOR
- **Componentes**: Usan tokens del design system
- **Dark mode**: Funciona con clase `.dark`
- **i18n**: Solo 2 archivos con ternarios pendientes (8 total)
- **specialties/new**: Re-export de `[id]/page.tsx` (7 líneas), no implementación independiente
- **Settings**: tiene `GET/POST /settings/global-lang` funcional (superadmin only)

---

## 🔭 Siguiente Step

**i18n Migration** → Migrar 8 ternarios en 2 archivos (`operators/add`, `AdminNavbar`)
**[03-tenant/README.md](../03-tenant/README.md)** → Layout del tenant (organizaciones)
