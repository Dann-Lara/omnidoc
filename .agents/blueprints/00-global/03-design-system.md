# 03-Design System - Tailwind CSS v4

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 00-global/03-design-system |
| **Estado** | ✅ Completado |

> **Nota:** Este documento complementa la skill `tailwind-design-system`. Se recomienda revisar ambas referencias.

---

## 🎯 Propósito

Documentar la configuración de Tailwind CSS v4, las variables CSS del design system, y cómo funciona el dark mode en el proyecto.

---

## 📁 Archivo Principal

```
apps/web/src/app/globals.css
```

Este archivo contiene toda la configuración de Tailwind v4.

---

## ⚡ Configuración Base

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

**Importante:** La línea `@custom-variant dark` es **crítica** para que el dark mode funcione con la clase `.dark` en lugar del media query `prefers-color-scheme`.

---

## 🎨 Variables CSS del Theme

### Modo Claro (Light)

```css
@theme {
  /* Colors */
  --color-primary: #00355f;
  --color-primary-container: #0f4c81;
  --color-secondary: #48626e;
  --color-secondary-container: #cbe7f5;
  --color-tertiary: #003941;
  --color-tertiary-container: #00525d;
  
  /* Surface Colors */
  --color-surface: #f8f9fb;
  --color-surface-container-low: #f2f4f6;
  --color-surface-container: #eceef0;
  --color-surface-container-high: #e6e8ea;
  --color-surface-container-lowest: #ffffff;
  
  /* On Colors */
  --color-on-surface: #191c1e;
  --color-on-surface-variant: #42474f;
  --color-on-primary: #ffffff;
  --color-on-secondary: #ffffff;
  
  /* Utility */
  --color-outline: #727780;
  --color-outline-variant: #c2c7d1;
  --color-surface-tint: #2d6197;
  --color-error: #ba1a1a;
  --color-error-container: #ffdAD6;
  --color-success: #006E2C;

  /* Typography */
  --font-headline: "Manrope", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-label: "Inter", system-ui, sans-serif;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;
}
```

### Modo Oscuro (Dark)

```css
.dark {
  --color-primary: #5aa0d4;
  --color-primary-container: #2d5f87;
  --color-secondary: #8da8b5;
  --color-secondary-container: #304a55;
  --color-tertiary: #55d7ed;
  --color-tertiary-container: #004e59;
  
  --color-surface: #0f1419;
  --color-surface-container-low: #1a2129;
  --color-surface-container: #232d38;
  --color-surface-container-high: #2a3642;
  --color-surface-container-lowest: #2a3642;
  
  --color-on-surface: #e3e6e9;
  --color-on-surface-variant: #9ba3ae;
  --color-on-primary: #001c37;
  --color-on-secondary: #001c37;
  
  --color-outline: #8c939c;
  --color-outline-variant: #43484f;
  --color-surface-tint: #7ab8e8;
  --color-error: #ffb4ab;
  --color-error-container: #93000a;
}
```

---

## 🖥️ Uso en Componentes

### Clases del Design System

```tsx
// Correcto - usa tokens
<div className="bg-surface text-primary">
  <div className="bg-surface-container text-on-surface-variant">
    <button className="bg-primary-container text-on-primary">
  </div>
</div>

// Incorrecto - usa colores hardcodeados
<div className="bg-slate-50 text-slate-900">  // ❌
```

### Fuentes

```tsx
// headline - Headings
<h1 className="font-headline">Título</h1>

// body - Contenido general
<p className="font-body">Texto</p>

// label - Labels, botones pequeños
<span className="font-label">Label</span>
```

### Border Radius

```tsx
<div className="rounded-sm">...</div>
<div className="rounded-md">...</div>
<div className="rounded-lg">...</div>
<div className="rounded-xl">...</div>
<div className="rounded-full">...</div>
```

---

## 🌙 Dark Mode

### Activación

El dark mode se activa agregando la clase `.dark` al elemento `<html>`.

### ThemeProvider

```tsx
// apps/web/src/components/ThemeProvider.tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ReactNode, useEffect, useState } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem={false} 
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
```

