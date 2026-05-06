# 00-Global - Arquitectura y Configuración Global

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Módulo** | Global |
| **Estado** | ✅ Completado |
| **Última actualización** | 2026-04-08 |

---

## 🎯 Propósito

Establecer la base técnica del proyecto: arquitectura del monorepo, stack tecnológico, configuración global de Tailwind, y sistema de internacionalización (i18n).

**Este módulo es la base de todos los demás.** Para trabajo diario, no es necesario leerlo completo: abrir solo el archivo puntual que aplique al cambio.

---

## 📦 Blueprint Index

| # | Archivo | Descripción | Estado |
|---|---------|-------------|--------|
| 01 | [01-stack.md](./01-stack.md) | Tech stack y versiones | ✅ |
| 02 | [02-monorepo.md](./02-monorepo.md) | Estructura pnpm workspace, turbo | ✅ |
| 03 | [03-design-system.md](./03-design-system.md) | Tailwind v4, tokens CSS, dark mode | ✅ |
| 04 | [04-i18n.md](./04-i18n.md) | Sistema de traducciones | ✅ |
| 05 | [05-skills.md](./05-skills.md) | Skills instalados del proyecto | ✅ |
| 06 | [06-security.md](./06-security.md) | Reglas de seguridad globales | ✅ |

---

## 🔧 Configuración Clave

### Path Aliases
```
@/* → apps/web/src/*
```

### Scripts Principales
```bash
pnpm dev          # Iniciar todos los servicios (web + api)
pnpm build        # Build producción
pnpm dev:web      # Solo web
pnpm dev:api      # Solo api
pnpm docker:up    # Iniciar contenedores (postgres, redis, auth)
```

### Dark Mode
El proyecto usa `.dark` class con Tailwind v4. Ver [03-design-system.md](./03-design-system.md#dark-mode) para detalles.

---

## 📁 Archivos Críticos

### Raíz
- `package.json` - Workspace config con scripts turbo
- `pnpm-workspace.yaml` - Configuración de paquetes

### API
- `apps/api/package.json` - NestJS con Prisma
- `apps/api/src/main.ts` - Entry point

### Web
- `apps/web/package.json` - Next.js 16
- `apps/web/src/app/globals.css` - Tailwind v4 + design tokens
- `apps/web/src/lib/i18n/` - Sistema de traducciones
- `apps/web/src/middleware.ts` - Rutas protegidas
- `apps/web/src/components/ThemeProvider.tsx` - Dark mode provider

---

## 🔗 Dependencias entre Módulos

```
00-GLOBAL (este blueprint)
    │
    ├── 01-auth (pendiente)
    │   ├── Frontend: Login, Signup, Forgot Password
    │   └── Backend: Endpoints auth API
    │
    ├── 02-admin (pendiente)
    │   ├── Frontend: Layout admin, sidebar, navbar
    │   └── Backend: Endpoints admin
    │
    └── 03-tenant (pendiente)
        ├── Frontend: Layout slug, dashboard, profile
        └── Backend: Endpoints tenant
```

---

## 📝 Reglas del Proyecto

### Importante
- **NO usar shadcn/ui** — El usuario lo rechazó. Usar componentes Tailwind personalizados.
- **NO usar @supabase/ssr** — No funciona con GoTrue local. Usar fetch directo + localStorage + cookies.
- **NO agregar comentarios** al código a menos que el usuario lo pida explícitamente.

### Estructura de Rutas
```
apps/web/src/app/
├── (auth)/              # Login, signup, password reset
├── admin/              # Superadmin & Operators (isSaaSUser)
├── [slug]/             # Rutas dinámicas de tenant
└── page.tsx            # Landing page
```

---

## 📚 Referencias

- [Skill: tailwind-design-system](../skills/tailwind-design-system/SKILL.md)
- [Skill: next-best-practices](../skills/next-best-practices/SKILL.md)
- [Skill: vercel-react-best-practices](../skills/vercel-react-best-practices/SKILL.md)

---

## 🔭 Siguiente Step

**[01-auth/README.md](../01-auth/README.md)** → Módulo de autenticación completo (frontend + backend)