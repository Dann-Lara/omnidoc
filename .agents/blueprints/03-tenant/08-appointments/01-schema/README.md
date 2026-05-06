# 01-Schema - Ajustes al Modelo Appointment

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Fase** | 01 - Schema |
| **Estado** | 🔄 Pendiente |
| **Dependencias** | `schema.prisma` existente |

---

## 🎯 Propósito

Ajustar el modelo `Appointment` en `schema.prisma` para soportar las funcionalidades de la Super Agenda: salas (rooms), modalidad (presencial/telemedicina), y relación con especialidad.

---

## 📊 Modelo Actual (en `apps/api/prisma/schema.prisma`)

```prisma
model Appointment {
  id             String            @id @default(uuid())
  organizationId String
  patientId      String
  doctorId       String
  scheduledAt    DateTime
  duration       Int
  status         AppointmentStatus @default(SCHEDULED)
  type           String
  notes          String?
  aiPredictions  Json?
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  patient      Patient     @relation(fields: [patientId], references: [id])
  doctor       User        @relation("DoctorAppointments", fields: [doctorId], references: [id])

  @@index([organizationId])
  @@index([doctorId])
  @@index([patientId])
  @@index([scheduledAt])
  @@index([status])
}
```

---

## 🔧 Cambios Requeridos

### 1. Agregar campo `room` (Sala/Consultorio)

Basado en maqueta "Gestión de Citas" que muestra "Sala 302", "Consultorio A", etc.

```prisma
  room           String?    // Ej: "Consultory 01", "Sala 302"
```

### 2. Agregar campo `mode` (Modalidad)

Basado en maqueta "Nueva Cita" que permite elegir "Presencial" o "Telemedicina".

```prisma
enum AppointmentMode {
  IN_PERSON
  TELEHEALTH
}

model Appointment {
  // ... otros campos
  mode           AppointmentMode? @default(IN_PERSON)
}
```

### 3. Agregar campo `specialtyId` (Especialidad)

Para filtrar citas por especialidad (requerido para Fase 06 - Specialty Integration).

```prisma
model Appointment {
  // ... otros campos
  specialtyId     String?

  // Relación (opcional, por si no se asigna especialidad)
  specialty   Specialty? @relation(fields: [specialtyId], references: [id])

  // Agregar a índices
  @@index([specialtyId])
}
```

### 4. Agregar campo `reason` (Motivo)

Basado en maqueta "Nueva Cita" que tiene "Consultation Purpose".

```prisma
  reason         String?    // Motivo de la cita
```

---

## 📊 Modelo Final Esperado

```prisma
enum AppointmentMode {
  IN_PERSON
  TELEHEALTH
}

model Appointment {
  id             String            @id @default(uuid())
  organizationId String
  patientId      String
  doctorId       String
  specialtyId    String?
  scheduledAt    DateTime
  duration       Int
  status         AppointmentStatus @default(SCHEDULED)
  mode           AppointmentMode? @default(IN_PERSON)
  type           String
  room           String?
  reason         String?
  notes          String?
  aiPredictions  Json?
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  organization Organization     @relation(fields: [organizationId], references: [id])
  patient      Patient         @relation(fields: [patientId], references: [id])
  doctor       User            @relation("DoctorAppointments", fields: [doctorId], references: [id])
  specialty   Specialty?      @relation(fields: [specialtyId], references: [id])

  @@index([organizationId])
  @@index([doctorId])
  @@index([patientId])
  @@index([scheduledAt])
  @@index([status])
  @@index([specialtyId])
}
```

---

## 🛠️ Comandos de Migración

```bash
# 1. Generar migración
npx prisma migrate dev --name add_appointment_fields

# 2. Verificar que no hay errores
npx prisma validate

# 3. Generar cliente
npx prisma generate
```

---

## ✅ Criterios de Aceptación

- [ ] Campo `room` agregado
- [ ] Campo `mode` con enum `AppointmentMode` agregado
- [ ] Campo `specialtyId` agregado con relación a `Specialty`
- [ ] Campo `reason` agregado
- [ ] Índices actualizados
- [ ] Migración ejecutada sin errores
- [ ] Prisma Client generado correctamente

---

## 🔗 Siguiente Fase

**02-api/README.md** → Endpoints backend NestJS
