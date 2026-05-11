# 03-Tenant: 10-Workflows — Flujos Clínicos por Permisos

## Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 03-tenant/10-workflows |
| **Feature ID** | FEAT-WORKFLOWS-001 |
| **Estado** | ✅ Implementado |
| **Última actualización** | 2026-05-11 |

## Propósito

Sistema de flujos clínicos adaptativos que se activan/desactivan según los permisos que el Owner configura. Sin toggles explícitos — el sistema detecta automáticamente qué roles existen y habilita las funciones correspondientes.

### Principio de auto-detección

```
¿Alguien en la org tiene permiso "notes:vitals"?
  ├── Sí → aparece botón "Tomar Signos Vitales" en appointments CONFIRMED
  └── No → médico llena todo como hoy (sin cambios)

¿Alguien en la org tiene permiso "pharmacy.dispense"?
  ├── Sí → notificaciones activas + vista de pendientes
  └── No → médico dispensa directo como hoy (sin cambios)
```

## Estructura de Archivos

```
.agents/blueprints/03-tenant/10-workflows/
├── README.md
├── 01-permissions/README.md    # Fase 1: Homogeneizar permisos
├── 02-vitals/README.md         # Fase 2: Signos vitales + En Espera
└── 03-dispensing/README.md     # Fase 3: Dispensación separada + notificaciones
```

## Dependencias

```
00-GLOBAL ✅
    │
    └── 03-TENANT ✅
          └── 10-WORKFLOWS (este blueprint)
                ├── 06-team ✅ (user-types, permisos)
                ├── 07-patients ✅ (notas clínicas)
                ├── 08-appointments ✅ (citas, estados)
                ├── 09-pharmacy ✅ (inventario, dispensación)
                ├── responsive-design skill
                ├── framer-motion skill
                └── tailwind-design-system skill
```

## Fases de Implementación

| Fase | Archivo | Descripción | Impacto |
|------|---------|-------------|---------|
| 01 | [01-permissions/](./01-permissions/README.md) | Homogeneizar permisos (frontend + backend) | team, user-types |
| 02 | [02-vitals/](./02-vitals/README.md) | Signos vitales + status "En Espera" | appointments, notes |
| 03 | [03-dispensing/](./03-dispensing/README.md) | Dispensación separada + notificaciones ✅ Implementado | pharmacy, navbar |

## Diseño UX (sin mockups)

Todos los modales y dropdowns nuevos deben seguir los patrones existentes en el repo:

- **Modales**: Patrón `AgendaView.tsx` — `fixed inset-0 z-50`, backdrop `bg-black/40 backdrop-blur-sm`, contenedor `motion.div` con `initial={{ opacity: 0, scale: 0.95 }}`, `bg-surface-container-lowest rounded-3xl shadow-2xl`
- **Formularios**: Inputs con `bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20`
- **Tablas permisos**: Checkboxes con `w-5 h-5 rounded text-primary focus:ring-primary/20`
- **Navbar dropdown**: Mismo estilo que el menú de usuario (icono + panel flotante con `bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/10`)
- **Tokens**: Usar siempre tokens semánticos (`bg-surface`, `text-on-surface`, `border-outline-variant`, etc.), nunca colores hardcodeados

## Criterios de Aceptación (Globales)

- [x] Permisos homogéneos entre `profile/user-types` y `areas/team/[userId]`
- [ ] Auto-detección: si no hay users con `notes:vitals`, no aparece el modal
- [x] Auto-detección: si no hay users con `pharmacy.dispense`, no hay notificaciones
- [x] Owner recibe todas las notificaciones independientemente de sus permisos
- [x] Compatibilidad hacia atrás: orgs sin estos permisos funcionan exactamente como hoy

## Notas de Diseño

- **No mockups**: Seguir patrones visuales existentes del repo (listados arriba)
- **Sin cambios en DB que rompan datos existentes**: Todas las migraciones son aditivas
- **Sin librerías externas nuevas**: Usar Framer Motion (ya presente) y tokens existentes
- **i18n**: Usar `useI18n` con claves, agregar traducciones a `translations.ts`
