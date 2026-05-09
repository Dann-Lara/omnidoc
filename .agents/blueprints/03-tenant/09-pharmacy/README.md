# 03-Tenant: 09-Pharmacy - Módulo de Farmacia e Inventario

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 03-tenant/09-pharmacy |
| **Feature ID** | FEAT-PHARMA-001 |
| **Estado** | ✅ Completado |
| **Última actualización** | 2026-05-06 |

---

## 🎯 Propósito

Sistema de inventario híbrido para gestión clínica de medicamentos dentro del módulo Tenant:
- **Catálogo Maestro** (Product_Library) independiente de existencias físicas
- **Gestión por Lotes** (Inventory_Batches) con entradas incrementales
- **Despacho Clínico** con lógica FEFO (First Expired, First Out)
- **Inteligencia de Datos** (Dashboard con stock de seguridad dinámico)
- **Control de Roles** (Owner/Collaborator con permisos granulares)

---

## 📁 Estructura de Archivos (Planificada)

```
apps/
├── api/src/
│   └── pharmacy/
│       ├── pharmacy.module.ts
│       ├── product-library/
│       │   ├── product-library.controller.ts
│       │   ├── product-library.service.ts
│       │   └── dto/
│       ├── inventory/
│       │   ├── inventory.controller.ts
│       │   ├── inventory.service.ts
│       │   └── dto/
│       ├── batches/
│       │   ├── batches.controller.ts
│       │   ├── batches.service.ts
│       │   └── dto/
│       ├── dispensing/
│       │   ├── dispensing.service.ts
│       │   └── fefo.strategy.ts
│       └── dashboard/
│           ├── dashboard.service.ts
│           └── dto/
└── web/src/
    └── app/
        └── [slug]/
            └── pharmacy/
                ├── page.tsx                    # Dashboard principal
                ├── dispensing/
                │   └── page.tsx                # Historial de despachos
                ├── inventory/
                │   └── page.tsx                # Inventory & Batch Management
                ├── library/
                │   └── page.tsx                # Master Product Library
                ├── products/
                │   ├── new/
                │   │   └── page.tsx            # Crear nuevo producto
                │   └── [id]/
                │       └── edit/
                │           └── page.tsx        # Editar producto
                └── restock/
                    └── [[...restockId]]/
                        └── page.tsx            # Batch Restock Entry
```

---

## 📋 Blueprint Index

| # | Archivo | Descripción | Estado |
|---|---------|-------------|--------|
| 01 | [01-schema/README.md](./01-schema/README.md) | Prisma schema (Product_Library, Inventory_Batches, Inventory_Logs) | ✅ |
| 02 | [02-api/README.md](./02-api/README.md) | API endpoints NestJS (12+ endpoints) | ✅ |
| 03 | [03-frontend/README.md](./03-frontend/README.md) | UI pages + componentes (Next.js) | ✅ |
| 04 | [04-dashboard/README.md](./04-dashboard/README.md) | Dashboard KPIs + expiry tracking | ✅ |
| 05 | [05-dispensing/README.md](./05-dispensing/README.md) | Lógica FEFO + despacho clínico | ✅ |
| 06 | [06-permissions/README.md](./06-permissions/README.md) | Roles Owner/Collaborator + permisos | ✅ |

*Ubicación: `.agents/blueprints/03-tenant/09-pharmacy/`*
| 07 | [mockups/VISUAL-REFERENCE.md](./mockups/VISUAL-REFERENCE.md) | Mockups HTML + Tailwind v4 | ✅ Proporcionado |

---

## 🔗 Dependencias

```
00-GLOBAL ✅
    │
    └── 03-TENANT ✅
          └── 09-PHARMACY (este blueprint)
                ├── 01-auth ✅ (auth existente)
                ├── 06-profile ✅ (user-types: http://localhost:3000/open-doc/profile/user-types)
                ├── 07-specialties ✅ (integración por especialidad médica)
                ├── nestjs-best-practices skill
                ├── next-best-practices skill
                ├── tailwind-design-system skill
                └── supabase-postgres-best-practices skill
```

---

## 📝 Criterios de Aceptación (Resumen)

### AC 1: Gestión de Identidad (Catálogo Maestro)
- [x] Product_Library independiente de existencias
- [x] Campos: Nombre comercial, Sustancia activa, Presentación, Laboratorio, Código de barras
- [x] Edición de metadatos sin afectar stock

### AC 2: Gestión de Existencias (Entrada por Lotes)
- [x] Restock selecciona producto de Product_Library
- [x] Inventory_Batches por cada entrada (cantidad, expiry_date, batch_number)
- [x] Múltiples lotes activos por product_id + tenant
- [x] Entrada incremental (sumar al total del lote)

### AC 3: Despacho Clínico
- [x] Flag `medication_dispensed: true` en PatientNote
- [x] Lógica FEFO obligatoria
- [x] Descuento secuencial si un lote es insuficiente
- [x] Inventory_Logs con patient_id, doctor_id, cantidad, timestamp

