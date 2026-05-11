# 10-Workflows: 02-Vitals — Signos Vitales + Estado "En Espera"

## Información General

| Atributo | Valor |
|----------|-------|
| **Blueprint** | 10-workflows/02-vitals |
| **Estado** | ⏳ Pendiente de Implementación |
| **Impacto** | Schema: nuevo modelo `AppointmentVitals`; API: endpoints vitals; Frontend: modal en appointments, precarga en notas |

## Propósito

Permitir que un colaborador (con permiso `notes:vitals` configurado por el Owner) tome los signos vitales del paciente cuando llega a la clínica, antes de que pase a consulta con el médico. Estos vitales se precargan automáticamente en la nota clínica del doctor.

## Flujo Completo

```
Appointment CONFIRMED
        │
        ├── ¿Alguien tiene "notes:vitals"?
        │       ├── NO → funcionamiento normal (médico llena todo)
        │       └── SÍ →
        │             ├── Botón "Tomar Signos Vitales" en appointment
        │             ├── Modal con: BP, HR, temp, RR, SpO2, weight, height + subjective
        │             ├── Al guardar → status → IN_PROGRESS (UI: "En Espera")
        │             └── Se crea AppointmentVitals
        │
        v
  Doctor abre notes/new?appointmentId=X
        │
        ├── ¿Existe AppointmentVitals para este appointment?
        │       ├── NO → formulario vacío (como hoy)
        │       └── SÍ → precargar vitales + subjective
        │
        v
  Doctor completa nota + diagnóstico + plan + medicación
```

## Modelo de Datos

### Nuevo modelo `AppointmentVitals`

```prisma
model AppointmentVitals {
  id              String    @id @default(uuid())
  appointmentId   String    @unique
  organizationId  String
  takenById       String    // colaborador que tomó los vitales
  bloodPressure   String?   // "120/80"
  heartRate       Int?      // bpm
  temperature     Decimal?  @db.Decimal(4, 1)  // °C
  respRate        Int?      // breaths/min
  oxygenSat       Int?      // SpO2 %
  weight          Decimal?  @db.Decimal(5, 2)  // kg
  height          Decimal?  @db.Decimal(5, 2)  // cm
  bmi             Decimal?  @db.Decimal(4, 2)  // auto-calculado
  subjective      String?   // motivo de consulta (precargado al doctor)
  createdAt       DateTime  @default(now())
  appointment     Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)
  organization    Organization @relation(fields: [organizationId], references: [id])
  takenBy         User      @relation(fields: [takenById], references: [id])

  @@index([organizationId])
  @@index([appointmentId])
}
```

### Por qué tabla separada (no JSON)

Opción seleccionada tras evaluar Supabase Postgres best practices:

| Aspecto | JSON en Appointment | Tabla `AppointmentVitals` |
|---------|--------------------|---------------------------|
| Type safety | ❌ Sin validación de esquema | ✅ Columnas tipadas |
| Constraints | ❌ No CHECK posibles | ✅ CHECK en cada campo |
| Queryable | ❌ Solo `->>` operadores | ✅ WHERE, ORDER BY, índices |
| Historia | ❌ Un solo valor, siempre overwrite | ✅ Se pueden trackear cambios |
| Migración | ✅ Una columna | ✅ Una tabla nueva |
| Escalabilidad | ❌ Problemas con queries complejas | ✅ Índices compuestos |

### Relación con Appointment

`Appointment.vitals` → `AppointmentVitals.appointmentId` (one-to-one, cascade delete)

### NO se modifica PatientNote

Los campos de vitales ya existen en PatientNote. `AppointmentVitals` solo precarga el formulario — no crea ni modifica la nota.

## Backend

### Nuevo endpoint

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/appointments/:id/vitals` | notes:vitals | Guardar vitales + cambiar status a IN_PROGRESS |
| GET | `/appointments/:id/vitals` | Autenticado | Obtener vitales de un appointment (para precarga) |

### POST /appointments/:id/vitals

```typescript
// Request body
{
  bloodPressure?: string  // "120/80"
  heartRate?: number
  temperature?: number
  respRate?: number
  oxygenSat?: number
  weight?: number
  height?: number
  subjective?: string
}

// Response
{
  id: string
  appointmentId: string
  status: 'IN_PROGRESS'  // appointment status updated
  bmi: number            // auto-calculated
  vitals: { ... }
}
```

### Lógica

```typescript
async function saveVitals(appointmentId: string, dto: SaveVitalsDto, userId: string) {
  // 1. Verificar que appointment existe y está CONFIRMED
  // 2. Calcular BMI si weight + height presentes
  const bmi = dto.weight && dto.height
    ? dto.weight / Math.pow(dto.height / 100, 2)
    : null

  // 3. Crear/upsert AppointmentVitals
  const vitals = await prisma.appointmentVitals.upsert({
    where: { appointmentId },
    create: { appointmentId, organizationId, takenById: userId, ...dto, bmi },
    update: { ...dto, bmi, takenById: userId },
  })

  // 4. Cambiar status del appointment a IN_PROGRESS
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'IN_PROGRESS' },
  })

  return vitals
}
```

## Frontend

### 1. Botón "Tomar Signos Vitales"

**Ubicación**: Modal de detalle de appointment (`AgendaView.tsx`) y página de edit (`[appointmentId]/edit/page.tsx`)

**Condición**: Solo visible si:
- Appointment status === CONFIRMED
- El usuario actual tiene permiso `notes:vitals`
- Existe al menos un usuario en la org con permiso `notes:vitals`

**Diseño**: Botón con icono `Heart` (lucide-react), mismo estilo que otros botones de acción primaria:
```tsx
<button className="bg-gradient-to-br from-primary to-primary-container text-white px-4 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm hover:shadow-md transition-all">
  <Heart className="w-4 h-4" />
  Tomar Signos Vitales
