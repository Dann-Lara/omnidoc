# OmniDoc - Blueprint Documentation

## 📋 Índice de Módulos

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| [00-global](./00-global/README.md) | Arquitectura base, stack, config global | ✅ |
| [01-auth](./01-auth/README.md) | Autenticación, login, signup, refactor de seguridad | 🔄 Parcial |
| [02-admin](./02-admin/README.md) | Layout admin, sidebar, navbar, dashboard, profile, subscriptions | ✅ |
| [03-tenant](./03-tenant/README.md) | Layout tenant con slug, sidebar, navbar, pages, subscriptions | ✅ |
| [04-devops](./04-devops/README.md) | Docker, configuración de producción | ✅ |
| [05-ai-core](./05-ai-core/README.md) | IA con fallback chain, Redis caching, multiple API keys | ⏳ Pendiente |
| [06-profile](./06-profile/README.md) | Perfil de usuario, edición, auditorías | 🔄 Parcial |
| [07-specialties](./07-specialties/README.md) | Catálogo de especialidades en admin + tenant | 🔄 Parcial |

---

## 📖 Orden de Lectura Recomendado

**IMPORTANTE:** Este orden es referencia para onboarding, **no es obligatorio** para tareas pequeñas o fixes puntuales.

### 1. Comenzar por 00-Global
```
00-global/
├── README.md          ← Overview + índice
├── 01-stack.md        ← Tech stack y versiones
├── 02-monorepo.md      ← Estructura pnpm, turbo
├── 03-design-system.md ← Tailwind v4, tokens, dark mode
├── 04-i18n.md          ← Sistema de traducciones
├── 05-skills.md        ← Skills instalados
└── 06-security.md      ← Reglas de seguridad
```

### 2. Luego 01-Auth (antes de desarrollar features)
```
01-auth/
├── README.md          ← Overview + índice
├── 02-backend.md      ← DTOs, rate limiting, cookies
├── 03-frontend.md     ← Session, pages, cookies
└── 04-refactor.md     ← Plan de ejecución del refactor
```

### 3. Seguir con 02-Admin
```
02-admin/
├── README.md          ← Overview + índice
├── 01-layout/         ← Estructura del layout
├── 02-sidebar/         ← AdminSidebar
├── 03-navbar/         ← AdminNavbar
└── 04-pages/          ← Dashboard, Profile, futuro
```

### 4. Luego 03-Tenant
```
03-tenant/
├── README.md          ← Overview + índice
├── 01-layout/         ← Layout dinámico con [slug]
├── 02-sidebar/        ← TenantSidebar
├── 03-navbar/         ← TenantNavbar
├── 04-pages/          ← Dashboard, Profile, futuro
└── 05-middleware/     ← Rutas protegidas
```

### 5. Opcional: 04-DevOps
```
04-devops/
├── README.md          ← Overview + índice
├── 01-docker/         ← Docker Compose actual
└── 02-future/         ← Config producción (próximamente)
```

---

## 🎯 Cómo Usar Esta Documentación

### Regla de velocidad (default)
1. Empezar por el archivo exacto relacionado con el cambio.
2. Leer como máximo 1 blueprint antes de editar.
3. Si falta contexto, abrir 1 archivo adicional (máximo 2 total).
4. No leer módulos completos salvo refactor amplio o solicitud explícita.

### Para Nuevas Features
1. Leer **00-global/06-security.md** y el blueprint específico de la feature
2. Si la feature incluye auth → leer **01-auth**
3. Si es para admin → leer **02-admin**
4. Si es para tenant → leer **03-tenant**

### Para Fixes y Mejoras
1. Identificar el módulo afectado
2. Leer el README del módulo
3. Ir al blueprint específico del componente/page

### Para Refactor
1. Leer **00-global/06-security** para reglas
2. Leer el blueprint de refactor del módulo correspondiente
3. Seguir el checklist de ejecución

---

## 🔗 Dependencias entre Módulos

```
00-GLOBAL (base)
    │
    ├── 01-AUTH (requiere global)
    │
    ├── 02-ADMIN (requiere auth primero)
    │
    ├── 03-TENANT (requiere auth + middleware)
    │
    └── 04-DEVOPS (independiente)
```

---

## 📚 Skills Relevantes por Módulo

| Módulo | Skills a Usar |
|--------|---------------|
| 00-global | tailwind-design-system, next-best-practices |
| 01-auth | security-best-practices, nestjs-best-practices |
| 02-admin | framer-motion, tailwind-design-system |
| 03-tenant | framer-motion, tailwind-design-system, responsive-design |
| 04-devops | dockerfile-optimizer |

---

## ⚠️ Reglas Importantes

1. **NO ignorar blueprints relevantes** - Usa solo los que aplican al cambio
2. **No hacer lectura masiva por defecto** - Prioriza archivo específico sobre README general
3. **Revisar criterios de aceptación** - Solo del blueprint que vas a ejecutar
4. **Verificar dependencias** - Solo si el cambio cruza módulos

---

## 🔄 Estado de Blueprint (Actual vs Código)

- **00-global**: Completado ✅
- **01-auth**: Parcialmente alineado (implementación vigente en código, documentación en ajuste) 🔄
- **02-admin**: Completado ✅
- **03-tenant**: Completado ✅
- **04-devops**: Completado ✅
- **05-ai-core**: Pendiente (sin implementación de core IA en apps) ⏳
- **06-profile**: Parcialmente implementado (API + páginas existentes, revisar detalle por subarchivo) 🔄
- **07-specialties**: Parcialmente implementado (schema + endpoints + páginas, faltan hardening/guards) 🔄

---

## 📝 Contribuir

Al agregar nuevas features o modules:
1. Crear nuevo blueprint en la carpeta correspondiente
2. Agregar al README del módulo
3. Actualizar este índice si es un nuevo módulo
4. Incluir: propósito, archivos, criterios de aceptación, dependencias

---

*Última actualización: 2026-04-14*