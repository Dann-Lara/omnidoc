# 02-Sidebar - Componente AdminSidebar

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 02-admin/02-sidebar |
| **Estado** | ✅ Completado |

---

## 🎯 Propósito

Documentar el componente AdminSidebar, sus propiedades, navegación y estados.

---

## 📁 Archivo Principal

```
apps/web/src/app/admin/components/AdminSidebar.tsx
```

---

## 🔧 Interfaz

```typescript
interface AdminSidebarProps {
  isOpen: boolean           // Sidebar abierto en mobile (drawer)
  onClose: () => void       // Función para cerrar (mobile)
  isCollapsed?: boolean     // Estado de colapso (opcional - usa internal si no se pasa)
  onToggleCollapse?: () => void  // Función para toggle (opcional)
}
```

---

## 📋 Navigation Items

```typescript
const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: t('admin.nav.dashboard') },
  { href: '/admin/tenants', icon: Building2, label: t('admin.nav.tenants') },
  { href: '/admin/operators', icon: UserCog, label: t('admin.nav.operators') },
  { href: '/admin/users', icon: Users, label: t('admin.nav.users') },
  { href: '/admin/config', icon: Shield, label: t('admin.nav.platformConfig') },
]
```

---

## 🎨 Estados Visuales

### Item Activo
```tsx
bg-surface-container-lowest dark:bg-slate-800
text-primary dark:text-white
font-bold
border-l-4 border-primary
```

### Item Inactivo
```tsx
text-on-surface-variant dark:text-slate-400
hover:bg-surface-container dark:hover:bg-slate-800
```

---

## 🔧 Comportamientos

### Toggle Collapse
- **Posición**: Antes del System Status
- **Icono**: ChevronLeft (rota 180° cuando expandido)
- **Animación**: transition-transform

### System Status
- **Collapsed**: Solo indicador verde
- **Expanded**: Card con uptime percentage

---

## 🌙 Dark Mode

Usa tokens del design system:
- `bg-surface` / `dark:bg-slate-900`
- `text-on-surface-variant` / `dark:text-slate-400`
- `border-outline-variant` / `dark:border-slate-700`

---

## ✅ Criterios de Aceptación

- [x] Nav items con traducciones
- [x] Toggle collapse funcional
- [x] System status con indicadores
- [x] Dark mode funciona
- [x] Links funcionan correctamente

---

## 🔗 Dependencias

- [Skill: framer-motion](../skills/framer-motion/SKILL.md) - Animaciones
- [Skill: tailwind-design-system](../skills/tailwind-design-system/SKILL.md) - Tokens