</button>
```

### 2. Modal de Signos Vitales

**Patrón visual**: Seguir el modal de `AgendaView.tsx` (backdrop, animación Framer Motion, rounded-3xl, header con borde de color).

**Layout**:
- Header: "Signos Vitales" + botón cerrar (X)
- Cuerpo: Grid de 4 columnas responsive con cada vital como card individual
  - Blood Pressure (split inputs: sistólica/diastólica)
  - Heart Rate (input numérico + "bpm")
  - Temperature (input numérico + "°C")
  - Respiratory Rate (input numérico + "/min")
  - SpO2 (input numérico + "%")
  - Weight (input numérico + "kg")
  - Height (input numérico + "cm")
  - BMI (auto-calculado, solo display)
- Área de texto: Subjective (motivo de consulta)
- Footer: Botones "Cancelar" y "Guardar & Marcar En Espera"

**Estados de salud** (mismos ranges que `notes/new/page.tsx`):
- BP: <120/80 normal, <130/85 warning, >=130/85 danger
- HR: 60-100 normal, 40-130 warning, fuera danger
- Temp: 36.1-37.2 normal, 35.5-38 warning, fuera danger
- RR: 12-20 normal, 8-25 warning, fuera danger
- SpO2: >=95 normal, >=90 warning, <90 danger

**Cada card de vital cambia de color según el estado** (borde):
- Normal: `border-tertiary`
- Warning: `border-secondary`
- Danger: `border-error`

**BMI**: Auto-calculado con barra de color (Underweight, Normal, Overweight, Obese)

### 3. Precarga en nota clínica

En `notes/new/page.tsx`:

```typescript
// Si hay appointmentId en URL
const appointmentId = searchParams.get('appointmentId')

// Fetch vitales si existen
const { data: vitals } = useSWR(
  appointmentId ? `/appointments/${appointmentId}/vitals` : null
)

// Precargar en form state
useEffect(() => {
  if (vitals) {
    setBloodPressure(vitals.bloodPressure || '')
    setHeartRate(String(vitals.heartRate || ''))
    // ... etc
    setSubjective(vitals.subjective || '')
  }
}, [vitals])
```

### 4. Renombrar IN_PROGRESS a "En Espera" en UI

Solo cambio de i18n — el enum en DB no cambia:

```typescript
// En translations.ts
appointments: {
  directory: {
    inProgress: { es: 'En Espera', en: 'Waiting' },
    // ...
  },
  status: {
    inProgress: { es: 'En Espera', en: 'Waiting' },
  }
}
```

## Archivos a crear/modificar

| Archivo | Cambio |
|---------|--------|
| `apps/api/prisma/schema.prisma` | **CREAR** modelo `AppointmentVitals` |
| `apps/api/src/appointments/appointments.controller.ts` | Agregar endpoints `POST/GET :id/vitals` |
| `apps/api/src/appointments/appointments.service.ts` | Agregar `saveVitals()`, `getVitals()` |
| `apps/api/src/appointments/dto/save-vitals.dto.ts` | **CREAR** DTO con validación de rangos |
| `apps/web/src/app/[slug]/operations/appointments/components/AgendaView.tsx` | Agregar botón "Tomar Signos Vitales" en modal CONFIRMED |
| `apps/web/src/app/[slug]/operations/appointments/[appointmentId]/edit/page.tsx` | Agregar botón en edit page |
| `apps/web/src/components/vitals/VitalsModal.tsx` | **CREAR** modal de signos vitales |
| `apps/web/src/app/[slug]/operations/patients/[patientId]/notes/new/page.tsx` | Leer appointmentId, precargar vitales |
| `apps/web/src/lib/i18n/translations.ts` | Agregar claves: `vitals.*`, `appointments.directory.inProgress` → "En Espera" |

## Criterios de Aceptación

- [ ] Modal de vitales solo visible si el user tiene permiso `notes:vitals`
- [ ] Modal de vitales solo visible en appointments CONFIRMED
- [ ] Al guardar vitales, status cambia a IN_PROGRESS (UI: "En Espera")
- [ ] BMI se calcula automáticamente
- [ ] Doctor ve vitales + subjective precargados al abrir nota
- [ ] Si no hay AppointmentVitals, formulario vacío (comportamiento actual)
- [ ] Si nadie en la org tiene `notes:vitals`, el botón no aparece en absoluto
- [ ] Owner puede tomar vitales aunque no tenga explícitamente `notes:vitals`
- [ ] Compatibilidad hacia atrás: notas existentes no se modifican
- [ ] Validación de rangos en backend (CHECK via DTO)
- [ ] BMI en backend: si weight y height presentes, calcular y guardar
