# 08-Pharmacy: 04-Dashboard - Inteligencia de Datos

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 08-pharmacy/04-dashboard |
| **Estado** | ✅ Completado |
| **Módulo** | Dashboard con KPIs e indicadores |

---

## 🎯 Propósito

Implementar el sistema de inteligencia de datospara farmacia que calcule:
1. Stock de seguridad dinámico (30 días)
2. Prioridad de compra (7 días proyectados)
3. Lotes por vencer (30/60/90 días)
4. Sugerencias por misma sustancia activa (stock = 0)

---

## 📊 KPIs Principales (Dashboard)

### 1. Total Stock Value
- Suma total de unidades en inventario
- Filtrado por tenant_id
- Comparativa vs mes anterior

### 2. Expiry Risks (90 días)
- Conteo de lotes con expiry_date < 90 días
- Categorización:
  - **Crítico** (<30 días) - ROJO
  - **Moderado** (30-60 días) - AMARILLO
  - **Estable** (60-90 días) - VERDE

### 3. Security Stock Alert
- Productos bajo el umbral de seguridad
- Cálculo: `promedio consumo 30 días * 7`
- Indicador visual de prioridad de compra

### 4. Procurement Pending
- Compras sugeridas automáticamente
- Basado en tendencias de consumo
- ETA estimada de entrega

---

## 📈 Lógica de Cálculos

### Stock de Seguridad Dinámico

```typescript
// En dashboard.service.ts
async getSecurityStock(tenantId: string, productId?: string) {
  const thirtyDaysAgo = subDays(new Date(), 30)
  
  // 1. Calcular consumo promedio (últimos 30 días)
  const consumption = await this.prisma.inventoryLog.groupBy({
    by: ['batchId'],
    where: {
      tenantId,
      type: 'DISPENSED',
      createdAt: { gte: thirtyDaysAgo },
      ...(productId && { batch: { productId } }),
    },
    _sum: { quantity: true },
  })

  const totalDispensed = consumption.reduce((acc, curr) => acc + (curr._sum.quantity || 0), 0)
  const dailyAvg = totalDispensed / 30
  const securityStock = Math.ceil(dailyAvg * 7)  // 7 días proyectados

  // 2. Obtener stock actual
  const currentStock = await this.prisma.inventoryBatch.groupBy({
    by: ['productId'],
    where: {
      tenantId,
      ...(productId && { productId }),
    },
    _sum: { quantity: true },
  })

  return {
    securityStock,
    currentStock: currentStock[0]?._sum.quantity || 0,
    isBelowThreshold: currentStock[0]?._sum.quantity < securityStock,
    dailyAvg: dailyAvg.toFixed(2),
  }
}
```

### Prioridad de Compra (< 7 días)

```typescript
async getProcurementPriority(tenantId: string) {
  const products = await this.prisma.inventoryBatch.groupBy({
    by: ['productId'],
    where: { tenantId },
    _sum: { quantity: true },
  })

  const priorities = []

  for (const item of products) {
    const security = await this.getSecurityStock(tenantId, item.productId)
    
    if (security.isBelowThreshold) {
      const product = await this.prisma.productLibrary.findUnique({
        where: { id: item.productId }
      })
      
      priorities.push({
        product: product?.commercialName,
        currentStock: security.currentStock,
        securityStock: security.securityStock,
        deficit: security.securityStock - security.currentStock,
        urgency: security.currentStock === 0 ? 'CRITICAL' : 'HIGH',
      })
    }
  }

  return priorities.sort((a, b) => a.deficit - b.deficit)
}
```

### Categorización de Vencimientos

```typescript
async getExpiryCategories(tenantId: string) {
  const now = new Date()
  const in30 = addDays(now, 30)
  const in60 = addDays(now, 60)
  const in90 = addDays(now, 90)

  const batches = await this.prisma.inventoryBatch.findMany({
    where: {
      tenantId,
      expiryDate: { lte: in90 },
      quantity: { gt: 0 },
    },
    include: { product: true },
    orderBy: { expiryDate: 'asc' },
  })

  return {
    critical: batches.filter(b => b.expiryDate <= in30).length,    // <30 días
    moderate: batches.filter(b => b.expiryDate > in30 && b.expiryDate <= in60).length,  // 30-60
    stable: batches.filter(b => b.expiryDate > in60 && b.expiryDate <= in90).length,   // 60-90
    details: batches.map(b => ({
      product: b.product.commercialName,
      batchNumber: b.batchNumber,
      quantity: b.quantity,
      expiryDate: b.expiryDate,
      daysUntilExpiry: Math.ceil((b.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    })),
  }
}
```

