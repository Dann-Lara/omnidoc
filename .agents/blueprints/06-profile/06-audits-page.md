# 06-Profile - Página de Auditorías (Mock)

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 06-profile/06-audits-page |
| **Estado** | ⏳ Pendiente |

---

## 🎯 Propósito

Crear página de auditorías para:
- **Admin**: Ver logs del sistema
- **Tenant**: Ver logs de su organización

**Nota**: Por ahora es mock/simulación - funcionalidad real a futuro.

---

## 📋 Rutas

| Rol | Ruta | Descripción |
|-----|------|-------------|
| Superadmin/Operator | `/admin/audits` | Logs globales del sistema |
| Tenant | `/[slug]/audits` | Logs de su organización |

---

## 🎨 UX/UI - Admin Audits

```
┌─────────────────────────────────────────────────────────────┐
│  [Title: System-Wide Access Logs]    [Filters ▼] [Export] │
├─────────────────────────────────────────────────────────────┤
│  [Search: Search logs...]                                   │
├─────────────────────────────────────────────────────────────┤
│  Tablas: [All] [Auth] [Data] [Billing] [Security]          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐     │
│  │ Timestamp    │ Action        │ Entity  │ User      │     │
│  ├─────────────────────────────────────────────────────┤     │
│  │ 2026-04-08  │ User Login    │ Auth    │ admin@... │     │
│  │ 14:32:05    │               │         │           │     │
│  ├─────────────────────────────────────────────────────┤     │
│  │ 2026-04-08  │ Patient       │ Data    │ dr.smith  │     │
│  │ 14:28:12    │ Created       │         │           │     │
│  ├─────────────────────────────────────────────────────┤     │
│  │ 2026-04-08  │ Org Settings │ Config  │ operator  │     │
│  │ 14:15:00    │ Updated       │         │           │     │
│  └─────────────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────────┤
│  [< Prev]  Page 1 of 24  [Next >]                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 UX/UI - Tenant Audits

```
┌─────────────────────────────────────────────────────────────┐
│  [Title: Activity Logs]              [Search] [Export]     │
├─────────────────────────────────────────────────────────────┤
│  Tablas: [All] [Appointments] [Patients] [Team]            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐     │
│  │ Timestamp    │ Action        │ Details              │     │
│  ├─────────────────────────────────────────────────────┤     │
│  │ 2026-04-08  │ Appointment   │ Created: #APT-001    │     │
│  │ 14:32:05    │ Created       │ Dr. Smith            │     │
│  ├─────────────────────────────────────────────────────┤     │
│  │ 2026-04-08  │ Patient       │ Updated: John Doe    │     │
│  │ 14:28:12    │ Updated       │                      │     │
│  ├─────────────────────────────────────────────────────┤     │
│  │ 2026-04-08  │ Team Member   │ Invitation sent      │     │
│  │ 14:15:00    │ Invited       │ to john@clinic.com   │     │
│  └─────────────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────────┤
│  [< Prev]  Page 1 of 5  [Next >]                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Componentes Requeridos

### Filters (Admin)
- Date range picker
- Action type dropdown
- User dropdown
- Entity type tabs

### Search
- Full-text search en logs

### Table
- Sortable columns
- Pagination
- Row click → detail modal

---

## 📋 Datos Mock - Admin

```typescript
const adminAuditLogs = [
  {
    id: 'log_001',
    timestamp: '2026-04-08T14:32:05Z',
    action: 'USER_LOGIN',
    resourceType: 'AUTH',
    resourceId: 'user_123',
    userEmail: 'superadmin@omnidoc.dev',
    details: 'Successful login from 192.168.1.1',
  },
  {
    id: 'log_002',
    timestamp: '2026-04-08T14:28:12Z',
    action: 'PATIENT_CREATED',
    resourceType: 'DATA',
    resourceId: 'pat_456',
    userEmail: 'dr.smith@clinic.com',
    details: 'Created patient record: John Doe',
  },
  // ...
]
```

## 📋 Datos Mock - Tenant

```typescript
const tenantAuditLogs = [
  {
    id: 'log_001',
    timestamp: '2026-04-08T14:32:05Z',
    action: 'APPOINTMENT_CREATED',
    resourceType: 'APPOINTMENT',
    resourceId: 'apt_001',
    userEmail: 'dr.smith@clinic.com',
    details: 'Scheduled: 2026-04-10T10:00:00',
  },
  {
    id: 'log_002',
    timestamp: '2026-04-08T14:28:12Z',
    action: 'PATIENT_UPDATED',
    resourceType: 'PATIENT',
    resourceId: 'pat_456',
    userEmail: 'nurse@clinic.com',
    details: 'Updated contact info',
  },
  // ...
]
```

---

## ⚠️ Pendiente (A Futuro)

1. **API real**: Conectar a endpoint `/audits` con paginación
2. **Filtros**: Implementar en backend
3. **Export**: CSV/JSON download
4. **Search**: Búsqueda full-text
5. **Detail modal**: Ver detalles completos de cada log

---

## 🔗 Navegación

### Sidebar - Admin
```
/admin              → Dashboard
/admin/tenants     → Tenant Directory
/admin/operators    → Operator Management
/admin/users       → Users
/admin/audits      → ** NUEVO** System Logs
/admin/profile     → My Profile
```

### Sidebar - Tenant
```
/[slug]/dashboard       → Dashboard
/[slug]/dashboard/...   → Calendar, Metrics, Team, Settings
/[slug]/audits         → ** NUEVO** Activity Logs
/[slug]/profile        → My Profile
```

---

## ✅ Criterios de Aceptación

- [ ] Ruta accesible desde sidebar
- [ ] Tabla muestra datos mock
- [ ] Pagination funcional (UI)
- [ ] Tabs/ filtros visibles pero sin función (por ahora)
- [ ] Search input visible pero sin función (por ahora)
- [ ] Layout responsive
- [ ] i18n funcional (es/en)
