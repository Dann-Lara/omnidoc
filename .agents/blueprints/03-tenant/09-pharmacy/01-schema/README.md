# 08-Pharmacy: 01-Schema - Modelos de Datos

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 08-pharmacy/01-schema |
| **Estado** | ✅ Completado |
| **Schema File** | `apps/api/prisma/schema.prisma` |

---

## 🎯 Propósito

Definir los modelos Prisma para el sistema de farmacia e inventario, integrándose con el esquema existente de OmniDoc (Organization, Patient, PatientNote, User).

---

## 📊 Modelos de Datos

### 1. ProductLibrary - Catálogo Maestro

Catálogo global de medicamentos independiente de las existencias físicas de cada tenant.

```prisma
model ProductLibrary {
  id                String   @id @default(cuid())
  commercialName    String
  activeSubstance   String
  presentation      String   // Ej: "500mg Capsules", "100 U/mL Injection"
  laboratory        String
  barcode           String?  @unique
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  inventoryBatches  InventoryBatch[]

  @@index([commercialName])
  @@index([activeSubstance])
  @@index([barcode])
  @@index([laboratory])
}
```

**Campos:**
- `commercialName`: Nombre comercial (ej: "Amoxicillin Trihydrate")
- `activeSubstance`: Sustancia activa (ej: "Amoxicillin")
- `presentation`: Dosis/Unidad (ej: "500mg Capsules")
- `laboratory`: Fabricante (ej: "Pfizer Inc.")
- `barcode`: Código de barras maestro (opcional, único)

---

### 2. InventoryBatch - Lotes de Inventario

Entradas de inventario por lote, vinculadas a ProductLibrary y tenanted por tenantId.

```prisma
model InventoryBatch {
  id                String   @id @default(cuid())
  tenantId          String
  productId         String
  batchNumber       String?  // Opcional (ej: "BTH-2401-A9")
  quantity          Int      // Cantidad actual en este lote
  expiryDate        DateTime
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  organization      Organization @relation(fields: [tenantId], references: [id])
  product           ProductLibrary @relation(fields: [productId], references: [id])
  inventoryLogs     InventoryLog[]
  dispensedMedications DispensedMedication[]

  @@index([tenantId])
  @@index([productId])
  @@index([expiryDate])
  @@index([batchNumber])
}

// Extensión al modelo PatientNote existente
model PatientNote {
  // ... campos existentes
  medicationDispensed Boolean @default(false)
  dispensedMedications DispensedMedication[]
}

model DispensedMedication {
  id                String   @id @default(cuid())
  noteId            String
  batchId           String
  productId         String
  quantity          Int
  createdAt         DateTime @default(now())
  note              PatientNote @relation(fields: [noteId], references: [id])
  batch             InventoryBatch @relation(fields: [batchId], references: [id])
  product           ProductLibrary @relation(fields: [productId], references: [id])

  @@index([noteId])
  @@index([batchId])
}
```

**Campos:**
- `tenantId`: Organización (RLS implícito)
- `productId`: Referencia a ProductLibrary
- `batchNumber`: Identificador de lote (opcional)
- `quantity`: Cantidad actual (se decrementa con FEFO)
- `expiryDate`: Fecha de caducidad (crítico para FEFO)

---

### 3. InventoryLog - Auditoría de Inventario

Registro inmutable de todas las transaciones de inventario.

```prisma
model InventoryLog {
  id                String   @id @default(cuid())
  tenantId          String
  batchId           String
  patientId         String?  // NULL si es restock/ajuste
  doctorId          String   // Usuario que ejecuta la acción
  quantity          Int      // + para entrada, - para salida
  type              LogType  @default(RESTOCKED)
  reason            String?  // Justificación para ajustes manuales
  createdAt         DateTime @default(now())
  organization      Organization @relation(fields: [tenantId], references: [id])
  batch             InventoryBatch @relation(fields: [batchId], references: [id])

  @@index([tenantId])
  @@index([batchId])
  @@index([doctorId])
  @@index([patientId])
  @@index([createdAt])
  @@index([type])
}

enum LogType {
  DISPENSED     // Salida por receta médica
  RESTOCKED     // Entrada por reabastecimiento
  ADJUSTED      // Ajuste manual (solo Owner)
  EXPIRED       // Salida por caducidad
}
```

**Campos:**
- `patientId`: Paciente (solo para DISPENSED)
- `doctorId`: Médico/usuario que ejecuta
- `quantity`: Siempre positivo en el log (el tipo indica dirección)
- `type`: Tipo de transación
- `reason`: Justificación obligatoria para ADJUSTED

---

## 🔗 Relaciones

```
Organization (tenantId)
    │
    ├── InventoryBatch (1:N)
    │       ├── ProductLibrary (N:1)
    │       └── InventoryLog (1:N)
    │
    ├── PatientNote (existente)
    │       └── DispensedMedication (1:N)
    │               ├── InventoryBatch (N:1)
    │               └── ProductLibrary (N:1)
    │
    └── User (existente) → doctorId en InventoryLog
```

---

## 📋 Criterios de Aceptación (Schema)

- [ ] `ProductLibrary` creado con campos requeridos (AC 1.1-1.3)
- [ ] `InventoryBatch` con relación a Organization + ProductLibrary (AC 2.1-2.5)
- [ ] `InventoryLog` con tipos de transación y auditoría completa (AC 3.4)
- [ ] `PatientNote` extendido con `medicationDispensed` + `DispensedMedication` (AC 3.1)
- [ ] Índices en campos de búsqueda frecuente (tenantId, expiryDate, productId)
- [ ] `barcode` único en ProductLibrary para escaneo (AC 6.3)

---

## 🔧 Migración de Base de Datos

**⚠️ REGLAS CRÍTICAS DEL AGENTS.md:**
1. **Backup obligatorio** antes de ejecutar migración
2. **NUNCA** ejecutar `prisma migrate reset`
3. **Solo editar archivos .sql** si hay dudas, no ejecutar
4. **Confirmación explícita** del usuario antes de migrar

### Pasos para migración:

```bash
# 1. Backup de seguridad (OBLIGATORIO)
pg_dump -h localhost -U postgres omnidoc > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Verificar backup
ls -lh backup_*.sql

# 3. Editar schema.prisma (agregar modelos arriba)

# 4. Crear migración (SOLO después de confirmación del usuario)
npx prisma migrate dev --name add_pharmacy_modules

# 5. Verificar datos críticos post-migración
# - Organization 'omnidoc-saas'
# - Rol 'SUPERADMIN'
# - Usuario 'superadmin@omnidoc.dev'
```

---

## 🔗 Dependencias

- `00-global/01-stack.md` - Stack tecnológico (Prisma 6.7.0)
- `00-global/06-security.md` - RLS por tenant_id
- `01-auth/02-backend.md` - Autenticación para endpoints

---

## ✅ Estado

Schema completado. Modelos migrados: ProductLibrary, InventoryBatch, InventoryLog, DispensedMedication.
