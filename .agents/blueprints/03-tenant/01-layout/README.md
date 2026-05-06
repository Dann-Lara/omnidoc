# 01-Layout - Estructura del Layout Tenant

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 03-tenant/01-layout |
| **Estado** | ✅ Completado |

---

## 🎯 Propósito

Documentar la estructura del layout dinámico del tenant que usa `[slug]` como parámetro para identificar la organización.

---

## 📁 Archivo Principal

```typescript
// apps/web/src/app/[slug]/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User, isAuthenticated, getStoredUser } from '@/lib/auth'
import { TenantSidebar } from './dashboard/components/TenantSidebar'
import { TenantNavbar } from './dashboard/components/TenantNavbar'

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string  // org_slug de la organización
  
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)

  const storedUser = getStoredUser()
  const orgName = storedUser?.org_slug || slug  // Nombre para mostrar

  // ... resto del código
}
```

---

## 🔐 Auth Check Flow

```
1. isAuthenticated()
   └── Verifica que exista sb-user-id

2. getStoredUser()
   └── Obtiene datos del usuario

3. User.isSaaSUser()
   └── Si es SaaS user → redirigir a /admin

4. Verificar org_slug
   └── Si user.org_slug != slug → redirigir a su propio dashboard

5. Render layout
   └── Si todo OK → mostrar sidebar + navbar + children
```

---

## 📏 Dimensiones del Sidebar

| Estado | Ancho | Clase Tailwind |
|--------|-------|----------------|
| Collapsed | 80px (5rem) | `w-20` |
| Expanded | 256px (16rem) | `w-64` |

---

## 📱 Responsive Breakpoints

| Breakpoint | Comportamiento |
|------------|----------------|
| < 1024px | Sidebar como drawer overlay |
| ≥ 1024px | Sidebar fijo |

---

## ⚠️ Diferencia con Dashboard Layout

El layout `[slug]/layout.tsx` YA incluye el sidebar y navbar. El `dashboard/layout.tsx` es solo un wrapper simplificado:

```typescript
// apps/web/src/app/[slug]/dashboard/layout.tsx
// Solo pasa children, NO tiene sidebar/navbar
export default function TenantDashboardLayout({ children }) {
  return <div className="min-h-full">{children}</div>
}
```

**Esto es importante** para el routing: `/[slug]/dashboard` y `/[slug]/profile` heredan el layout padre con sidebar/navbar.

---

## ✅ Criterios de Aceptación

- [x] Layout verifica autenticación
- [x] Layout verifica que usuario pertenezca a la organización
- [x] Redirige a SaaS users al admin
- [x] Sidebar colapsable
- [x] Navbar con nombre de organización
- [x] Prop `slug` pasado a Sidebar/Navbar

---

## 🔗 Dependencias

- [01-auth/03-frontend.md](../01-auth/03-frontend.md) - Sistema de auth
- [05-middleware/README.md](../05-middleware/README.md) - Rutas protegidas