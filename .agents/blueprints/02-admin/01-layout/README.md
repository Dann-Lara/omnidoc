# 01-Layout - Estructura del Layout Admin

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 02-admin/01-layout |
| **Estado** | ✅ Completado |

---

## 🎯 Propósito

Documentar la estructura del layout de administración, incluyendo el flujo de autenticación y autorización.

---

## 📁 Archivo Principal

```typescript
// apps/web/src/app/admin/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User, isAuthenticated, getStoredUser } from '@/lib/auth'
import { AdminSidebar } from './components/AdminSidebar'
import { AdminNavbar } from './components/AdminNavbar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Estados
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)

  // Verificación de auth
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    const storedUser = getStoredUser()
    if (!storedUser) {
      router.push('/login')
      return
    }

    // Verificar que sea usuario SaaS
    const user = new User(storedUser)
    if (!user.isSaaSUser()) {
      // Redirigir al dashboard del tenant
      if (storedUser.org_slug) {
        router.push(`/${storedUser.org_slug}/dashboard`)
      } else {
        router.push('/login')
      }
      return
    }

    setIsAuthorized(true)
    setIsLoading(false)
  }, [router])

  // ... render
}
```

---

## 🔐 Auth Check Flow

```
1. isAuthenticated()
   └── Verifica que exista sb-user-id en localStorage/cookies

2. getStoredUser()
   └── Obtiene datos del usuario desde storage

3. User.isSaaSUser()
   └── Verifica rol: SUPERADMIN o OPERATOR

4. Redirect según corresponda
   ├── No auth → /login
   ├── No es SaaS → /[org_slug]/dashboard
   └── Es SaaS → Render layout
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

## ✅ Criterios de Aceptación

- [x] Layout verifica autenticación
- [x] Layout verifica que sea SaaS user
- [x] Sidebar colapsable
- [x] Navbar con padding para sidebar expandido
- [x] Loading state implementado

---

## 🔗 Dependencias

- [01-auth/03-frontend.md](../01-auth/03-frontend.md) - Sistema de auth
- [06-security.md](../00-global/06-security.md) - Reglas de seguridad