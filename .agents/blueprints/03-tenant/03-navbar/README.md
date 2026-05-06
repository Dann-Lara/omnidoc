# 03-Navbar - Componente TenantNavbar

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 03-tenant/03-navbar |
| **Estado** | ✅ Completado |

---

## 🎯 Propósito

Documentar el componente TenantNavbar, sus propiedades y funcionalidades específicas del tenant.

---

## 📁 Archivo Principal

```
apps/web/src/app/[slug]/dashboard/components/TenantNavbar.tsx
```

---

## 🔧 Interfaz

```typescript
interface TenantNavbarProps {
  onMenuClick: () => void        // Toggle sidebar (mobile)
  isSidebarOpen: boolean          // Estado del sidebar
  sidebarCollapsed: boolean      // Si sidebar está colapsado
  orgName?: string               // Nombre de la organización
}
```

---

## 📋 Componentes

### Mobile Menu Toggle
- Visible solo en < 1024px
- Icono de menú (hamburger)

### Organization Name
- Muestra el nombre de la organización
- Ubicado en el centro/izquierda de la navbar
- Solo visible en móvil (mobile only)

### Search (Opcional/Futuro)
- Actualmente no implementado
- Placeholder para futura funcionalidad

### User Avatar (Opcional/Futuro)
- Currently not implemented
- Reserved for future user menu

---

## 📏 Posicionamiento

| Prop | Valor |
|------|-------|
| Position | Fixed |
| Top | 0 |
| Left | Depends on sidebar state |
| Height | 64px (16rem) |

---

## 🌙 Dark Mode

Usa tokens del design system:
- `bg-surface` / `dark:bg-slate-900`
- `border-b border-outline-variant` / `dark:border-slate-700`

---

## ✅ Criterios de Aceptación

- [x] Menu toggle para mobile
- [x] Organization name visible en móvil
- [x] Margen se ajusta según sidebar
- [x] Dark mode funciona

---

## 🔗 Dependencias

- [Skill: tailwind-design-system](../skills/tailwind-design-system/SKILL.md) - Tokens