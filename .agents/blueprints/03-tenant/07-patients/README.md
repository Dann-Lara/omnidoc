# 07-Patients - Gestión Integral del Paciente y Expediente Clínico

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Módulo** | Patients |
| **Estado** | 🔄 En Desarrollo |
| **Última actualización** | 2026-04-21 |

---

## 🎯 Propósito

Implementar la gestión integral del paciente y expediente clínico en el tenant, siguiendo los criterios de aceptación (AC) definidos:

1. **Directorio de Pacientes** - Lista con filtros rápidos
2. **Acto Médico** - Nueva nota clínica sellada
3. **Historial** - Línea de tiempo invertible
4. **Blindaje PHI** - Aislamiento, encriptación y control de roles

---

## 📁 Estructura de Archivos

```
apps/web/src/app/[slug]/
└── areas/
    └── patients/
        ├── page.tsx                      # Directorio (lista)
        ├── [patientId]/
        │   ├── page.tsx                  # Ficha del paciente
        │   ├── history/
        │   │   └── page.tsx              # Historial clínico
        │   └── new-note/
        │       └── page.tsx              # Nueva nota médica
        └── components/
            ├── PatientsTable.tsx         # Tabla de directorio
            ├── PatientCard.tsx          # Card para móvil
            ├── PatientForm.tsx           # Form datos base
            ├── VitalSignsForm.tsx        # Form signos vitales
            ├── MedicalNoteForm.tsx      # Form nueva nota
            ├── Timeline.tsx             # Historial timeline
            └── ConfirmSealModal.tsx     # Modal confirmación

apps/api/src/
├── patients/
│   ├── patients.module.ts
│   ├── patients.controller.ts
│   ├── patients.service.ts
│   ├── dto/
│   │   ├── create-patient.dto.ts
│   │   ├── update-patient.dto.ts
│   │   └── create-note.dto.ts
│   └── types/
│       └── patient.types.ts
├── patient-notes/
│   ├── patient-notes.module.ts
│   ├── patient-notes.controller.ts
│   ├── patient-notes.service.ts
│   └── dto/
│       └── create-note.dto.ts
└── patient-audit/
    ├── patient-audit.module.ts
    ├── patient-audit.service.ts
    └── dto/
        └── log-audit.dto.ts
```

---

## 📋 i18n - Claves Requeridas

Agregar en `apps/web/src/lib/i18n/translations.ts` bajo la clave `patients`:

```typescript
patients: {
  directory: {
    title: { en: 'Patients', es: 'Pacientes' },
    name: { en: 'Name', es: 'Nombre' },
    id: { en: 'ID', es: 'ID' },
    phone: { en: 'Phone', es: 'Teléfono' },
    dateOfBirth: { en: 'Date of Birth', es: 'Fecha de Nac.' },
    allergies: { en: 'Allergies', es: 'Alergias' },
    new: { en: 'New Patient', es: 'Nuevo Paciente' },
    searchPlaceholder: { en: 'Search by name...', es: 'Buscar por nombre...' },
    allIds: { en: 'All IDs', es: 'Todos los ID' },
    dni: { en: 'DNI', es: 'DNI' },
    curp: { en: 'CURP', es: 'CURP' },
    ssn: { en: 'SSN', es: 'SSN' },
  },
  form: {
    documentType: { en: 'Document Type', es: 'Tipo de Documento' },
    documentId: { en: 'Document Number', es: 'Número de Documento' },
    gender: { en: 'Gender', es: 'Género' },
    bloodType: { en: 'Blood Type', es: 'Tipo de Sangre' },
    emergencyContact: { en: 'Emergency Contact', es: 'Contacto de Emergencia' },
    emergencyPhone: { en: 'Emergency Phone', es: 'Teléfono de Emergencia' },
    isChronic: { en: 'Chronic Disease', es: 'Enfermedad Crónica' },
    male: { en: 'Male', es: 'Hombre' },
    female: { en: 'Female', es: 'Mujer' },
  },
  act: {
    vitalSigns: { en: 'Vital Signs', es: 'Signos Vitales' },
    bloodPressure: { en: 'Blood Pressure', es: 'Presión Arterial' },
    heartRate: { en: 'Heart Rate', es: 'Frecuencia Cardíaca' },
    temperature: { en: 'Temperature', es: 'Temperatura' },
    respRate: { en: 'Respiratory Rate', es: 'Frecuencia Respiratoria' },
    oxygenSat: { en: 'O₂ Saturation', es: 'Saturación de O₂' },
    weight: { en: 'Weight', es: 'Peso' },
    height: { en: 'Height', es: 'Talla' },
    bmi: { en: 'BMI', es: 'IMC' },
    subjective: { en: 'Subjective', es: 'Resumen/Subjetivo' },
    subjectivePlaceholder: { en: 'Reason for consultation...', es: 'Motivo de consulta...' },
    diagnosis: { en: 'Diagnosis', es: 'Diagnóstico' },
    diagnosisPlaceholder: { en: 'Diagnostic impression...', es: 'Impresión diagnóstica...' },
    plan: { en: 'Plan/Prescription', es: 'Plan/Receta' },
    planPlaceholder: { en: 'Medications, doses...', es: 'Medicamentos, dosis...' },
    saveAndSeal: { en: 'Save & Seal', es: 'Guardar y Sellar' },
    confirmSeal: { en: 'Confirm Record', es: 'Confirmar Registro' },
    sealWarning: { en: 'Once saved, this note cannot be edited.', es: 'Una vez guardado, esta nota no podrá ser editada.' },
  },
  history: {
    title: { en: 'Clinical History', es: 'Historial Clínico' },
    newNote: { en: 'New Note', es: 'Nueva Nota' },
    specialty: { en: 'Specialty', es: 'Especialidad' },
    noNotes: { en: 'No notes yet', es: 'Sin notas aún' },
    expandAll: { en: 'Expand All', es: 'expandir Todo' },
    collapseAll: { en: 'Collapse All', es: 'Colapsar Todo' },
    sealed: { en: 'SEALED', es: 'SELLADO' },
  },
  permissions: {
    patients: { en: 'Patients', es: 'Pacientes' },
    notes: { en: 'Medical Notes', es: 'Notas Médicas' },
    vitals: { en: 'Vital Signs', es: 'Signos Vitales' },
  },
},
```

