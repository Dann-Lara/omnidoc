# 05-Tenants Directory - Directorio de Tenants SaaS

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 02-admin/05-tenants-directory |
| **Estado** | 🔄 En Desarrollo |
| **Preview** | HTML proporcionado por usuario |

---

## 🎯 Propósito

Crear la página de directorio de tenants en el módulo SaaS (admin) para visualizar y administrar las organizaciones/clínicas registradas en la plataforma.

---

## 1. Estructura de Archivos

```
apps/web/src/app/admin/tenants/
├── page.tsx              # Página principal
├── loading.tsx           # Loading skeleton
└── components/
    ├── TenantTable.tsx    # Componente tabla
    ├── TenantFilters.tsx   # Componente filtros
    └── TenantKPIs.tsx       # Componente KPIs
```

---

## 2. API Endpoints

| Método | Endpoint | Query Params | Descripción |
|--------|----------|------------|------------|
| GET | `/admin/tenants` | `page, limit, status, plan, search` | Listado paginado |
| GET | `/admin/tenants/stats` | - | KPIs aggregated |
| GET | `/admin/tenants/:id` | - | Detail tenant |
| PUT | `/admin/tenants/:id/status` | `status: ACTIVE\|SUSPENDED` | Toggle estado |

### Response Types

```typescript
interface Tenant {
  id: string;
  name: string;
  slug: string;
  planName: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  planPrice: number;
  mrr: number;
  usersCount: number;
  status: 'TRIALING' | 'ACTIVE' | 'SUSPENDED' | 'CANCELED';
  createdAt: Date;
}

interface TenantsResponse {
  data: Tenant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TenantStats {
  totalTenants: number;
  tenantsGrowth: number;
  totalMRR: number;
  mrrGrowth: number;
  activeUsers: number;
  churnRiskCount: number;
}
```

---

## 3. Database - Prisma Queries

```typescript
// apps/api/src/admin/tenants/tenants.service.ts

async function getTenants({ page = 1, limit = 10, status, plan, search }) {
  const where = {};
  if (status && status !== 'ALL') where.subscriptionStatus = status;
  if (plan && plan !== 'ALL') where.plan = { name: plan };
  if (search) where.name = { contains: search, mode: 'insensitive' };

  const [data, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { users: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.organization.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

async function getTenantStats() {
  const [totalTenants, activeTenants, totalMRR, activeUsers, churnRisk] = await Promise.all([
    prisma.organization.count(),
    prisma.organization.count({ where: { subscriptionStatus: 'ACTIVE' } }),
    prisma.organization.aggregate({ where: { subscriptionStatus: 'ACTIVE' }, _sum: { features: true } }),
    prisma.user.count({ where: {} }),
    prisma.organization.count({ where: { subscriptionStatus: 'SUSPENDED' } }),
  ]);

  return {
    totalTenants,
    totalMRR: totalMRR._sum.features || 0,
    activeUsers,
    churnRiskCount: churnRisk,
  };
}
```

---

## 4. Diseño Visual Completo

```
┌──────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                             │
│  ┌────────────────────────────────────┐  ┌───────────────────────┐ │
│  │ Label: Organization Registry         │  │ [Export] [+Create New] │ │
│  │ Title: Tenant Directory          │  └───────────────────────┘ │
│  └────────────────────────────────────┘                            │
├──────────────────────────────────────────────────────────────────────────┤
│  KPIs (grid-cols-4 gap-6 mb-12)                                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐│
│  │ TOTAL      │ │ MRR        │ │ ACTIVE     │ │ CHURN     ││
│  │ TENANTS    │ │RECURRING   │ │ USERS      │ │ RISK      ││
│  │ 1,284     │ │ $428.5k   │ │ 42.1k     │ │ 12       ││
│  │ +4.2%     │ │ +12%      │ │ ACTIVE     │ │ HIGH ⚠️  ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘│
├──────────────────────────────────────────────────────────────────────────┤
│  FILTERS BAR (px-8 py-5 bg-surface-container-low)                   │
│  Filter By: [All Statuses ▼] [All Plans ▼]      Showing 1-10 of N │
├──────────────────────────────────────────────────────────────────────────┤
│  TABLE (overflow-x-auto)                                            │
│  ┌─────────┬──────┬────────┬──────┬─────────┬──────────┐               │
│  │CLINIC  │PLAN  │ MRR   │USERS │STATUS  │ ACTIONS │               │
│  ├─────────┼──────┼────────┼──────┼─────────┼──────────┤               │
│  │ Mayo   │Ent.  │$12,450│1,240 │ Active │ 👁  🛑  │               │
│  │ Summit │Pro   │$4,800 │ 412  │Trialing│ 👁  🛑  │               │
│  │Blue D. │Star. │$1,200 │  89  │Suspend │ 👁  ✓   │               │
│  └─────────┴──────┴────────┴──────┴─────────┴──────────┘               │
├──────────────────────────────────────────────────────────────────────────┤
│  PAGINATION (flex justify-between)                               │
│  [<] [1] [2] [3] [...] [128] [>]      Total MRR: $428,512.00      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Componentes de UI

### TenantKPIs.tsx

```tsx
interface TenantKPIsProps {
  stats: {
    totalTenants: number;
    totalMRR: number;
    activeUsers: number;
    churnRiskCount: number;
  };
}

