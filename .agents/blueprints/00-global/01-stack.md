# 01-Stack - Tech Stack y Versiones

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 00-global/01-stack |
| **Estado** | ✅ Completado |

---

## 🎯 Propósito

Documentar el stack tecnológico completo con sus versiones específicas. Esta información es esencial para cualquier agente que necesite entender las dependencias del proyecto.

---

## 📦 Versiones del Sistema

```json
{
  "node": ">=20.0.0",
  "pnpm": "10.33.0",
  "npm": ">=10.0.0"
}
```

---

## 🏗️ Aplicaciones (Apps)

### Web (Frontend)

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| next | 16.2.2 | Framework React con App Router |
| react | 19.2.4 | UI Library |
| react-dom | 19.2.4 | React DOM renderer |
| tailwindcss | 4.x | Utility-first CSS |
| framer-motion | 12.38.0 | Animations |
| lucide-react | 1.7.0 | Iconos |
| next-themes | 0.2.0 | Dark mode |
| clsx | 2.1.1 | Utility para className |
| tailwind-merge | 3.5.0 | Utility para merge tailwind |

### API (Backend)

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| @nestjs/common | 11.1.0 | NestJS framework |
| @nestjs/core | 11.1.0 | NestJS core |
| @nestjs/platform-express | 11.1.0 | Express adapter |
| @nestjs/config | 4.0.0 | Configuración |
| @nestjs/swagger | 11.2.0 | OpenAPI docs |
| @prisma/client | 6.7.0 | ORM |
| @supabase/supabase-js | 2.101.1 | Supabase client |
| class-transformer | 0.5.1 | DTO validation |
| class-validator | 0.14.1 | Validation |
| zod | 4.3.6 | Schema validation |
| rxjs | 7.8.1 | Reactive extensions |

---

## 🛠️ Herramientas de Desarrollo

### Web

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| @types/node | 20.x | TypeScript types |
| @types/react | 19.x | React types |
| @types/react-dom | 19.x | React DOM types |
| typescript | 5.x | TypeScript |
| eslint | 9.x | Linter |
| eslint-config-next | 16.2.2 | Next.js ESLint config |
| @tailwindcss/postcss | 4.x | PostCSS para Tailwind |

### API

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| @nestjs/cli | 11.0.0 | NestJS CLI |
| @nestjs/schematics | 11.0.0 | NestJS generators |
| @nestjs/testing | 11.1.0 | Testing utilities |
| @types/express | 5.0.0 | Express types |
| @types/node | 22.0.0 | Node types |
| typescript | 5.8.0 | TypeScript |
| prisma | 6.7.0 | Database ORM |
| ts-node | 10.9.2 | TypeScript executor |
| eslint + typescript-eslint | 8.x | Linting |

### Shared (Root)

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| typescript | ^5.4.0 | TypeScript base |
| @types/node | ^20.0.0 | Node types |
| turbo | ^2.0.0 | Build system |

---

## 🔧 Scripts del Package.json Raíz

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "dev:web": "turbo run dev --filter=web",
    "dev:api": "turbo run dev --filter=api",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "docker:up": "docker compose -f infra/docker/docker-compose.yml up -d",
    "docker:down": "docker compose -f infra/docker/docker-compose.yml down"
  }
}
```

---

## 🐳 Servicios Docker

| Servicio | Imagen | Puerto |
|----------|--------|--------|
| postgres | supabase/postgres:15.6.1.117 | 5432 |
| auth | supabase/gotrue:v2.155.0 | 9999 |
| redis | redis:7-alpine | 6379 |
| nginx | nginx:alpine | 9999 |

---

## ✅ Criterios de Aceptación

- [x] Todas las versiones documentadas
- [x] Dependencias separadas por app (web, api)
- [x] Scripts principales documentados
- [x] Servicios Docker incluidos

---

## 📝 Notas

- **Next.js 16.2.2** viene con Turbopack por defecto en dev
- **Tailwind v4** usa `@import "tailwindcss"` en lugar de `@tailwind base`
- **Supabase** usa GoTrue directamente (sin @supabase/ssr)

---

## 🔗 Dependencias

Este blueprint no tiene dependencias con otros. Es el punto de partida.

---

## 🔭 Siguiente Step

[02-monorepo.md](./02-monorepo.md) → Configuración del monorepo