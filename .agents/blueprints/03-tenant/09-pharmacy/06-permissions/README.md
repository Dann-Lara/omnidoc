# 08-Pharmacy: 06-Permissions - Roles y Seguridad

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 08-pharmacy/06-permissions |
| **Estado** | ✅ Completado |
| **Depende de** | `06-profile/05-signup-update.md` (user-types) |

---

## 🎯 Propósito

Definir el sistema de permisos granulares para el módulo de farmacia, integrándose con el sistema de `user-types` existente en `/profile/user-types`.

---

## 👥 Roles y Permisos

### 1. Owner (Administrador de la Clínica)

**Permisos totales:**
- ✅ Lectura de stock (inventory read)
- ✅ Ejecución de despacho (dispense)
- ✅ Registro de entrada de lotes (restock)
- ✅ Ajuste manual de inventario (adjust) - **REQUIERE JUSTIFICACIÓN**
- ✅ Gestión de user-types para colaboradores

**Configuración:** Automático para `isTenantAdmin: true` en el modelo User.

---

### 2. Collaborator (Colaborador Médico)

**Permisos granulares (configurables en user-types):**

| Permiso | Clave en `User.permissions` | Default | Descripción |
|---------|-------------------------------|---------|-------------|
| Lectura de stock | `pharmacy.read` | ✅ TRUE | Ver inventario y lotes |
| Ejecución de despacho | `pharmacy.dispense` | ⚠️ Configurable | Despachar medicamentos (FEFO) |
| Registro de entrada de lotes | `pharmacy.restock` | ⚠️ Configurable | Dar entrada a nuevos lotes |
| Ajuste manual | `pharmacy.adjust` | ❌ FALSE | Ajuste manual (solo Owner recomendado) |

**Configuración:** Se edita en `/[slug]/profile/user-types`

---

## 🔐 Implementación en Backend

### Validación de Permisos en Guards

```typescript
// pharmacy/guards/pharmacy-permissions.guard.ts
@Injectable()
export class PharmacyPermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>('pharmacyPermission', context.getHandler())
    if (!requiredPermission) return true

    const request = context.switchToHttp().getRequest()
    const user = request.user

    // Owner siempre tiene acceso
    if (user.isTenantAdmin) return true

    // Verificar permisos del user-type
    const userPermissions = user.permissions || {}
    if (userPermissions[requiredPermission] === true) return true

    throw new ForbiddenException(`No tienes permiso para: ${requiredPermission}`)
  }
}
```

### Uso en Controllers

```typescript
// pharmacy/inventory/inventory.controller.ts
@Post('restock')
@UseGuards(PharmacyPermissionsGuard)
@PharmacyPermission('pharmacy.restock')  // Solo si tiene este permiso
async restock(@Body() dto: RestockDto, @Req() req) {
  return await this.inventoryService.restock(req.user.organizationId, dto)
}

@Post('dispense')
@UseGuards(PharmacyPermissionsGuard)
@PharmacyPermission('pharmacy.dispense')
async dispense(@Body() dto: DispenseDto, @Req() req) {
  return await this.fefoStrategy.dispense(...)
}

@Patch('adjust')
@UseGuards(PharmacyPermissionsGuard)
@PharmacyPermission('pharmacy.adjust')
async adjustStock(@Body() dto: AdjustStockDto, @Req() req) {
  // Solo Owner normalmente, pero validamos por si acaso
  if (!req.user.isTenantAdmin) {
    throw new ForbiddenException('Solo Owner puede ajustar inventario manualmente')
  }
  return await this.inventoryService.adjustStock(req.user.organizationId, dto)
}
```

---

## 🎨 UI para Configuración de Permisos

### En `/[slug]/profile/user-types`

El blueprint `06-profile/05-signup-update.md` ya define la página de user-types. Agregar sección para farmacia:

