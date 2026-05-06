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

## Reglas CRÍTICAS de base de datos y migraciones

⚠️ **ESTAS REGLAS SON ABSOLUTAS. SU VIOLACIÓN CAUSA PÉRDIDA IRREVERSIBLE DE DATOS Y FRUSTRA EL TRABAJO DEL USUARIO.**
⚠️ **LOS DATOS DE TEST SON VALIOSOS. NUNCA SE ASUME "ES SOLO DESARROLLO".**
⚠️ **TRATAR LA DB DE DESARROLLO COMO SI FUESE PRODUCCIÓN.**

### Prohibiciones terminantes
- **NUNCA** ejecutar `prisma migrate reset` (destruye toda la DB).
- **NUNCA** ejecutar `prisma migrate dev` sin permiso explícito del usuario.
- **NUNCA** ejecutar `DROP SCHEMA`, `DROP DATABASE`, `DROP TABLE`, ni `TRUNCATE` en ningún contexto.
- **NUNCA** usar `DELETE FROM` en migraciones.
- **NUNCA** eliminar datos existentes en migraciones — **PROHIBIDO TERMINANTEMENTE** a menos que el usuario lo diga explícitamente.

### Regla de oro: las migraciones SOLO agregan o modifican, NUNCA eliminan
- Las migraciones **SOLO** deben: crear tablas, agregar columnas, modificar tipos, agregar índices/relaciones.
- Las migraciones **NUNCA** deben: eliminar columnas, eliminar tablas, eliminar filas, truncar datos.
- Si se necesita eliminar algo (columna, tabla, datos): **solo editar el archivo .sql, NO ejecutar**. Avisar al usuario y esperar instrucciones.

### Secuencia obligatoria antes de tocar la DB
```
1. ¿Se necesita ejecutar migración o modificar tablas? → SÍ
2. CREAR BACKUP → pg_dump -h localhost -U postgres omnidoc > backup_$(date +%Y%m%d_%H%M%S).sql
3. Verificar backup: el archivo existe y tiene contenido (no vacío)
4. SIN BACKUP → NO EJECUTAR NADA. Detenerse aquí.
5. ¿La migración elimina datos? → SÍ → DETENERSE, solo editar .sql, avisar al usuario
6. ¿Confirmación explícita del usuario? → SÍ
7. Ejecutar migración
8. Restaurar datos críticos (superadmin, organizaciones, roles) si la migración los afecta
```

### Reglas de operación con migraciones
1. **Backup obligatorio SIEMPRE** — Antes de CUALQUIER ejecución de migración (`prisma migrate dev`, `deploy`, o modificación de tablas), crear un dump de seguridad:
   - `pg_dump -h localhost -U postgres omnidoc > backup_$(date +%Y%m%d_%H%M%S).sql`
   - Verificar que el archivo se creó y tiene contenido (no vacío).
   - **Sin backup, NO se ejecuta la migración. Punto.**
2. **Solo editar archivos** — Cuando el usuario pida modificar migraciones, solo editar los archivos `.sql`. No ejecutarlas.
3. **Confirmar antes de ejecutar** — Si el usuario quiere aplicar migraciones, pedir confirmación explícita y listar qué datos podrían verse afectados.
4. **Si una migración falla** — NO intentar resolver con reset. Informar al usuario del error y esperar instrucciones.
5. **Siempre usar patrones seguros** — Las migraciones deben ser idempotentes:
   - `CREATE TABLE IF NOT EXISTS`
   - `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
   - `DO $$ BEGIN IF NOT EXISTS ... END IF; END $$;` para columnas nuevas
   - Nunca `DROP COLUMN` sin backup previo y autorización explícita del usuario
6. **Proteger datos críticos** — El superadmin es inamovible. Cada migración debe verificar y restaurar:
   - Organización `omnidoc-saas`
   - Rol `SUPERADMIN`
   - Usuario `superadmin@omnidoc.dev`

### Se hace migración y se restauran los datos
- Después de ejecutar una migración, **siempre** verificar que los datos críticos existen.
- Si algo se perdió, **restaurar inmediatamente** desde el backup o recrear los datos esenciales (superadmin, orgs, roles).
- **No hay otra**: migración → verificación → restauración si es necesario.

### Recuperación de errores
- Si una migración falla parcialmente, **nunca** resetear la DB.
- Ofrecer al usuario opciones: corregir el SQL manualmente, crear una nueva migración, o esperar instrucciones.
- Los datos de desarrollo NO son reemplazables — trátalos como producción.
- Si el usuario indica que "se frustró el test" por pérdida de datos, **es tu responsabilidad** ofrecer restaurar desde el backup o reconstruir los datos críticos inmediatamente.

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
