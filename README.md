# OmniDoc

> SaaS multitenant para gestión de consultas médicas con herramientas asistidas por IA.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20-green.svg)
![pnpm](https://img.shields.io/badge/pnpm-10.33.0-orange.svg)

## Tech Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Frontend** | Next.js (App Router), React, Tailwind CSS v4, Framer Motion | 16.2.2 |
| **Backend** | NestJS | 11.1.0 |
| **Database** | PostgreSQL (Supabase) | 15.6 |
| **Auth** | Supabase Auth (GoTrue) + cookies HttpOnly | v2.155.0 |
| **ORM** | Prisma | 6.7.0 |
| **Mail** | Resend | 6.10.0 |
| **Cache** | Redis | 7-alpine |
| **Payments** | Stripe | Pendiente |
| **AI Core** | OpenAI / Anthropic | Pendiente |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- Docker

### Setup

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 3. Iniciar servicios Docker
pnpm docker:up

# 4. Correr migraciones y seed
pnpm db:migrate
pnpm db:seed

# 5. Iniciar desarrollo
pnpm dev
```

### URLs de Desarrollo

| Servicio | URL |
|----------|-----|
| Web | http://localhost:3000 |
| API | http://localhost:3001 |
| Mailhog UI | http://localhost:8025 |
| Auth (GoTrue) | http://localhost:9999 |

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Iniciar todos los servicios (web + api) |
| `pnpm dev:web` | Solo frontend |
| `pnpm dev:api` | Solo backend |
| `pnpm build` | Build para producción |
| `pnpm lint` | Ejecutar linter |
| `pnpm typecheck` | Verificación de tipos |
| `pnpm test` | Ejecutar tests |
| `pnpm docker:up` | Iniciar contenedores (postgres, redis, auth) |
| `pnpm docker:down` | Detener contenedores |
| `pnpm docker:logs` | Ver logs de contenedores |
| `pnpm db:migrate` | Correr migraciones de Prisma |
| `pnpm db:seed` | Poblar con datos de prueba |
| `pnpm db:studio` | Abrir Prisma Studio |

## Estructura del Proyecto

Monorepo Turbo con la siguiente arquitectura:

```
omnidoc/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/           # Login, signup, password reset
│   │   │   │   ├── (landing)/        # Landing page
│   │   │   │   ├── [slug]/           # Rutas dinámicas de tenant
│   │   │   │   │   ├── areas/        # Especialidades, equipo
│   │   │   │   │   ├── dashboard/    # Dashboard del tenant
│   │   │   │   │   ├── operations/   # Pacientes, citas, notas
│   │   │   │   │   ├── profile/      # Perfil de usuario
│   │   │   │   │   └── specialties/  # Gestión de especialidades
│   │   │   │   ├── admin/            # Superadmin panel
│   │   │   │   │   ├── tenants/      # Gestión de tenants
│   │   │   │   │   ├── operators/    # Gestión de operadores
│   │   │   │   │   └── parameters/   # Parámetros globales
│   │   │   │   └── page.tsx          # Landing page
│   │   │   ├── components/           # Componentes compartidos
│   │   │   │   ├── appointments/     # Citas y calendario
│   │   │   │   └── pdf/              # Generación de PDFs
│   │   │   └── lib/
│   │   │       └── i18n/             # Sistema de traducciones
│   │   └── scripts/                  # Scripts de utilidad
│   └── api/                          # NestJS backend
│       ├── src/
│       │   ├── admin/                # Endpoints de admin
│       │   ├── appointments/         # Gestión de citas
│       │   ├── auth/                 # Autenticación
│       │   ├── invitations/          # Invitaciones de equipo
│       │   ├── mail/                 # Servicio de email
│       │   ├── patient-notes/        # Notas clínicas
│       │   ├── patients/             # Gestión de pacientes
│       │   ├── profile/              # Perfil de usuario
│       │   ├── specialties/          # Catálogo de especialidades
│       │   └── team/                 # Gestión de equipo
│       └── prisma/
│           ├── schema.prisma         # Schema de base de datos
│           └── seed.ts               # Datos de prueba
├── infra/
│   └── docker/                       # Docker Compose para desarrollo
│       ├── docker-compose.yml
│       └── nginx.conf
├── .agents/                          # Blueprints y documentación IA
│   ├── blueprints/                   # Especificaciones técnicas
│   └── skills/                       # Skills especializados
└── packages/                         # Paquetes compartidos (futuro)
```

## Módulo de Farmacia e Inventario

Sistema de inventario híbrido para gestión clínica de medicamentos:

- **Catálogo Maestro** (`ProductLibrary`) — independiente de existencias físicas
- **Gestión por Lotes** (`InventoryBatch`) — entradas incrementales con FEFO
- **Despacho Clínico** — lógica FEFO con descuento secuencial entre lotes
- **Dashboard Inteligente** — KPIs, stock de seguridad dinámico, vencimientos
- **Control de Roles** — Owner/Collaborator con permisos granulares de farmacia
- **Integración con Notas Clínicas** — prescripción, disponibilidad, despacho
- **Moneda Configurable** — USD/MXN/EUR por organización

### Páginas principales

| Ruta | Descripción |
|------|-------------|
| `/[slug]/pharmacy` | Dashboard con KPIs y alertas |
| `/[slug]/pharmacy/library` | Catálogo maestro de productos |
| `/[slug]/pharmacy/products/new` | Crear nuevo producto |
| `/[slug]/pharmacy/products/[id]/edit` | Editar producto |
| `/[slug]/pharmacy/inventory` | Inventario por lotes con prioridad FEFO |
| `/[slug]/pharmacy/restock` | Reabastecimiento de lotes |
| `/[slug]/pharmacy/dispensing` | Historial de despachos |

### API endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET/POST/PATCH | `/pharmacy/products` | CRUD de productos |
| GET/POST | `/pharmacy/inventory` | Inventario y reabastecimiento |
| POST | `/pharmacy/dispens` | Despacho con lógica FEFO |
| GET | `/pharmacy/dispens/history` | Historial de despachos |
| GET | `/pharmacy/batches/expiring` | Lotes por vencer |
| GET | `/pharmacy/dashboard/*` | KPIs y stock de seguridad |

## Módulo de Especialidades

El sistema de especialidades médicas permite:

- Catálogo maestro gestionado por SaaS (crear, editar, desactivar)
- Asignación de especialidades por tenant
- Conteo real de citas por especialidad (`appointmentCount`)
- Filtrado por rol (COLLABORATOR vs OWNER)
- Grid visual con tamaño proporcional al volumen de citas

**Endpoints principales:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/specialties` | Listado público de especialidades activas |
| GET | `/admin/specialties` | CRUD completo (solo superadmin) |
| GET | `/my-specialties` | Especialidades del tenant con conteo real |
| GET | `/my-specialties/for-notes` | Especialidades filtradas por rol |

## i18n

El proyecto soporta español e inglés mediante el hook `useI18n()`:

```tsx
const { t } = useI18n()
{t('patients.detail.title')}
```

Todas las traducciones están centralizadas en `apps/web/src/lib/i18n/translations.ts`.

## Licencia

Este proyecto está licenciado bajo [MIT License](LICENSE).
