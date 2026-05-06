# 07-Patients - API Backend

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Módulo** | Patients API |
| **Estado** | ⏳ Pendiente |
| **Dependencias** | 01-schema |

---

## 🎯 Propósito

Definir los endpoints API del backend para el módulo de pacientes.

---

## 📋 Endpoints

### 1. Patients CRUD

| Método | Endpoint | Descripción | Permiso |
|--------|---------|------------|---------|
| GET | `/patients` | Listar pacientes | `patients:read` |
| GET | `/patients/:id` | Obtener paciente | `patients:read` |
| POST | `/patients` | Crear paciente | `patients:write:base` |
| PUT | `/patients/:id` | Actualizar paciente | `patients:write:base` |
| DELETE | `/patients/:id` | Eliminar paciente | `patients:write:all` |

#### Query Params (GET /patients)

```typescript
{
  search?: string      // Búsqueda por nombre
  documentType?: string
  documentId?: string
  page?: number
  limit?: number
}
```

### 2. Patient Notes

| Método | Endpoint | Descripción | Permiso |
|--------|---------|------------|---------|
| GET | `/patients/:id/notes` | Listar notas | `notes:read` |
| GET | `/patients/:id/notes/:noteId` | Obtener nota | `notes:read` |
| POST | `/patients/:id/notes` | Crear nota | `notes:write` |
| POST | `/patients/:id/notes/:noteId/seal` | Sellar nota | `notes:seal` |

### 3. Patient Audit

| Método | Endpoint | Descripción | Permiso |
|--------|---------|------------|---------|
| GET | `/patients/:id/audit` | Historial de cambios | `patients:read` |

---

## 🎯 Estructura de Módulos NestJS

### patients.module.ts

```typescript
@Module({
  imports: [
    forwardRef(() => PatientNotesModule),
    forwardRef(() => PatientAuditModule),
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
```

### patients.controller.ts

```typescript
@Controller('patients')
@UseGuards(SupabaseAuthGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @RequirePermissions('patients:read')
  async findAll(@Req() req: IRequest, @Query() query: ListPatientsQuery) {
    return this.patientsService.findAll(req.user.organizationId, query)
  }

  @Get(':id')
  @RequirePermissions('patients:read')
  async findOne(@Req() req: IRequest, @Param('id') id: string) {
    return this.patientsService.findOne(req.user.organizationId, id)
  }

  @Post()
  @RequirePermissions('patients:write:base')
  async create(@Req() req: IRequest, @Body() dto: CreatePatientDto) {
    return this.patientsService.create(req.user, dto)
  }

  @Put(':id')
  @RequirePermissions('patients:write:base')
  async update(
    @Req() req: IRequest,
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.patientsService.update(req.user, id, dto)
  }

  @Delete(':id')
  @RequirePermissions('patients:write:all')
  async remove(@Req() req: IRequest, @Param('id') id: string) {
    return this.patientsService.remove(req.user, id)
  }
}
```

### patient-notes.controller.ts

```typescript
@Controller('patients/:patientId/notes')
@UseGuards(SupabaseAuthGuard)
export class PatientNotesController {
  constructor(private readonly notesService: PatientNotesService) {}

  @Get()
  @RequirePermissions('notes:read')
  async findAll(
    @Req() req: IRequest,
    @Param('patientId') patientId: string,
  ) {
    return this.notesService.findAll(req.user.organizationId, patientId)
  }

  @Post()
  @RequirePermissions('notes:write')
  async create(
    @Req() req: IRequest,
    @Param('patientId') patientId: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.create(req.user, patientId, dto)
  }

  @Post(':id/seal')
  @RequirePermissions('notes:seal')
  async seal(
    @Req() req: IRequest,
    @Param('patientId') patientId: string,
    @Param('id') id: string,
  ) {
    return this.notesService.seal(req.user, patientId, id)
  }
}
```

---

## 🔐 Middleware de Permisos

Usar el sistema existente de `RequirePermissions`:

```typescript
// decorators/permissions.decorator.ts
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions)
```

En `patients.service.ts`:

```typescript
async findAll(organizationId: string, query: ListPatientsQuery) {
  const where = { organizationId }
  
  if (query.search) {
    where.OR = [
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
    ]
  }
  
  if (query.documentId) {
    where.documentId = query.documentId
  }
  
  return this.prisma.patient.findMany({
    where,
    include: { _count: { select: { notes: true } },
    orderBy: { createdAt: 'desc' },
    skip: (query.page - 1) * query.limit,
    take: query.limit,
  })
}
```

---

## 📝 DTOs

### create-patient.dto.ts

```typescript
export class CreatePatientDto {
  @IsString()
  @IsOptional()
  documentType?: DocumentType

  @IsString()
  @IsOptional()
  documentId?: string

  @IsString()
  firstName: string

  @IsString()
  lastName: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  phone?: string

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender

  @IsEnum(BloodType)
  @IsOptional()
  bloodType?: BloodType

  @IsString()
  @IsOptional()
  emergencyContact?: string

  @IsString()
  @IsOptional()
  emergencyPhone?: string

  @IsArray()
  @IsOptional()
  allergies?: string[]
}
```

### create-note.dto.ts

```typescript
export class CreateNoteDto {
  // Signos vitales
  @IsString()
  @IsOptional()
  bloodPressure?: string

  @IsInt()
  @IsOptional()
  heartRate?: number

  @IsNumber()
  @IsOptional()
  temperature?: number

  @IsInt()
  @IsOptional()
  respRate?: number

  @IsInt()
  @IsOptional()
  oxygenSat?: number

  @IsNumber()
  @IsOptional()
  weight?: number

  @IsNumber()
  @IsOptional()
  height?: number

  // Contenido
  @IsString()
  @IsOptional()
  subjective?: string

  @IsString()
  @IsOptional()
  diagnosis?: string

  @IsString()
  @IsOptional()
  plan?: string

  @IsString()
  @IsOptional()
  specialtyId?: string
}
```

---

## ✅ Criterios de Aceptación (AC)

| AC | Descripción | Criterio |
|----|------------|----------|
| 1.1 | Filtros | Query params en GET /patients |
| 2.1 | Signos vitales | En CreateNoteDto |
| 2.2 | Sellado | Endpoint POST /seal con hash |
| 2.3 | Timestamp | Campo sealedAt + signature |
| 4.1 | RLS | organizationId en todas las queries |
| 4.3 | Control roles | RequirePermissions decorator |

---

## 🚀 Pasos de Ejecución

1. **Crear módulo** `patients` en `apps/api/src/patients/`
2. **Crear módulo** `patient-notes` en `apps/api/src/patient-notes/`
3. **Crear servicio** `patient-audit` en `apps/api/src/patient-audit/`
4. **Implementar** DTOs con class-validator
5. **Middleware** de permisos
6. **Probar** con `pnpm dev:api`
7. **Typecheck**: `pnpm typecheck`

---

## 🔗 Dependencias

- Schema en `01-schema`
- Auth existente (SupabaseAuthGuard)
- Permisos existentes (RequirePermissions)