### Renderizado en Root Layout

```tsx
// apps/web/src/app/layout.tsx
import { ThemeProvider } from '@/components/ThemeProvider'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

---

## 🔧 Utilities Personalizadas

### clsx y tailwind-merge

```tsx
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Combinar clases correctamente
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

// Uso
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  isDark && "dark-classes"
)} />
```

---

## 📋 Lista de Tokens

### Colores Principales
| Token | Light | Dark |
|-------|-------|------|
| `primary` | #00355f | #5aa0d4 |
| `primary-container` | #0f4c81 | #2d5f87 |
| `secondary` | #48626e | #8da8b5 |
| `secondary-container` | #cbe7f5 | #304a55 |
| `surface` | #f8f9fb | #0f1419 |
| `surface-container` | #eceef0 | #232d38 |
| `on-surface` | #191c1e | #e3e6e9 |
| `on-surface-variant` | #42474f | #9ba3ae |
| `error` | #ba1a1a | #ffb4ab |

### Fuentes
| Token | Valor |
|-------|-------|
| `headline` | Manrope |
| `body` | Inter |
| `label` | Inter |

---

## 📱 Responsive Design

### Enfoque

El proyecto es **primariamente desktop**, pero debe funcionar correctamente en dispositivos móviles.

### Breakpoints de Tailwind

| Breakpoint | Ancho | Prefijo | Uso |
|------------|-------|---------|-----|
| base | < 640px | - | Mobile (base) |
| sm | ≥ 640px | `sm:` | Mobile landscape |
| md | ≥ 768px | `md:` | Tablet |
| lg | ≥ 1024px | `lg:` | Desktop |
| xl | ≥ 1280px | `xl:` | Large desktop |
| 2xl | ≥ 1536px | `2xl:` | Extra large |

### Patrón Mobile-First

```tsx
// ✅ CORRECTO - Base mobile, agregar desktop con md:
<div className="w-full md:w-1/2">...</div>

// ❌ INCORRECTO - Usar lg: para todo
<div className="lg:w-1/2">...</div>
```

### Reglas de Responsive

| Regla | Descripción |
|-------|-------------|
| Mobile-first | Escribir CSS base para móvil, agregar `md:`, `lg:` para desktop |
| Touch targets | Mínimo 44px de tamaño para elementos interactivos |
| Testing | Probar en móvil aunque no sea prioritario |
| Contenedores | Usar max-width en containers para pantallas grandes |

### Ejemplo de Layout

```tsx
// Layout que funciona en móvil y desktop
<div className="
  flex flex-col        // stack vertical en móvil
  md:flex-row          // row en desktop
  gap-4                // gap siempre
  p-4                  // padding siempre
  max-w-7xl            // max width para pantallas grandes
  mx-auto              // centrar
">
  <div className="w-full md:w-1/3">Sidebar</div>
  <div className="w-full md:w-2/3">Content</div>
</div>
```

### Utility Classes Comunes

```tsx
// Visibilidad
<div className="hidden md:block">Solo desktop</div>
<div className="md:hidden">Solo móvil</div>

// Espaciado
<p className="p-4 md:p-6 lg:p-8">Padding responsive</p>

// Textos
<p className="text-sm md:text-base">Texto responsive</p>

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <div>Card</div>
</div>
```

---

## ✅ Criterios de Aceptación

- [x] globals.css configurado con `@theme`
- [x] `@custom-variant dark` añadido
- [x] Tokens de colores documentados
- [x] Dark mode funciona con clase `.dark`
- [x] ThemeProvider configurado correctamente
- [x] Responsive rules documentadas

---

## 🔗 Dependencias

- [Skill: tailwind-design-system](../skills/tailwind-design-system/SKILL.md) - Best practices
- [Skill: responsive-design](../skills/responsive-design/SKILL.md) - Responsive patterns
- [02-monorepo.md](./02-monorepo.md) - Estructura del proyecto

---

## 🔭 Siguiente Step

[04-i18n.md](./04-i18n.md) → Sistema de internacionalización