---

## 📋 Blueprint Index

| # | Archivo | Descripción | Estado |
|---|---------|-------------|--------|
| 01 | [01-schema/README.md](./01-schema/README.md) | Schema Prisma (Patient, PatientNote, PatientAuditLog) | 🔄 |
| 02 | [02-api/README.md](./02-api/README.md) | Endpoints backend | ⏳ |
| 03 | [03-directory/README.md](./03-directory/README.md) | Directorio y búsqueda | ⏳ |
| 04 | [04-acto-medico/README.md](./04-acto-medico/README.md) | Nueva nota médica | ⏳ |
| 05 | [05-historial/README.md](./05-historial/README.md) | Historial clínico | ⏳ |
| 06 | [06-permisos/README.md](./06-permisos/README.md) | Control de roles | ⏳ |

---

## 📝 Modelo de Datos (Schema Prisma)

### Patient (extendiendo existentes)

```prisma
model Patient {
  id              String    @id @default(uuid())
  organizationId  String
  documentType    DocumentType  // DNI, CURP, SSN
  documentId      String       // Número único
  firstName      String
  lastName       String
  email          String?
  phone          String?
  dateOfBirth    DateTime?
  gender         Gender?      // HOMBRE, MUJER
  bloodType      BloodType?  // A+, A-, B+, B-, AB+, AB-, O+, O-
  emergencyContact    String? // Contacto de emergencia
  emergencyPhone     String? // Teléfono de emergencia
  allergies      String[]     // Alergias conocidas
  isChronic      Boolean      @default(false) // Enfermdades crónicas
  createdAt       DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization   Organization   @relation(...)
  notes         PatientNote[]
  auditLogs     PatientAuditLog[]

  @@unique([organizationId, documentId])
  @@index([organizationId])
  @@index([documentType, documentId])
}

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
```

### PatientNote (Nota sellada)

```prisma
model PatientNote {
  id              String      @id @default(uuid())
  patientId       String
  doctorId        String
  organizationId  String
  specialtyId     String?

  // Signos vitales
  bloodPressure  String?     // ej: "120/80"
  heartRate      Int?        // ppm
  temperature    Decimal?      // °C
  respRate       Int?         // rpm
  oxygenSat      Int?         // %
  weight         Decimal?     // kg
  height         Decimal?     // cm
  bmi            Decimal?    // calculado

  // Contenido clínico
  subjective     String?     // Resumen/subjetivo
  diagnosis      String?     // Diagnóstico
  plan           String?     // Plan/receta

  // Sellado
  isSealed       Boolean     @default(false)
  sealedAt        DateTime?
  signature      String?     // hash timestamp + doctorId

  createdAt       DateTime @default(now())

  patient        Patient     @relation(...)
  doctor        User        @relation(...)
  organization  Organization @relation(...)

  @@index([patientId])
  @@index([doctorId])
  @@index([isSealed])
}
```

### PatientAuditLog (Auditoría PHI)

```prisma
model PatientAuditLog {
  id              String    @id @default(uuid())
  patientId       String
  userId          String
  organizationId  String
  action          String    // CREATED, UPDATED, VIEWED, EXPORTED, SEALED
  fieldChanged    String?   // Campo modificado (para UPDATE)
  oldValue        Json?     // Valor anterior
  newValue        Json?    // Valor nuevo
  ipAddress       String?
  createdAt       DateTime @default(now())

  patient        Patient      @relation(...)
  user          User         @relation(...)
  organization  Organization @relation(...)

  @@index([patientId])
  @@index([userId])
  @@index([action])
}
```

---

## 🔐 Control de Permisos (AC 4.3)

Usar el sistema existente en `/areas/team/[userId]` con permisos granulares:

| Permiso | Recepcionista | Enfermería | Médico |
|--------|---------------|-------------|--------|
| `patients:read` | ✅ | ✅ | ✅ |
| `patients:write:base` | ✅ | ✅ | ✅ |
| `patients:write:all` | ❌ | ❌ | ✅ |
| `notes:read` | ❌ | ✅ (solo activas) | ✅ |
| `notes:write` | ❌ | ❌ | ✅ |
| `notes:seal` | ❌ | ❌ | ✅ |
| `vitals:write` | ❌ | ✅ | ✅ |

---

## 🔗 Dependencias

```
00-GLOBAL ✅
    │
    ├── 01-AUTH ✅ (sistema de login y cookies)
    │
    └── 03-TENANT (este blueprint)
            ├── 07-patients (este)
            ├── team (usa permisos existentes)
            ├── next-best-practices skill
            ├── tailwind-design-system skill
            └── framer-motion skill
```

---

## 📝 Notas Importantes

- **RLS**: Implementar a nivel de query en NestJS (middleware de organización)
- **Encriptación**: Usar AES-256 para notas en campo `diagnosis`, `plan`
- **Sellado**: Hash SHA-256 con timestamp + doctorId
- **Mockups**: Pendientes para AC 2.2, 3.1, 3.2
- **IA**: Pendiente (AC 3.2 futuro)

---

## 🔭 Siguiente Step

**[01-schema](./01-schema/README.md)** → Schema Prisma y tipos