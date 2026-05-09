# 08-Pharmacy: 02-API - Endpoints NestJS

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 08-pharmacy/02-api |
| **Estado** | ✅ Completado |
| **Módulo** | `apps/api/src/pharmacy/` |

---

## 🎯 Propósito

Documentar los endpoints de la API NestJS para gestión de farmacia e inventario, siguiendo las convenciones de los módulos existentes (patients, appointments, team).

---

## 🔌 API Endpoints (12+ endpoints)

### Product Library (Catálogo Maestro - SaaS Admin)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/pharmacy/products` | Listar catálogo maestro (paginado, search) | SUPERADMIN |
| GET | `/pharmacy/products/:id` | Detalle de producto maestro | SUPERADMIN |
| POST | `/pharmacy/products` | Crear producto en catálogo | SUPERADMIN |
| PATCH | `/pharmacy/products/:id` | Editar metadatos maestros | SUPERADMIN |
| DELETE | `/pharmacy/products/:id` | Desactivar producto (soft delete) | SUPERADMIN |

### Inventory Batches (Por Tenant)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/pharmacy/inventory` | Listar inventario del tenant (group by product) | Autenticado |
| GET | `/pharmacy/inventory/:productId` | Detalle de producto + lotes | Autenticado |
| POST | `/pharmacy/inventory/restock` | Reabastecer (nuevo lote o +cantidad) | OWNER o COLLABORATOR* |
| PATCH | `/pharmacy/inventory/adjust` | Ajuste manual (solo OWNER, requiere reason) | OWNER only |
| GET | `/pharmacy/batches/expiring` | Lotes por vencer (<90 días) | Autenticado |

### Dispensing (Despacho Clínico)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/pharmacy/dispens` | Despachar medicamento (FEFO) | OWNER o COLLABORATOR* |
| GET | `/pharmacy/dispens/history` | Historial de despachos | Autenticado |

### Dashboard & Intelligence

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/pharmacy/dashboard/summary` | KPIs: total stock, expiring, security stock | Autenticado |
| GET | `/pharmacy/dashboard/security-stock` | Stock de seguridad dinámico (30 días) | Autenticado |
| GET | `/pharmacy/dashboard/procurement` | Prioridad de compra (<7 días) | Autenticado |
| GET | `/pharmacy/dashboard/alternatives` | Sustitutos por misma sustancia activa | Autenticado |

*Según permisos configurados en `/profile/user-types`

---

## 📁 Estructura de Archivos (API)

```
apps/api/src/pharmacy/
├── pharmacy.module.ts
├── product-library/
│   ├── product-library.controller.ts
│   ├── product-library.service.ts
│   ├── product-library.module.ts
│   ├── dto/
│   │   ├── create-product.dto.ts
│   │   └── update-product.dto.ts
│   └── product-library.controller.spec.ts
├── inventory/
│   ├── inventory.controller.ts
│   ├── inventory.service.ts
│   ├── inventory.module.ts
│   ├── dto/
│   │   ├── restock.dto.ts
│   │   └── adjust-stock.dto.ts
│   └── inventory.controller.spec.ts
├── batches/
│   ├── batches.controller.ts
│   ├── batches.service.ts
│   ├── batches.module.ts
│   └── dto/
│       └── expiring-query.dto.ts
├── dispensing/
│   ├── dispensing.service.ts
│   ├── dispensing.module.ts
│   ├── fefo.strategy.ts
│   └── dto/
│       └── dispense.dto.ts
├── dashboard/
│   ├── dashboard.service.ts
│   ├── dashboard.module.ts
│   └── dto/
│       └── dashboard-queries.dto.ts
└── entities/
    ├── product-library.entity.ts
    ├── inventory-batch.entity.ts
    └── inventory-log.entity.ts
```

---

## 📋 DTOs (Data Transfer Objects)

### CreateProductDto

```typescript
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  commercialName: string

  @IsString()
  @IsNotEmpty()
  activeSubstance: string

  @IsString()
  @IsNotEmpty()
  presentation: string

  @IsString()
  @IsNotEmpty()
  laboratory: string

  @IsString()
  @IsOptional()
  barcode?: string
}
```

### RestockDto (Entrada de Lote)

```typescript
export class RestockDto {
  @IsString()
  @IsNotEmpty()
  productId: string

  @IsNumber()
  @Min(1)
  quantity: number

  @IsDate()
  @Type(() => Date)
  expiryDate: Date

  @IsString()
  @IsOptional()
  batchNumber?: string
}
```

### DispenseDto (Despacho)

```typescript
export class DispenseDto {
  @IsString()
  @IsNotEmpty()
  patientId: string

  @IsString()
  @IsNotEmpty()
  noteId: string  // PatientNote ID

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DispenseItemDto)
  medications: DispenseItemDto[]
}

export class DispenseItemDto {
  @IsString()
  productId: string

  @IsNumber()
  @Min(1)
  quantity: number
}
```

### AdjustStockDto (Ajuste Manual - Solo Owner)

```typescript
export class AdjustStockDto {
  @IsString()
  @IsNotEmpty()
  batchId: string

  @IsNumber()
  @Min(1)
  quantity: number  // Siempre positivo, el servicio decide + o -