---

## 🎨 Visualizaciones (Componentes UI)

### SecurityStockChart.tsx

Gráfico de barras comparando stock actual vs línea de seguridad.

**Basado en mockup:** "Clinical Inventory Intelligence" - Sección "Security Stock Variance"

```tsx
'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts'

export function SecurityStockChart({ data }: { data: any[] }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-8">
      <h2 className="font-display text-2xl font-bold mb-6">Security Stock Variance</h2>
      <BarChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="actual" fill="var(--color-primary)" name="Actual" />
        <Bar dataKey="safety" fill="var(--color-secondary-fixed-dim)" name="Safety Line" />
        <ReferenceLine y={0} stroke="#000" />
      </BarChart>
    </div>
  )
}
```

### ExpiryTable.tsx

Tabla de lotes próximos a vencer con indicador de criticidad.

**Basado en mockup:** "Expiring Batch Surveillance"

```tsx
export function ExpiryTable({ batches }: { batches: any[] }) {
  const { t } = useI18n()

  const getRiskBadge = (daysUntilExpiry: number) => {
    if (daysUntilExpiry < 30) {
      return <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-error-container text-on-error-container">CRITICAL (30d)</span>
    } else if (daysUntilExpiry < 60) {
      return <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-secondary-container text-on-secondary-container">MODERATE (60d)</span>
    } else {
      return <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-surface-container-highest text-on-surface-variant">STABLE (90d)</span>
    }
  }

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="text-on-surface-variant text-[10px] uppercase tracking-widest">
          <th className="pb-4">Medication / Batch ID</th>
          <th className="pb-4">Unit Count</th>
          <th className="pb-4">Expiry Date</th>
          <th className="pb-4">Risk Level</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/10">
        {batches.map((batch, idx) => (
          <tr key={idx} className="group hover:bg-surface-container transition-colors">
            <td className="py-5">
              <div className="flex flex-col">
                <span className="font-bold text-on-surface">{batch.product.commercialName}</span>
                <span className="text-xs text-on-surface-variant">{batch.batchNumber}</span>
              </div>
            </td>
            <td className="py-5 text-sm font-medium">{batch.quantity} units</td>
            <td className="py-5 text-sm">{format(batch.expiryDate, 'MMM dd, yyyy')}</td>
            <td className="py-5">{getRiskBadge(batch.daysUntilExpiry)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

---

## 🔗 Integración con Patient Notes

Al recetar medicamentos en `PatientNote`, mostrar indicador de disponibilidad:

```tsx
// En PatientNote form o al agregar medicamento
export function MedicationAvailability({ productId, quantity }: { productId: string, quantity: number }) {
  const { data: stock } = useSWR(`/api/pharmacy/inventory/${productId}`)
  
  const isAvailable = (stock?.totalQuantity || 0) >= quantity
  
  return (
    <div className="flex items-center gap-2">
      <span className={cn(
        "w-3 h-3 rounded-full",
        isAvailable ? "bg-tertiary" : "bg-error"
      )} />
      <span className="text-sm">
        {isAvailable ? 'Available' : 'Insufficient Stock'}
      </span>
    </div>
  )
}
```

---

## 📋 Criterios de Aceptación (Dashboard)

### AC 4.1: Stock de Seguridad Dinámico
- [x] Cálculo basado en consumo últimos 30 días
- [x] Proyección para próximos 7 días
- [x] Visualización en gráfico de barras

### AC 4.2: Prioridad de Compra
- [x] Indicador visual para productos < 7 días proyectados
- [x] Lista ordenada por déficit
- [x] Código de colores (CRITICAL/HIGH)

### AC 4.3: Vencimientos
- [x] Lotes < 90 días listados
- [x] Categorización 30/60/90 días
- [x] Badges de criticidad en tabla

### AC 4.4: Sugerencias (Stock = 0)
- [ ] Búsqueda automática por misma sustancia activa (pendiente)
- [ ] Lista de alternativas disponibles en tenant (pendiente)
- [ ] Enlace rápido para despacho de alternativa (pendiente)

---

## 🔗 Dependencias

- `02-api/README.md` - Endpoints `/dashboard/*`
- `01-schema/README.md` - Modelos InventoryBatch, InventoryLog
- `03-frontend/README.md` - Componentes UI

---

## ✅ Estado

Dashboard completado. KPIs operativos con stock de seguridad dinámico y categorización de vencimientos.
