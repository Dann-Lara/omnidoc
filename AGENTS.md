# OmniDoc — AGENTS.md

Reglas operativas para agentes IA en este repositorio. Mantener este archivo corto y accionable.

---

## Prioridad de lectura (anti-latencia)

1. Leer solo este `AGENTS.md` para contexto base.
2. Para cambios pequeños, no leer blueprints.
3. Para cambios medianos, leer solo 1 blueprint específico.
4. Nunca leer módulos completos por defecto.
5. No leer `.agents/blueprints/_historical/` salvo instrucción explícita.

---

## Regla obligatoria de i18n

Siempre usar `useI18n` con claves:

```tsx
const { t } = useI18n()
{t('auth.successSignup')}
```

No usar condicionales inline por idioma:

```tsx
// Incorrecto
lang === 'en' ? 'Team Member Profile' : 'Perfil de Miembro del Equipo'
```

```tsx
// Incorrecto
lang === 'en'
  ? `Chief of Operations at ${orgName}. Managing medical workflows since 2018.`
  : `Jefe de Operaciones en ${orgName}. Gestionando flujos de trabajo médicos desde 2018.`
```

### Patrón de migración i18n

1. Extraer el texto a `apps/web/src/lib/i18n/translations.ts`.
2. Definir una clave estable (`area.feature.label`).
3. Reemplazar el ternario por `t('area.feature.label')`.

Referencia de ejecución: `.agents/blueprints/i18n-migration.md`.

---

## Stack y convenciones clave

- Frontend: Next.js App Router + React + TypeScript + Tailwind v4.
- Backend: NestJS + Prisma + PostgreSQL.
- i18n: `@/lib/i18n` (hook `useI18n`).
- Import alias: `@/` apunta a `src/`.
- Mantener TypeScript estricto.

### Restricciones explícitas

- No usar `shadcn/ui`.
- No usar `@supabase/ssr` (incompatibilidad actual con GoTrue local).

---

## Validación por tamaño de cambio

- Cambio pequeño: validación local/puntual, sin tests globales por defecto.
- Cambio mediano: `pnpm dev:check` + validación del área afectada.
- Cambio grande: validación funcional y técnica más amplia.
- `pnpm typecheck` + `pnpm build` + `pnpm test`: solo en fase de commit (cuando el usuario lo pida).

---

## Reglas de commit

Solo commitear si el usuario lo solicita explícitamente.

Cuando haya instrucción de commit:
1. `pnpm typecheck`
2. `pnpm build`
3. `pnpm test`
4. Commit (si todo pasa, salvo instrucción contraria del usuario)

---

## Blueprints: cómo decidir

Leer únicamente el blueprint mínimo necesario según el tipo de cambio.

- Stack/dependencias: `.agents/blueprints/00-global/01-stack.md`
- Seguridad: `.agents/blueprints/00-global/06-security.md`
- Auth backend: `.agents/blueprints/01-auth/02-backend.md`
- Auth frontend: `.agents/blueprints/01-auth/03-frontend.md`
- Perfil admin: `.agents/blueprints/02-admin/04-pages/profile.md`
- Perfil tenant: `.agents/blueprints/03-tenant/04-pages/profile.md`
- Docker/producción: `.agents/blueprints/04-devops/01-docker.md`

Si hay diferencia entre blueprint y código, prevalece el código.

---

## Checklist mínimo al cerrar tareas

Reportar siempre:
1. Qué blueprint(s) se leyeron.
2. Si hubo diferencias blueprint vs código.
3. Qué quedó pendiente.
4. Qué skill se usó (o justificar “sin skill”).
5. Qué validación se ejecutó y qué quedó para fase de commit.
