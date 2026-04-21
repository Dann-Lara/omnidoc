# OmniDoc

SaaS multitenant para gestión de consultas médicas con herramientas asistidas por IA.

## Tech Stack

- **Frontend:** Next.js 16.2.2, React 19.2.4, Tailwind CSS v4, Framer Motion
- **Backend:** NestJS
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth (GoTrue) + cookies HttpOnly
- **ORM:** Prisma 6.7.0
- **Payments:** Pendiente de implementación
- **AI Core:** Pendiente de implementación
- **Cache:** Pendiente de implementación en app runtime

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker

### Setup

```bash
# 1. Instalar dependencias
pnpm install

# 2. Iniciar servicios Docker
pnpm docker:up

# 3. Correr migraciones y seed
pnpm db:migrate
pnpm db:seed

# 4. Iniciar desarrollo
pnpm dev
```

### URLs

- Web: http://localhost:3000
- API: http://localhost:3001
- Mailhog UI: http://localhost:8025

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Iniciar todos los servicios |
| `pnpm build` | Build para producción |
| `pnpm test` | Ejecutar tests |
| `pnpm db:migrate` | Correr migraciones |
| `pnpm db:seed` | Poblar con datos de prueba |

## Proyecto

Este es un monorepo Turbo con la siguiente estructura:

```
omnidoc/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── shared/       # Tipos y utilidades compartidas
│   └── config/       # Configuraciones compartidas
└── infra/
    └── docker/       # Docker Compose para desarrollo
```
