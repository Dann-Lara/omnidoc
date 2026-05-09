# 08-Pharmacy: 05-Dispensing - Despacho Clínico (FEFO)

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 08-pharmacy/05-dispensing |
| **Estado** | ✅ Completado |
| **Lógica Crítica** | FEFO (First Expired, First Out) |

---

## 🎯 Propósito

Implementar el sistema de despacho de medicamentos (salida de inventario) que:
1. Se activa mediante `medication_dispensed: true` en PatientNote
2. Aplica lógica FEFO obligatoriamente
3. Descuenta secuencialmente si un lote es insuficiente
4. Genera registro en InventoryLog con auditoría completa

---

## 🔄 Lógica FEFO (First Expired, First Out)

### Definición
El descuento de stock SIEMPRE debe comenzar por el lote con la fecha de caducidad más cercana (expiry_date ASC).

### Algoritmo en `dispensing/fefo.strategy.ts`

```typescript
@Injectable()
export class FefoStrategy {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Despachar medicamentos usando FEFO estricto
   * @param tenantId - ID del tenant
   * @param patientId - ID del paciente
   * @param doctorId - ID del médico (usuario actual)
   * @param noteId - ID de la PatientNote
   * @param items - Array de { productId, quantity }
   */
  async dispense(
    tenantId: string,
    patientId: string,
    doctorId: string,
    noteId: string,
    items: { productId: string; quantity: number }[]
  ) {
    const dispensedItems = []

    for (const item of items) {
      // 1. Obtener lotes ordenados por FEFO (expiry_date ASC)
      const batches = await this.prisma.inventoryBatch.findMany({
        where: {
          tenantId,
          productId: item.productId,
          quantity: { gt: 0 }, // Solo lotes con stock
        },
        orderBy: { expiryDate: 'asc' }, // CRÍTICO: FEFO
        include: { product: true },
      })

      if (batches.length === 0) {
        throw new BadRequestException(`No hay lotes disponibles para ${item.productId}`)
      }

      let remaining = item.quantity
      const batchDetails = []

      // 2. Descontar secuencialmente del lote más antiguo
      for (const batch of batches) {
        if (remaining <= 0) break

        const deduct = Math.min(batch.quantity, remaining)
        
        // Actualizar cantidad en lote
        await this.prisma.inventoryBatch.update({
          where: { id: batch.id },
          data: { quantity: batch.quantity - deduct },
        })

        // 3. Registrar en InventoryLog
        await this.prisma.inventoryLog.create({
          data: {
            tenantId,
            batchId: batch.id,
            patientId,
            doctorId,
            quantity: deduct,
            type: 'DISPENSED',
          },
        })

        batchDetails.push({
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          quantity: deduct,
          expiryDate: batch.expiryDate,
        })

        remaining -= deduct
      }

      // 4. Verificar si se cubrió toda la cantidad
      if (remaining > 0) {
        throw new BadRequestException(
          `Stock insuficiente para ${batches[0].product.commercialName}. ` +
          `Faltan ${remaining} unidades.`
        )
      }

      dispensedItems.push({
        productId: item.productId,
        productName: batches[0].product.commercialName,
        quantity: item.quantity,
        batches: batchDetails,
      })
    }

    // 5. Marcar PatientNote como despachada
    await this.prisma.patientNote.update({
      where: { id: noteId },
      data: {
        medicationDispensed: true,
        dispensedMedications: {
          create: dispensedItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            batchId: item.batches[0].batchId, // Lote principal
          })),
        },
      },
    })

    return {
      success: true,
      dispensed: dispensedItems,
      timestamp: new Date(),
    }
  }
}
```

---

## 🏥 Integración con Patient Note

### Modificación a PatientNote Schema

```prisma
model PatientNote {
  // ... campos existentes
  medicationDispensed Boolean @default(false)
  dispensedMedications DispensedMedication[]

  @@index([medicationDispensed])
}

model DispensedMedication {
  id        String   @id @default(cuid())
  noteId    String
  batchId   String
  productId String
  quantity  Int
  createdAt DateTime @default(now())

  note    PatientNote @relation(fields: [noteId], references: [id])
  batch   InventoryBatch @relation(fields: [batchId], references: [id])
  product ProductLibrary @relation(fields: [productId], references: [id])

  @@index([noteId])
  @@index([batchId])
}
```

### Flujo de Despacho