  @IsString()
  @IsNotEmpty()
  reason: string  // Justificación obligatoria

  @IsEnum(LogType)
  type: LogType = LogType.ADJUSTED
}
```

---

## 🔐 Guards y Permisos

### Validación de User-Types (Profile)

Los permisos se validan contra la configuración en `/profile/user-types`:

```typescript
// Ejemplo: verificar si colaborador puede despachar
async canDispense(user: User): Promise<boolean> {
  const userTypePermissions = user.permissions || {}
  
  // Owner siempre tiene permiso total
  if (user.isTenantAdmin) return true
  
  // Colaborador: verificar permiso granular
  return userTypePermissions['pharmacy.dispens'] === true
}
```

**Permisos granulares sugeridos para user-types:**
- `pharmacy.read` - Lectura de stock
- `pharmacy.dispens` - Ejecución de despacho
- `pharmacy.restock` - Registro de entrada de lotes
- `pharmacy.adjust` - Ajuste manual (solo Owner por defecto)

---

## 🎯 Lógica FEFO (First Expired, First Out)

Implementada en `dispensing/fefo.strategy.ts`:

```typescript
@Injectable()
export class FefoStrategy {
  async dispense(productId: string, quantity: number, tenantId: string) {
    // 1. Obtener lotes ordenados por expiryDate ASC
    const batches = await this.prisma.inventoryBatch.findMany({
      where: {
        tenantId,
        productId,
        quantity: { gt: 0 },
      },
      orderBy: { expiryDate: 'asc' }, // CRÍTICO: FEFO
    })

    let remaining = quantity
    const dispensed = []

    // 2. Descontar del lote más antiguo primero
    for (const batch of batches) {
      if (remaining <= 0) break

      const deduct = Math.min(batch.quantity, remaining)
      batch.quantity -= deduct
      remaining -= deduct

      await this.prisma.inventoryBatch.update({
        where: { id: batch.id },
        data: { quantity: batch.quantity },
      })

      dispensed.push({ batchId: batch.id, quantity: deduct })
    }

    // 3. Verificar si se pudo cubrir toda la cantidad
    if (remaining > 0) {
      throw new BadRequestException('Stock insuficiente: faltan ' + remaining + ' unidades')
    }

    return dispensed
  }
}
```

---

## 📊 Cálculo de Stock de Seguridad (Dashboard)

```typescript
// Stock de seguridad = promedio consumo últimos 30 días * 7 días
async getSecurityStock(tenantId: string, productId: string) {
  const thirtyDaysAgo = subDays(new Date(), 30)
  
  const logs = await this.prisma.inventoryLog.groupBy({
    by: ['productId'],
    where: {
      tenantId,
      productId,
      type: 'DISPENSED',
      createdAt: { gte: thirtyDaysAgo },
    },
    _sum: { quantity: true },
  })

  const totalDispensed = logs[0]?._sum.quantity || 0
  const dailyAvg = totalDispensed / 30
  const securityStock = Math.ceil(dailyAvg * 7)  // 7 días proyectados

  return {
    currentStock: await this.getTotalStock(tenantId, productId),
    securityStock,
    isBelowThreshold: currentStock < securityStock,
  }
}
```

---

## 📋 Criterios de Aceptación (API)

### AC 1: Gestión de Identidad
- [x] GET `/pharmacy/products` con paginación y búsqueda
- [x] POST `/pharmacy/products` valida campos obligatorios
- [x] PATCH `/pharmacy/products/:id` no afecta stock existente

### AC 2: Gestión de Existencias
- [x] POST `/pharmacy/inventory/restock` crea/actualiza lote
- [x] Inventario incremental (sumar a lote existente)
- [x] Múltiples lotes activos por product_id + tenant

### AC 3: Despacho Clínico
- [x] POST `/pharmacy/dispens` aplica FEFO obligatoriamente
- [x] Descuento secuencial si un lote es insuficiente
- [x] InventoryLog generado con patient_id, doctor_id, cantidad

### AC 4: Inteligencia de Datos
- [x] GET `/pharmacy/dashboard/security-stock` calcula stock dinámico
- [x] GET `/pharmacy/dashboard/procurement` prioriza compra (<7 días)
- [x] GET `/pharmacy/batches/expiring` categoriza por 30/60/90 días
- [ ] GET `/pharmacy/dashboard/alternatives` busca misma sustancia activa (pendiente)

### AC 5: Seguridad y Roles
- [x] Todas las consultas filtradas por tenant_id
- [x] Validación de permisos contra user-types
- [x] Ajuste manual requiere reason y solo Owner

### AC 6: Validaciones
- [x] Indicador booleano disponibilidad al recetar
- [x] Bloqueo despacho si stock total < cantidad solicitada
- [ ] Barcode scanning en restock (opcional, pendiente)

---

## 🔗 Dependencias

- `01-schema/README.md` - Modelos Prisma
- `01-auth/02-backend.md` - Guards y autenticación
- `06-profile/02-backend.md` - User-types para permisos
- `nestjs-best-practices` skill

---

## ✅ Estado

API completada. Endpoints operativos en `/pharmacy/*` con lógica FEFO y filtrado por tenant.
