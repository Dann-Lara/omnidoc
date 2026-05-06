# 02-Monorepo - Estructura del Monorepo

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 00-global/02-monorepo |
| **Estado** | ✅ Completado |

---

## 🎯 Propósito

Documentar la estructura del monorepo, configuración de pnpm workspace, y cómo Turbo orquestra los builds.

---

## 📁 Estructura General

```
omnidoc/
├── package.json              # Workspace root
├── pnpm-workspace.yaml      # Workspace config
├── turbo.json                # Turbo config
├── tsconfig.json             # (no existe - cada app tiene el suyo)
│
├── apps/
│   ├── api/                  # NestJS backend
│   │   ├── src/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── seed.ts
│   │
│   └── web/                  # Next.js frontend
│       ├── src/
│       │   ├── app/          # App Router pages
│       │   ├── lib/          # Shared libs (auth, i18n)
│       │   ├── components/   # Shared components
│       │   └── middleware.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── next.config.ts
│
├── packages/                 # (reservado para shared packages)
│
├── infra/
│   └── docker/
│       └── docker-compose.yml
│
└── .agents/
    ├── skills/              # Agent skills
    └── blueprints/          # Documentación
```

---

## 📦 pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Explicación:** Permite que cualquier paquete en `apps/` y `packages/` sea instalado como dependencia desde cualquier otro.

---

## ⚙️ Turbo Configuration

### turbo.json (root)

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

**Explicación:**
- `build` depende de que las dependencias se builds primero (`^build`)
- Los outputs de build se cachean
- `dev` no se cachea y es persistente (no termina)

---

## 🔧 Path Aliases

### apps/web/tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**Resultado:** `@/lib/auth` → `apps/web/src/lib/auth`

### apps/api/tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## 🔌 Scripts por Aplicación

### API (apps/api)

```json
{
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "lint": "eslint src --fix",
    "typecheck": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:seed": "ts-node prisma/seed.ts"
  }
}
```

### Web (apps/web)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

---

## 🔀 Flujo de Desarrollo

### Iniciar todo el proyecto
```bash
pnpm dev
```
→ Ejecuta `turbo run dev` en paralelo para api y web

### Iniciar solo web
```bash
pnpm dev:web
```
→ `turbo run dev --filter=web`

### Build producción
```bash
pnpm build
```
→ `turbo run build` para api y web

---

## 📝 Convenciones

### Nombres de paquetes
- `web` para el app de Next.js
- `api` para el app de NestJS

### Scripts base
- `dev` - Desarrollo con watch
- `build` - Build producción
- `lint` - Linting
- `typecheck` - Verificación de tipos

---

## ✅ Criterios de Aceptación

- [x] Estructura de directorios documentada
- [x] pnpm-workspace.yaml configurado
- [x] Turbo tasks configurados
- [x] Path aliases funcionando
- [x] Scripts documentados

---

## 🔗 Dependencias

- **01-stack.md** - Requiere conocer las versiones de turbo y pnpm

---

## 🔭 Siguiente Step

[03-design-system.md](./03-design-system.md) → Tailwind CSS v4 y tokens