```typescript
// En PatientNote form (frontend)
const handleDispense = async (noteId: string, medications: any[]) => {
  try {
    const result = await fetch('/api/pharmacy/dispense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: patient.id,
        noteId,
        medications: medications.map(m => ({
          productId: m.productId,
          quantity: m.quantity,
        })),
      }),
    })

    if (!result.ok) {
      const error = await result.json()
      if (error.message.includes('Stock insuficiente')) {
        // Mostrar alerta: "Stock Insuficiente"
        // Bloquear despacho
      }
    }

    // Éxito: marcar note como dispensada
    // Mostrar resumen de lotes usados (FEFO)
  } catch (err) {
    console.error('Error en despacho:', err)
  }
}
```

---

## 🚦 Validaciones de Stock

### Verificación Pre-Despacho

```typescript
async checkAvailability(tenantId: string, items: { productId: string; quantity: number }[]) {
  const availability = []

  for (const item of items) {
    // Calcular stock total de todos los lotes activos
    const totalStock = await this.prisma.inventoryBatch.groupBy({
      by: ['productId'],
      where: {
        tenantId,
        productId: item.productId,
        quantity: { gt: 0 },
      },
      _sum: { quantity: true },
    })

    const currentStock = totalStock[0]?._sum.quantity || 0
    const isAvailable = currentStock >= item.quantity

    availability.push({
      productId: item.productId,
      requested: item.quantity,
      available: currentStock,
      isAvailable,
      deficit: isAvailable ? 0 : item.quantity - currentStock,
    })
  }

  return availability
}
```

### Bloqueo por Stock Insuficiente

```typescript
// En el endpoint POST /api/pharmacy/dispense
@Post()
async dispense(@Body() dto: DispenseDto, @Req() req) {
  // 1. Verificar disponibilidad primero
  const availability = await this.fefoStrategy.checkAvailability(
    req.user.organizationId,
    dto.medications
  )

  const insufficient = availability.filter(a => !a.isAvailable)
  if (insufficient.length > 0) {
    throw new BadRequestException({
      message: 'Stock Insuficiente',
      details: insufficient.map(i => ({
        productId: i.productId,
        deficit: i.deficit,
      })),
    })
  }

  // 2. Proceder con FEFO
  return await this.fefoStrategy.dispense(
    req.user.organizationId,
    dto.patientId,
    req.user.id,
    dto.noteId,
    dto.medications
  )
}
```

---

## 📋 Criterios de Aceptación (Dispensing)

### AC 3.1: Flag en PatientNote
- [x] Campo `medicationDispensed: Boolean` en PatientNote
- [x] Se activa al ejecutar despacho exitoso

### AC 3.2: Lógica FEFO Obligatoria
- [x] Ordenamiento por `expiryDate ASC` en consulta de lotes
- [x] No se permite otra estrategia de despacho

### AC 3.3: Descuento Secuencial
- [x] Si lote más antiguo es insuficiente, continuar con siguiente
- [x] Registrar qué cantidad se tomó de cada lote

### AC 3.4: Auditoría Completa
- [x] InventoryLog con: patient_id, doctor_id, quantity, timestamp
- [x] Tipo de log: `DISPENSED`
- [x] Relación con PatientNote mediante `DispensedMedication`

### AC 6.1: Indicador de Disponibilidad
- [x] Booleano verde/rojo junto al nombre del medicamento
- [x] Visible al recetar en PatientNote

### AC 6.2: Bloqueo por Stock Insuficiente
- [x] Verificación pre-despacho
- [x] Alerta: "Stock Insuficiente" con detalles del déficit

---

## 🔗 Dependencias

- `02-api/README.md` - Endpoint POST `/pharmacy/dispense`
- `01-schema/README.md` - Modelos InventoryBatch, InventoryLog, DispensedMedication
- `03-frontend/README.md` - Integración en PatientNote UI

---

## 📝 Notas Importantes

1. **FEFO es INNEGOCIABLE**: El descuento SIEMPRE va del lote más antiguo al más nuevo
2. **Transacción atómica**: Usar `prisma.$transaction()` para asegurar consistencia
3. **Stock = 0**: Si tras despacho un lote llega a 0, mantener registro pero no usarlo en futuros despachos
4. **Alertas**: El frontend debe mostrar claramente qué lotes se están usando (FEFO)
5. **Rollback**: Si hay error en medio del despacho, revertir todos los cambios

---

## ✅ Estado

Lógica FEFO implementada. Despacho clínico operativo con auditoría completa y bloqueo por stock insuficiente.