```tsx
// En user-types/[id]/page.tsx o componente de edición
<div className="space-y-4">
  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">
    {t('userTypes.permissions.pharmacy')}
  </h3>
  
  <div className="space-y-3">
    {[
      { key: 'pharmacy.read', label: t('pharmacy.permissions.read'), default: true },
      { key: 'pharmacy.dispense', label: t('pharmacy.permissions.dispense'), default: false },
      { key: 'pharmacy.restock', label: t('pharmacy.permissions.restock'), default: false },
      { key: 'pharmacy.adjust', label: t('pharmacy.permissions.adjust'), default: false },
    ].map(perm => (
      <label key={perm.key} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
        <div>
          <p className="text-sm font-medium">{perm.label}</p>
          <p className="text-xs text-on-surface-variant">{perm.key}</p>
        </div>
        <input
          type="checkbox"
          defaultChecked={perm.default}
          onChange={(e) => updatePermission(perm.key, e.target.checked)}
          className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
        />
      </label>
    ))}
  </div>
</div>
```

---

## 🔒 Seguridad RLS (Row Level Security)

### Filtrado por tenant_id (OBLIGATORIO)

Todas las consultas de inventario deben incluir `tenantId` en el `where`:

```typescript
// INCORRECTO (peligroso)
const batches = await this.prisma.inventoryBatch.findMany({
  where: { productId }
})

// CORRECTO (seguro)
const batches = await this.prisma.inventoryBatch.findMany({
  where: {
    tenantId: user.organizationId,  // SIEMPRE filtrar por tenant
    productId,
  }
})
```

### Validación en Service Layer

```typescript
// En inventory.service.ts
async getInventory(tenantId: string) {
  // RLS implícito: todas las queries usan tenantId
  return await this.prisma.inventoryBatch.findMany({
    where: { tenantId },
    include: { product: true },
    orderBy: { expiryDate: 'asc' },
  })
}
```

---

## 📋 Criterios de Aceptación (Permissions)

### AC 5.1: Consultas Filtradas por tenant_id
- [x] Todas las queries en API incluyen `tenantId` en `where`
- [x] No es posible acceder a inventario de otro tenant

### AC 5.2: Colaborador - Lectura y Despacho
- [x] `pharmacy.read` permite ver stock
- [x] `pharmacy.dispense` permite ejecutar despacho (si está TRUE)
- [x] Configuración en user-types se respeta

### AC 5.3: Colaborador - Entrada de Lotes
- [x] `pharmacy.restock` permite dar entrada (si está TRUE)
- [x] Si es FALSE, endpoint retorna 403 Forbidden

### AC 5.4: Owner - Permisos Totales
- [x] `isTenantAdmin: true` bypass todos los permisos
- [x] Puede hacer ajustes manuales con justificación
- [x] Justificación (`reason`) obligatoria para ajustes

---

## 🔗 Integración con User-Types Existente

### Estructura de `User.permissions` (JSON)

```json
{
  "pharmacy.read": true,
  "pharmacy.dispense": false,
  "pharmacy.restock": false,
  "pharmacy.adjust": false,
  "team.manage": true,
  "patients.read": true
}
```

### Actualizar en Profile Backend

```typescript
// En profile.service.ts - actualizar permisos
async updateUserTypePermissions(userId: string, permissions: any) {
  // Validar que no se den permisos peligrosos a colaboradores
  if (permissions['pharmacy.adjust'] === true) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user.isTenantAdmin) {
      throw new BadRequestException('Solo Owner puede tener pharmacy.adjust')
    }
  }

  return await this.prisma.user.update({
    where: { id: userId },
    data: { permissions },
  })
}
```

---

## 🔗 Dependencias

- `06-profile/05-signup-update.md` - User-types existente
- `01-auth/02-backend.md` - Guards y autenticación
- `00-global/06-security.md` - Reglas de seguridad
- `02-api/README.md` - Implementación en endpoints

---

## 📝 Notas de Seguridad

1. **NUNCA confiar en el frontend** para validar permisos - siempre validar en backend
2. **Ajustes manuales**: Solo Owner, requiere `reason` obligatorio (auditoría)
3. **RLS por tenant_id**: Filtrado obligatorio en todas las consultas
4. **Logs de auditoría**: InventoryLog debe registrar quién hizo qué
5. **User-types**: Si el user-type se edita, los cambios afectan a todos los usuarios con ese tipo

---

## ✅ Estado

Sistema de permisos completado. Roles Owner/Collaborator operativos con validación contra user-types.
