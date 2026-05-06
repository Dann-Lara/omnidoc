# 02-Sidebar - Componente TenantSidebar

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 03-tenant/02-sidebar |
| **Estado** | ✅ Completado |

---

## 🎯 Propósito

Documentar el componente TenantSidebar, sus propiedades, navegación dinámica con slug, y diferencias con AdminSidebar.

---

## 📁 Archivo Principal

```
apps/web/src/app/[slug]/dashboard/components/TenantSidebar.tsx
```

---

## 🔧 Interfaz

```typescript
interface TenantSidebarProps {
  isOpen: boolean           // Sidebar abierto en mobile (drawer)
  onClose: () => void       // Función para cerrar (mobile)
  isCollapsed?: boolean     // Estado de colapso
  onToggleCollapse?: () => void  // Función para toggle
  orgName?: string          // Nombre de la organización (para mostrar)
  slug?: string             // org_slug (para generar links dinámicos)
}
```

---

## 📋 Navigation Items

```typescript
// Los links incluyen el slug para mantener la ruta correcta
const basePath = slug ? `/${slug}` : ''

const navItems = [
  { href: `${basePath}/dashboard`, icon: LayoutDashboard, labelKey: 'tenant.nav.dashboard' },
  { href: `${basePath}/dashboard/calendar`, icon: Calendar, labelKey: 'tenant.nav.calendar' },
  { href: `${basePath}/dashboard/metrics`, icon: BarChart3, labelKey: 'tenant.nav.metrics' },
  { href: `${basePath}/dashboard/team`, icon: Users, labelKey: 'tenant.nav.team' },
  { href: `${basePath}/dashboard/settings`, icon: Settings, labelKey: 'tenant.nav.settings' },
  { href: `${basePath}/profile`, icon: User, labelKey: 'tenant.nav.profile' },  // Fuera de dashboard
]
```

---

## 🎨 Diferencias con AdminSidebar

| Aspecto | AdminSidebar | TenantSidebar |
|---------|--------------|---------------|
| Logo | OmniDoc | OmniDoc + orgName |
| Nav items | admin.nav.* | tenant.nav.* |
| Links | Fijos (/admin/...) | Dinámicos (/${slug}/...) |
| Profile link | /admin/profile | /[slug]/profile |

---

## 🌙 Dark Mode

Usa tokens del design system:
- `bg-surface` / `dark:bg-slate-900`
- `text-on-surface-variant` / `dark:text-slate-400`
- `border-outline-variant` / `dark:border-slate-700`

---

## 📋 Sistema Status

```typescript
// Collapsed: solo indicador verde
// Expanded: card con uptime
{lang === 'en' ? 'Operational' : 'Operacional'}
98.4% {t('tenant.sidebar.uptime')}
```

---

## ✅ Criterios de Aceptación

- [x] Links usan slug dinámico
- [x] Muestra nombre de organización
- [x] Toggle collapse funcional
- [x] Traducciones de tenant
- [x] Dark mode funciona
- [x] Profile link fuera de /dashboard

---

## 🔗 Dependencias

- [Skill: framer-motion](../skills/framer-motion/SKILL.md) - Animaciones
- [Skill: tailwind-design-system](../skills/tailwind-design-system/SKILL.md) - Tokens