### AC 4: Inteligencia de Datos
- [x] Stock de seguridad dinámico (30 días)
- [x] Indicador Prioridad de Compra (< 7 días proyectados)
- [x] Lotes con vencimiento < 90 días (30/60/90 categorización)
- [ ] Auto-sugerencia por misma Sustancia Activa si stock = 0 (pendiente)

### AC 5: Seguridad y Roles
- [x] RLS por tenant_id en todas las consultas
- [x] Collaborator: lectura stock ✅ / despacho ✅ / entrada lotes ⚠️ (según user-types)
- [x] Owner: permisos totales + ajuste manual con justificación
- [x] Validación contra user-types en `/profile/user-types`

### AC 6: Validaciones de Interfaz
- [x] Indicador booleano disponibilidad al recetar
- [x] Bloqueo despacho si stock total < cantidad solicitada
- [ ] Escaneo de código de barras en restock (pendiente)

---

## 🎨 Mockups Disponibles

| Mockup | Descripción | Ubicación |
|--------|-------------|----------|
| Clinical Inventory Intelligence | Dashboard principal con KPIs | [mockups/VISUAL-REFERENCE.md](./mockups/VISUAL-REFERENCE.md) |
| Inventory & Batch Management | Gestión de lotes + FEFO | [mockups/VISUAL-REFERENCE.md](./mockups/VISUAL-REFERENCE.md) |
| Master Product Library | Catálogo maestro | [mockups/VISUAL-REFERENCE.md](./mockups/VISUAL-REFERENCE.md) |
| Batch Restock Entry | Formulario de reabastecimiento | [mockups/VISUAL-REFERENCE.md](./mockups/VISUAL-REFERENCE.md) |

---

## 📊 Modelos de Datos (Prisma - Resumen)

```prisma
model ProductLibrary {
  id                  String   @id @default(cuid())
  commercialName      String
  activeSubstance     String
  presentation        String   // Dosis/Unidad
  laboratory          String
  barcode             String?  @unique
  createdAt           DateTime @default(now())
  inventoryBatches    InventoryBatch[]
  @@index([commercialName])
  @@index([activeSubstance])
}

model InventoryBatch {
  id                  String   @id @default(cuid())
  tenantId            String
  productId           String
  batchNumber         String?
  quantity            Int
  expiryDate          DateTime
  createdAt           DateTime @default(now())
  organization        Organization @relation(fields: [tenantId], references: [id])
  product             ProductLibrary @relation(fields: [productId], references: [id])
  inventoryLogs       InventoryLog[]

  @@index([tenantId])
  @@index([productId])
  @@index([expiryDate])
}

model InventoryLog {
  id                  String   @id @default(cuid())
  tenantId            String
  batchId             String
  patientId           String?
  doctorId            String
  quantity            Int
  type                LogType  @default(DISPENSED)
  reason              String?  // Justificación para ajustes manuales
  createdAt           DateTime @default(now())
  organization        Organization @relation(fields: [tenantId], references: [id])
  batch               InventoryBatch @relation(fields: [batchId], references: [id])

  @@index([tenantId])
  @@index([createdAt])
}

enum LogType {
  DISPENSED
  RESTOCKED
  ADJUSTED
  EXPIRED
}
```

---

## 🌐 Integración con Patient Notes

El campo `medication_dispensed: Boolean` se agregará al modelo `PatientNote` existente:

```prisma
model PatientNote {
  // ... campos existentes
  medicationDispensed Boolean @default(false)
  dispensedMedications Json?     // [{ productId, quantity, batchId }]
}
```

---

## ✅ Estado del Módulo

Módulo completado. Todos los sub-blueprints están implementados.

- Frontend: 7 páginas funcionales (dashboard, library, products new/edit, inventory, restock, dispensing)
- Backend: API operativa en `/pharmacy/*`
- Schema: Modelos Prisma migrados (ProductLibrary, InventoryBatch, InventoryLog, DispensedMedication)
- Dashboard: KPIs, stock de seguridad, vencimientos
- Dispensing: Lógica FEFO implementada en frontend
- Permisos: Integración con user-types existente

---

## 📝 Nota de Ubicación

Este módulo es parte del blueprint **03-tenant** (no es un módulo independiente).
Se ubica en: `.agents/blueprints/03-tenant/09-pharmacy/`

---

## 📝 Notas Importantes

- **FEFO es obligatorio**: El descuento SIEMPRE va del lote más antiguo al más nuevo
- **Barcode scanning**: Usar `BarcodeDetector` API o librería externa
- **Stock de seguridad**: Calcular velocidad de consumo últimos 30 días
- **Ajuste manual**: Solo Owner, requiere justificación obligatoria (reason)
- **i18n**: Usar `useI18n` con claves (no ternarios)
- **User-types**: Validar permisos contra `/profile/user-types` (http://localhost:3000/open-doc/profile/user-types)

---

*Blueprint creado: 2026-05-06*
