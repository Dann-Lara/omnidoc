# 07-Patients - Schema Prisma

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Módulo** | Patients Schema |
| **Estado** | 🔄 En Desarrollo |
| **Dependencias** | Ninguna |

---

## 🎯 Propósito

Definir el schema de Prisma para el módulo de pacientes, extendiendo el modelo existente y añadiendo las tablas necesarias.

---

## 📝 Modelos de Datos

### 1. Patient (Extendido)

Ubicación: `apps/api/prisma/schema.prisma`

Agregar al modelo existente:

```prisma
// Enums
enum DocumentType {
  DNI
  CURP
  SSN
}

enum Gender {
  HOMBRE
  MUJER
}

enum BloodType {
  A_POSITIVE
  A_NEGATIVE
  B_POSITIVE
  B_NEGATIVE
  AB_POSITIVE
  AB_NEGATIVE
  O_POSITIVE
  O_NEGATIVE
}

// Extender Patient
model Patient {
  // ... campos existentes ...
  
  // Nuevos campos
  documentType    DocumentType?
  documentId     String?
  gender         Gender?
  bloodType      BloodType?
  emergencyContact String?
  emergencyPhone  String?
  allergies      String[]       @default([])
  isChronic      Boolean        @default(false)
  
  // Relaciones
  notes          PatientNote[]
  auditLogs      PatientAuditLog[]

  // Constraints
  @@unique([organizationId, documentId])
  @@index([documentType, documentId])
}
```

### 2. PatientNote (Nueva tabla)

```prisma
model PatientNote {
  id              String      @id @default(uuid())
  patientId       String
  doctorId        String
  organizationId  String
  specialtyId     String?

  // Signos vitales
  bloodPressure  String?     
  heartRate      Int?        
  temperature    Decimal?      
  respRate       Int?         
  oxygenSat      Int?         
  weight         Decimal?     
  height         Decimal?     
  bmi            Decimal?    

  // Contenido clínico (encriptar en APP)
  subjective     String?     
  diagnosis      String?     
  plan           String?     

  // Sellado
  isSealed       Boolean     @default(false)
  sealedAt       DateTime?
  signature     String?     

  createdAt      DateTime @default(now())

  // Relaciones
  patient        Patient     @relation(fields: [patientId], references: [id])
  doctor        User        @relation(fields: [doctorId], references: [id])
  organization  Organization @relation(fields: [organizationId], references: [id])

  @@index([patientId])
  @@index([doctorId])
  @@index([isSealed])
  @@index([createdAt])
}
```

### 3. PatientAuditLog (Nueva tabla)

```prisma
model PatientAuditLog {
  id              String    @id @default(uuid())
  patientId       String
  userId          String
  organizationId  String
  action          PatientAuditAction
  fieldChanged    String?   
  oldValue        Json?     
  newValue        Json?    
  ipAddress       String?
  createdAt       DateTime @default(now())

  // Relaciones
  patient        Patient      @relation(fields: [patientId], references: [id])
  user          User         @relation(fields: [userId], references: [id])
  organization  Organization @relation(fields: [organizationId], references: [id])

  @@index([patientId])
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}

enum PatientAuditAction {
  CREATED
  UPDATED
  VIEWED
  EXPORTED
  SEALED
  PRINTED
}
```

---

## 🔧 Tipos TypeScript

Ubicación: `apps/api/src/patients/types/patient.types.ts`

```typescript
export enum DocumentType {
  DNI = 'DNI',
  CURP = 'CURP',
  SSN = 'SSN',
}

export enum Gender {
  HOMBRE = 'HOMBRE',
  MUJER = 'MUJER',
}

export enum BloodType {
  A_POSITIVE = 'A_POSITIVE',
  A_NEGATIVE = 'A_NEGATIVE',
  B_POSITIVE = 'B_POSITIVE',
  B_NEGATIVE = 'B_NEGATIVE',
  AB_POSITIVE = 'AB_POSITIVE',
  AB_NEGATIVE = 'AB_NEGATIVE',
  O_POSITIVE = 'O_POSATIVE',
  O_NEGATIVE = 'O_NEGATIVE',
}

export enum PatientAuditAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  VIEWED = 'VIEWED',
  EXPORTED = 'EXPORTED',
  SEALED = 'SEALED',
  PRINTED = 'PRINTED',
}

export interface VitalSigns {
  bloodPressure?: string
  heartRate?: number
  temperature?: number
  respRate?: number
  oxygenSat?: number
  weight?: number
  height?: number
  bmi?: number
}

export interface PatientWithNotes extends Patient {
  notes: PatientNote[]
  _count?: { notes: number }
}
```

---

## ✅ Criterios de Aceptación (AC)

| AC | Descripción | Criterio |
|----|------------|----------|
| 1.1 | Filtros por nombre, ID, fecha | Campos indexados |
| 1.2 | Datos administrativos | gender, bloodType, emergencyContact, allergies |
| 1.3 | Auditoría de cambios | PatientAuditLog con campoChanged, oldValue, newValue |
| 4.1 | Aislamiento tenant | organizationId en todas las tablas |
| 4.2 | Encriptación | Campos diagnosis, plan encriptados |

---

## 🚀 Pasos de Ejecución

1. **Agregar enums** al schema.prisma
2. **Extender modelo Patient** con nuevos campos
3. **Crear modelo PatientNote**
4. **Crear modelo PatientAuditLog**
5. **Ejecutar migración**: `pnpm db:migrate`
6. **Generar tipos** en `patient.types.ts`
7. **Verificar con** `pnpm typecheck`

---

## 🔗 Dependencias

- Schema existente en `apps/api/prisma/schema.prisma`
- Tipos existentes en `apps/api/src/patients/` (crear)