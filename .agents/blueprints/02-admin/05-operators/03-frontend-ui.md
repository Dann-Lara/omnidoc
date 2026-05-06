# Blueprint: Fase 3 - Frontend UI (OPERATOR)

**Objetivo**: Crear páginas de gestión de operators y modificar sidebar según rol.

---

## 1. Listado Operators

### Ruta: `apps/web/src/app/admin/operators/page.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { OperatorTable } from './components/OperatorTable'
import { OperatorFilters } from './components/OperatorFilters'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Operator {
  id: string
  email: string
  firstName: string
  lastName: string
  status: string
  tenantCount: number
  createdAt: Date
}

export default function OperatorsPage() {
  const searchParams = useSearchParams()
  const { t } = useI18n()
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })

  useEffect(() => {
    fetchOperators()
  }, [searchParams])

  const fetchOperators = async () => {
    const res = await fetch(`${API_URL}/admin/operators`)
    const data = await res.json()
    setOperators(data)
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.nav.operators')}</h1>
          <p className="text-on-surface-variant">{t('admin.operators.description')}</p>
        </div>
        <a
          href="/admin/operators/add"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('admin.operators.addNew')}
        </a>
      </div>

      <OperatorFilters />
      <OperatorTable operators={operators} loading={loading} pagination={pagination} />
    </motion.div>
  )
}
```

---

## 2. Agregar Operator (Invitación)

### Ruta: `apps/web/src/app/admin/operators/add/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { MultiSelect } from '@/components/MultiSelect'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Tenant {
  id: string
  name: string
}

export default function AddOperatorPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    tenantIds: [] as string[],
  })
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTenants()
  }, [])

  const fetchTenants = async () => {
    const res = await fetch(`${API_URL}/admin/tenants?limit=1000`)
    const data = await res.json()
    setTenants(data.data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          role: 'OPERATOR',
          tenantIds: formData.tenantIds,
        }),
      })

      if (!res.ok) throw new Error('Failed to send invitation')

      router.push('/admin/operators')
    } catch (err) {
      setError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-2xl"
    >
      <h1 className="text-2xl font-bold mb-6">{t('admin.operators.inviteTitle')}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">{t('common.email')}</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-outline-variant"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('common.firstName')}</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-outline-variant"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('common.lastName')}</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-outline-variant"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('admin.operators.selectTenants')}</label>
          <MultiSelect
            options={tenants.map(t => ({ value: t.id, label: t.name }))}
            selected={formData.tenantIds}
            onChange={(ids) => setFormData({ ...formData, tenantIds: ids })}
            placeholder={t('admin.operators.selectTenantsPlaceholder')}
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? t('common.loading') : t('admin.operators.sendInvite')}
        </button>
      </form>
    </motion.div>
  )
}
```

---

## 3. Componentes

### `apps/web/src/app/admin/operators/components/OperatorTable.tsx`

Tabla con columnas: Nombre, Email, Tenants Asignados, Estado, Acciones.

### `apps/web/src/app/admin/operators/components/OperatorFilters.tsx`

Filtros: status (active/inactive), search.

---

## 4. Sidebar - Filtrar por Rol

### Archivo: `apps/web/src/app/admin/components/AdminSidebar.tsx`

```typescript
// Definir permisos por rol
const NAV_ITEMS = {
  SUPERADMIN: [
    { href: '/admin', icon: LayoutDashboard, labelKey: 'admin.nav.dashboard' },
    { href: '/admin/tenants', icon: Building2, labelKey: 'admin.nav.tenants' },
    { href: '/admin/parameters/specialties', icon: Stethoscope, labelKey: 'admin.nav.specialties' },
    { href: '/admin/operators', icon: UserCog, labelKey: 'admin.nav.operators' },
    { href: '/admin/config', icon: Shield, labelKey: 'admin.nav.platformConfig' },
  ],
  OPERATOR: [
    { href: '/admin', icon: LayoutDashboard, labelKey: 'admin.nav.dashboard' },
    { href: '/admin/tenants', icon: Building2, labelKey: 'admin.nav.tenants' },
    { href: '/admin/parameters/specialties', icon: Stethoscope, labelKey: 'admin.nav.specialties' },
  ],
}

// Obtener rol del usuario (desde auth context)
const userRole = user?.user_metadata?.role || 'SUPERADMIN'  // fallback
const allowedNavItems = NAV_ITEMS[userRole] || NAV_ITEMS.SUPERADMIN
```

---

## Validación

- [ ] `/admin/operators` muestra lista de operators
- [ ] `/admin/operators/add` permite invitar con selección múltiple de tenants
- [ ] Sidebar filtra items según rol del usuario
- [ ] i18n funciona correctamente

---

## Notes

- Reutilizar `MultiSelect` existente del proyecto
- El enlace `/admin/operators/add` debe estar protegido (solo SUPERADMIN)
- specialties en sidebar OPERATOR = solo lectura (implementar en fase de permisos)