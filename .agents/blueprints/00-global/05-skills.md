# 05-Skills - Agent Skills Instalados

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 00-global/05-skills |
| **Estado** | ✅ Completado |

---

## 🎯 Propósito

Documentar las skills instaladas en el proyecto y cuándo debe usarlas un agente IA durante el desarrollo.

---

## 📁 Ubicación

```
.agents/skills/
├── tailwind-design-system/
├── next-best-practices/
├── vercel-react-best-practices/
├── frontend-design/
├── supabase-postgres-best-practices/
├── typescript-advanced-types/
├── framer-motion/
├── nestjs-best-practices/
├── dockerfile-optimizer/
├── redis-development/
├── webapp-testing/
├── security-best-practices/
├── responsive-design/
└── git-commit/
```

---

## 🛠️ Skills por Tecnología

### Frontend (Web)

| Skill | Cuándo Usar |
|-------|--------------|
| **tailwind-design-system** | Al crear o modificar componentes con Tailwind CSS v4 |
| **next-best-practices** | Al trabajar con Next.js App Router, pages, layouts, server components |
| **vercel-react-best-practices** | Al escribir componentes React, hooks, o patrones de estado |
| **frontend-design** | Al crear interfaces UI desde cero, páginas, o componentes visuales |
| **framer-motion** | Al agregar animaciones, transiciones, o efectos motion |
| **webapp-testing** | Al escribir tests (unit, integration, e2e) con Playwright |
| **security-best-practices** | Al escribir código con prácticas seguras, validar inputs, evitar vulnerabilidades |
| **responsive-design** | Al crear layouts responsive, mobile-first, container queries |

### Backend (API)

| Skill | Cuándo Usar |
|-------|--------------|
| **nestjs-best-practices** | Al escribir código NestJS (controllers, services, modules) |
| **supabase-postgres-best-practices** | Al escribir queries SQL, schemas, o configurar RLS |
| **dockerfile-optimizer** | Al crear o optimizar Dockerfiles |

### Utilities

| Skill | Cuándo Usar |
|-------|--------------|
| **typescript-advanced-types** | Al trabajar con generics, utility types, o tipos complejos |
| **redis-development** | Al integrar Redis para caching o data structures |
| **git-commit** | Al hacer commits, sigue conventional commits |

---

## 📋 Cómo Usar una Skill

### Método 1: Carga Manual

```typescript
// El agente debe cargar la skill antes de trabajar
skill('tailwind-design-system')
```

### Método 2: Detección Automática

Las skills se cargan automáticamente cuando el agent detecta palabras clave:

| Skill | Palabras Clave |
|-------|----------------|
| tailwind-design-system | tailwind, design system, tokens, theme |
| next-best-practices | next.js, app router, server component, page, layout |
| vercel-react-best-practices | react, hooks, useState, useEffect, component |
| framer-motion | animation, motion, animate, transition |
| nestjs-best-practices | nestjs, controller, service, module, dto |
| supabase-postgres-best-practices | sql, query, database, prisma, rls |

---

## 📚 Skills Disponibles

### 1. tailwind-design-system

**Propósito:** Build scalable design systems con Tailwind CSS v4

**Temas:** Design tokens, component library, responsive patterns

**Ubicación:** `.agents/skills/tailwind-design-system/SKILL.md`

---

### 2. next-best-practices

**Propósito:** Next.js App Router, Server Components, caching

**Temas:** RSC boundaries, data patterns, async APIs, metadata, route handlers

**Ubicación:** `.agents/skills/next-best-practices/SKILL.md`

---

### 3. vercel-react-best-practices

**Propósito:** React performance optimization de Vercel Engineering

**Temas:** React components, hooks, state, composition

**Ubicación:** `.agents/skills/vercel-react-best-practices/SKILL.md`

---

### 4. frontend-design

**Propósito:** UI/UX de producción, evitar aesthetics genéricas de AI

**Temas:** Componentes, páginas, accesibilidad, diseño clínico

**Ubicación:** `.agents/skills/frontend-design/SKILL.md`

---

### 5. framer-motion

**Propósito:** Animaciones performantes con Framer Motion

**Temas:** Motion components, variants, gestures, transitions

