# Blueprint: Fase 4 - Permisos y Restricciones (OPERATOR)

**Objetivo**: Implementar control de acceso y restricciones específicas para el rol OPERATOR.

---

## 1. Matrix de Permisos

| Recurso | SUPERADMIN | OPERATOR |
|---------|-----------|----------|
| `/admin` (dashboard) | ✅ | ✅ |
| `/admin/tenants` | Todos | Solo sus tenantIds |
| `/admin/tenants/:id` | Todos | Solo sus tenantIds |
| `/admin/parameters/specialties` | CRUD | Solo lectura |
| `/admin/parameters/specialties/:id` | CRUD | Solo lectura |
| `/admin/operators` | CRUD | ❌ |
| `/admin/operators/add` | CRUD | ❌ |
| `/admin/settings` | ✅ | ❌ |
| `/admin/config` | ✅ | ❌ |
| `/admin/audits` | Todos | Solo sus tenants |
| `/admin/profile` | ✅ | ✅ |

---

## 2. Backend: Guards

### 2.1 IsSuperadminGuard

### Archivo: `apps/api/src/auth/guards/is-superadmin.guard.ts`

```typescript
@Injectable()
export class IsSuperadminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user
    return user?.user_metadata?.role === 'SUPERADMIN'
  }
}
```

### 2.2 IsOperatorGuard

```typescript
@Injectable()
export class IsOperatorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user
    const role = user?.user_metadata?.role
    return role === 'SUPERADMIN' || role === 'OPERATOR'
  }
}
```

### 2.3 Aplicar en OperatorsController

```typescript
@ApiTags('admin - operators')
@Controller('admin/operators')
@UseGuards(IsSuperadminGuard)  // Solo superadmin puede acceder
export class OperatorsController {
  // ...
}
```

---

## 3. Backend: Filter en Tenants

### Archivo: `apps/api/src/admin/tenants/tenants.service.ts`

```typescript
async getTenants(filters: TenantsFilters & { userRole: string; userId: string }) {
  const where: Prisma.OrganizationWhereInput = {}
  
  // Si es OPERATOR, filtrar solo sus tenants
  if (filters.userRole === 'OPERATOR') {
    const operator = await this.prisma.user.findUnique({
      where: { id: filters.userId },
      include: { tenantAssignments: true },
    })
    const tenantIds = operator?.tenantAssignments.map(t => t.tenantId) || []
    
    if (tenantIds.length === 0) {
      return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
    }
    
    where.id = { in: tenantIds }
  }
  
  // ... resto de filtros
}
```

---

## 4. Backend: Filter en Audits

### Archivo: `apps/api/src/admin/audits/audits.service.ts`

```typescript
async getAudits(filters: { userRole: string; userId: string }) {
  const where: Prisma.AuditLogWhereInput = {}
  
  if (filters.userRole === 'OPERATOR') {
    const operator = await this.prisma.user.findUnique({
      where: { id: filters.userId },
      include: { tenantAssignments: true },
    })
    const tenantIds = operator?.tenantAssignments.map(t => t.tenantId) || []
    
    where.organizationId = { in: tenantIds }
  }
  
  return this.prisma.auditLog.findMany({ where, take: 50, orderBy: { createdAt: 'desc' } })
}
```

---

## 5. Frontend: Routing Protection

### 5.1 Middleware de protección

### Archivo: `apps/web/src/middleware.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userRole = request.cookies.get('user_role')?.value
  const path = request.nextUrl.pathname
  
  // OPERATOR no puede acceder a operators
  if (path.startsWith('/admin/operators') && userRole === 'OPERATOR') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }
  
  // OPERATOR no puede acceder a settings
  if (path === '/admin/settings' && userRole === 'OPERATOR') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }
  
  // OPERATOR no puede acceder a config
  if (path.startsWith('/admin/config') && userRole === 'OPERATOR') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

---

## 6. Frontend: Specialties - Solo Lectura

### Archivo: `apps/web/src/app/admin/parameters/specialties/page.tsx`

```typescript
// Ocultar botones add/edit/delete para OPERATOR
const canEdit = userRole === 'SUPERADMIN'

{
  /* Tabla de especialidades */
}

{canEdit && (
  <a href="/admin/parameters/specialties/new" className="...">
    {t('admin.specialties.newSpecialty')}
  </a>
)}
```

---

## 7. API: Proteger Endpoints

### `/admin/operators/*` - Solo SUPERADMIN

```typescript
@Controller('admin/operators')
@UseGuards(IsSuperadminGuard)
export class OperatorsController {}
```

### `/admin/settings` - Solo SUPERADMIN

```typescript
@Controller('admin/settings')
@UseGuards(IsSuperadminGuard)
export class SettingsController {}
```

---

## Validación

- [ ] OPERATOR no puede ver `/admin/operators`
- [ ] OPERATOR solo ve sus tenants en `/admin/tenants`
- [ ] OPERATOR no puede modificar specialties
- [ ] OPERATOR no puede ver settings
- [ ] Audits filtrados por tenantIds

---

## Notes

- Verificar que el middleware funcione con cookies de auth
-El filter de tenants debe ser opt-in (por userRole) para no romper SUPERADMIN
- specialties solo lectura = quitar botones, pero API también debe filtrar en backend