export function TenantKPIs({ stats }: TenantKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <KpiCard title="Total Tenants" value={stats.totalTenants} trend="+4.2%" />
      <KpiCard title="Monthly Recurring" value={`$${stats.totalMRR / 1000}k`} trend="+12%" />
      <KpiCard title="Active Users" value={stats.activeUsers} badge="Active" />
      <KpiCard title="Churn Risk" value={stats.churnRiskCount} risk="high" />
    </div>
  );
}
```

### TenantTable.tsx

```tsx
interface TenantTableProps {
  tenants: Tenant[];
}

export function TenantTable({ tenants }: TenantTableProps) {
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-surface-container border-b border-surface-container">
          <th className="px-8 py-4 text-xs uppercase tracking-widest font-bold text-outline">Clinic Name</th>
          <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-outline">Plan</th>
          <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-outline">MRR</th>
          <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-outline">Users</th>
          <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-outline">Status</th>
          <th className="px-8 py-4 text-xs uppercase tracking-widest font-bold text-outline text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {tenants.map((tenant) => (
          <tr key={tenant.id} className="hover:bg-surface-container-low">
            <td className="px-8 py-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {tenant.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold">{tenant.name}</p>
                  <p className="text-xs text-outline">ID: {tenant.slug}</p>
                </div>
              </div>
            </td>
            <td className="px-6 py-5">
              <PlanBadge plan={tenant.planName} />
            </td>
            <td className="px-6 py-5 font-semibold">${tenant.mrr.toLocaleString()}</td>
            <td className="px-6 py-5">{tenant.usersCount}</td>
            <td className="px-6 py-5">
              <StatusBadge status={tenant.status} />
            </td>
            <td className="px-8 py-5 text-right">
              <div className="flex items-center justify-end gap-2">
                <ActionButton icon="visibility" href={`/admin/tenants/${tenant.id}`} />
                <ActionButton icon={tenant.status === 'ACTIVE' ? 'block' : 'check_circle'} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### TenantFilters.tsx

```tsx
interface TenantFiltersProps {
  status: string;
  plan: string;
}

export function TenantFilters({ status, plan }: TenantFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <select className="bg-transparent border-none focus:ring-0 text-sm font-semibold">
        <option value="ALL">All Statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="TRIALING">Trialing</option>
        <option value="SUSPENDED">Suspended</option>
      </select>
      <select className="bg-transparent border-none focus:ring-0 text-sm font-semibold">
        <option value="ALL">All Plans</option>
        <option value="ENTERPRISE">Enterprise</option>
        <option value="PRO">Pro</option>
        <option value="STARTER">Starter</option>
      </select>
    </div>
  );
}
```

---

## 6. Página Principal

```tsx
// apps/web/src/app/admin/tenants/page.tsx

export default async function TenantsPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string; plan?: string; search?: string }
}) {
  const page = parseInt(searchParams.page) || 1;
  const limit = 10;

  const [tenants, stats] = await Promise.all([
    fetchTenants({ page, limit, status: searchParams.status, plan: searchParams.plan }),
    fetchTenantStats(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="label-sm text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Organization Registry</span>
          <h1 className="text-4xl font-extrabold text-primary tracking-tighter mt-1">Tenant Directory</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 rounded-full bg-surface-container-low">Export Report</button>
          <button className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-container text-white">Create New Clinic</button>
        </div>
      </div>

      {/* KPIs */}
      <TenantKPIs stats={stats} />

      {/* Filters & Table */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden">
        <TenantFilters status={searchParams.status} plan={searchParams.plan} />
        <TenantTable tenants={tenants.data} />
        <Pagination total={tenants.total} page={page} limit={limit} />
      </div>
    </div>
  );
}
```

---

## 7. Checklist de Implementación

- [ ] Crear `apps/api/src/admin/tenants/` (controller, service, module)
- [ ] GET `/admin/tenants` endpoint
- [ ] GET `/admin/tenants/stats` endpoint
- [ ] Crear page `apps/web/src/app/admin/tenants/page.tsx`
- [ ] Crear componente `TenantKPIs.tsx`
- [ ] Crear componente `TenantFilters.tsx`
- [ ] Crear componente `TenantTable.tsx`
- [ ] Integrar datos desde API
- [ ] Verificar paginación
- [ ] Verificar filtros

---

## ✅ Criterios de Aceptación

- [ ] Página carga correctamente en `/admin/tenants`
- [ ] Muestra 4 KPIs con datos reales
- [ ] Table muestra tenants con columns correctos
- [ ] Filtros funcionan (status, plan)
- [ ] Paginación funciona
- [ ] Actions (View, Block/Activate) funcionan
- [ ] Diseño visual coincide con HTML proporcionado

---

## 🔗 Dependencias

- [02-admin/01-layout.md](./01-layout.md)
- [02-admin/02-sidebar.md](./02-sidebar.md)
- [02-admin/03-navbar.md](./03-navbar.md)
- [06-security.md](../00-global/06-security.md)