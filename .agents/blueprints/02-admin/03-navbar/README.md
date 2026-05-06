# 03-Navbar - Componente AdminNavbar

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 02-admin/03-navbar |
| **Estado** | ✅ Completado |

---

## 🎯 Propósito

Documentar el componente AdminNavbar, sus propiedades y funcionalidades.

---

## 📁 Archivo Principal

```
apps/web/src/app/admin/components/AdminNavbar.tsx
```

---

## 🔧 Interfaz

```typescript
interface AdminNavbarProps {
  onMenuClick: () => void        // Toggle sidebar (mobile)
  isSidebarOpen: boolean          // Estado del sidebar
  sidebarCollapsed: boolean      // Si sidebar está colapsado
}
```

---

## 📋 Componentes

### Search Input
- Placeholder translatable (`admin.nav.search`)
- Icono de lupa
- Sin funcionalidad de búsqueda implementada aún

### Avatar
- Muestra iniciales del usuario
- Click muestra dropdown (implementación futura)
- Fallback: icono de usuario

### Mobile Menu Toggle
- Solo visible en < 1024px
- Abre el drawer del sidebar

---

## 📏 Posicionamiento

| Prop | Valor |
|------|-------|
| Position | Fixed |
| Top | 0 |
| Left | Depends on sidebar state |
| Width | calc(100% - sidebar-width) |
| Z-Index | 40 (sobre sidebar) |

```tsx
// Ejemplo de margin
const marginLeft = sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
className={`pt-16 ${isSidebarOpen ? 'lg:ml-0' : marginLeft}`}
```

---

## 🌙 Dark Mode

Usa tokens del design system:
- `bg-surface` / `dark:bg-slate-900`
- `border-b border-outline-variant` / `dark:border-slate-700`

---

## ✅ Criterios de Aceptación

- [x] Search input con placeholder traducible
- [x] Avatar con iniciales
- [x] Mobile menu toggle
- [x] Margen se ajusta según sidebar
- [x] Dark mode funciona

---

## 🔗 Dependencias

- [Skill: tailwind-design-system](../skills/tailwind-design-system/SKILL.md) - Tokens