**Ubicación:** `.agents/skills/framer-motion/SKILL.md`

---

### 6. nestjs-best-practices

**Propósito:** NestJS architecture patterns

**Temas:** Modules, DI, security, performance

**Ubicación:** `.agents/skills/nestjs-best-practices/SKILL.md`

---

### 7. supabase-postgres-best-practices

**Propósito:** PostgreSQL optimization de Supabase

**Temas:** Queries, schemas, RLS, tipos

**Ubicación:** `.agents/skills/supabase-postgres-best-practices/SKILL.md`

---

### 8. typescript-advanced-types

**Propósito:** TypeScript avanzado

**Temas:** Generics, conditional types, mapped types, utility types

**Ubicación:** `.agents/skills/typescript-advanced-types/SKILL.md`

---

### 9. dockerfile-optimizer

**Propósito:** Docker multi-stage, layering, caching

**Temas:** Smaller images, faster builds, security

**Ubicación:** `.agents/skills/dockerfile-optimizer/SKILL.md`

---

### 10. redis-development

**Propósito:** Redis patterns, caching, vector search

**Temas:** Data structures, RQE, RedisVL, LangCache

**Ubicación:** `.agents/skills/redis-development/SKILL.md`

---

### 11. webapp-testing

**Propósito:** Testing con Playwright

**Temas:** Unit, integration, e2e tests, debugging

**Ubicación:** `.agents/skills/webapp-testing/SKILL.md`

---

### 12. security-best-practices

**Propósito:** Security by design, vulnerability detection

**Temas:** Secure coding, vulnerability detection, input validation, authentication security

**Ubicación:** `.agents/skills/security-best-practices/SKILL.md`

**Reglas de seguridad del proyecto:**
- ✅ Nunca hardcodear secrets en código
- ✅ Usar `.env.local` (no commitear)
- ✅ Tokens en HttpOnly cookies cuando sea posible
- ✅ Validar inputs en todos los endpoints
- ✅ Sanitizar datos antes de usarlos en queries

---

### 13. responsive-design

**Propósito:** Responsive layouts, mobile-first design

**Temas:** Container queries, fluid typography, responsive patterns

**Ubicación:** `.agents/skills/responsive-design/SKILL.md`

**Reglas responsive del proyecto:**
- ✅ Mobile-first (diseño base para móvil, `md:` para desktop)
- ✅ Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- ✅ Touch targets mínimos 44px
- ✅ Funcionar en móvil (no prioritario pero debe funcionar)

---

## ⚙️ Cómo Instalar Nuevas Skills

```bash
# Requiere Node 20+
export PATH="$HOME/.nvm/versions/node/v20.15.0/bin:$PATH"

# Buscar skills disponibles
npx skills add <owner/repo> --skill <skill-name> --yes

# Ejemplo
npx skills add vercel-labs/next-skills --skill next-best-practices --yes
```

---

## ✅ Criterios de Aceptación

- [x] Todas las skills documentadas
- [x] Cuándo usar cada skill указано
- [x] Cómo cargar manualmente documentado

---

## 🚦 Política Operativa (anti-incumplimiento)

- Cambios pequeños: no cargar skills.
- Cambios medianos: usar 1 skill relevante como máximo.
- Cambios grandes: usar hasta 2 skills justificadas.
- Nunca cargar skills sin relación directa con la tarea.
- Si una tarea toca seguridad/auth, usar `security-best-practices`.
- Si una tarea toca NestJS o Next.js, usar la skill correspondiente o justificar por qué no aplica.

## ❌ Errores frecuentes y corrección

- "Cargar muchas skills por si acaso" → usar solo las necesarias.
- "No reportar skill usada" → siempre indicar skill o justificar "sin skill".
- "Aplicar skill fuera de contexto" → seguir el tipo de tarea, no palabras sueltas.

---

## 🔗 Dependencias

- Ninguna - Este es el último blueprint del módulo 00-global

---

## 🔭 Siguiente Step

**[01-auth/README.md](../01-auth/README.md)** → Módulo de autenticación completo

**Dependencias:**
- 00-global (este módulo) ✅
- 01-auth (próximo) → Usa: next-best-practices, tailwind-design-system, nestjs-best-practices