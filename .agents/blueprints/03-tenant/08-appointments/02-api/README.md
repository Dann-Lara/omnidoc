# 02-API - Endpoints Backend NestJS

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Fase** | 02 - API |
| **Estado** | ✅ Completado |
| **Dependencias** | Fase 01 (Schema), `patients/` module (patrón) |

---

## 🎯 Propósito

Crear el módulo `appointments/` en el backend NestJS siguiendo el patrón exacto de `patients/` para mantener consistencia.

**Nota**: Se usa `userId` (colaborador del tenant) en lugar de `doctorId`.

---

## 📁 Estructura de Archivos

```
apps/api/src/appointments/
├── appointments.module.ts
├── appointments.controller.ts
├── appointments.service.ts
└── dto/
    ├── create-appointment.dto.ts
    ├── update-appointment.dto.ts
    └── list-appointments-query.dto.ts
```

---

## 🏗️ `appointments.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../database/prisma.service';

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
```

---

## 🎮 `appointments.controller.ts`

```typescript
import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, Req, UseGuards,
  HttpCode, HttpStatus, Logger,
} from '@nestjs/common'
import { Request } from 'express'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard'
import { AppointmentsService } from './appointments.service'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'
import { ListAppointmentsQueryDto } from './dto/list-appointments-query.dto'

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(SupabaseAuthGuard)
export class AppointmentsController {
  private readonly logger = new Logger(AppointmentsController.name)

  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all appointments' })
  @ApiResponse({ status: 200, description: 'List of appointments' })
  async findAll(@Query() query: ListAppointmentsQueryDto, @Req() req: any) {
    const organizationId = req.user.organizationId
    return this.appointmentsService.findAll(organizationId, query)
  }

  @Get('kpis')
  @ApiOperation({ summary: 'Get appointment KPIs' })
  @ApiResponse({ status: 200, description: 'KPI data' })
  async getKpis(@Req() req: any) {
    const organizationId = req.user.organizationId
    return this.appointmentsService.getKpis(organizationId)
  }

  @Get('specialty/:specialtyId')
  @ApiOperation({ summary: 'Get appointments by specialty' })
  @ApiResponse({ status: 200, description: 'List of appointments' })
  async findBySpecialty(
    @Param('specialtyId') specialtyId: string,
    @Req() req: any,
  ) {
    const organizationId = req.user.organizationId
    return this.appointmentsService.findBySpecialty(organizationId, specialtyId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({ status: 200, description: 'Appointment details' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const organizationId = req.user.organizationId
    return this.appointmentsService.findOne(organizationId, id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created' })
  async create(@Body() dto: CreateAppointmentDto, @Req() req: any) {
    const userId = req.user.id  // Colaborador dueño de la cita
    const organizationId = req.user.organizationId
    return this.appointmentsService.create(userId, organizationId, dto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update appointment' })
  @ApiResponse({ status: 200, description: 'Appointment updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
    @Req() req: any,
  ) {
    const userId = req.user.id
    const organizationId = req.user.organizationId
    return this.appointmentsService.update(userId, organizationId, id, dto)
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update appointment status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Req() req: any,
  ) {
    const userId = req.user.id
    const organizationId = req.user.organizationId
    return this.appointmentsService.updateStatus(userId, organizationId, id, body.status)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete appointment' })
  @ApiResponse({ status: 200, description: 'Appointment deleted' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id
    const organizationId = req.user.organizationId
    return this.appointmentsService.remove(userId, organizationId, id)
  }
}
```

---

## 🔧 `appointments.service.ts`

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'
import { ListAppointmentsQueryDto } from './dto/list-appointments-query.dto'
import { AppointmentStatus, AppointmentMode } from '@prisma/client'

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, query: ListAppointmentsQueryDto) {
    const { search, status, userId, specialtyId, startDate, endDate, page = 1, limit = 20 } = query
    const skip = (page - 1) * limit

    const where: any = { organizationId }

    if (search) {
      where.OR = [
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { firstName: { contains: search, mode: 'insensitive' } },  // user = colaborador
        { user: { lastName: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) where.status = status
    if (userId) where.userId = userId  // Colaborador dueño de la cita
    if (specialtyId) where.specialtyId = specialtyId
    if (startDate && endDate) {
      where.scheduledAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          user: { select: { id: true, firstName: true, lastName: true, specialty: true } },  // user = colaborador
          specialty: { select: { id: true, nameEn: true, nameEs: true } },
        },
        orderBy: { scheduledAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ])

    return {
      data: appointments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getKpis(organizationId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [todayCount, pendingCount, cancelledCount] = await Promise.all([
      this.prisma.appointment.count({
        where: {
          organizationId,
          scheduledAt: { gte: today, lt: tomorrow },
        },
      }),
      this.prisma.appointment.count({
        where: { organizationId, status: 'SCHEDULED' },
      }),
      this.prisma.appointment.count({
        where: { organizationId, status: 'CANCELED' },
      }),
    ])

    return {
      today: todayCount,
      pending: pendingCount,
      cancelled: cancelledCount,
    }
  }

  async findBySpecialty(organizationId: string, specialtyId: string) {
    return this.prisma.appointment.findMany({
      where: { organizationId, specialtyId },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    })
  }

  async findOne(organizationId: string, id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        user: true,  // user = colaborador dueño
        specialty: true,
      },
    })

    if (!appointment || appointment.organizationId !== organizationId) {
      throw new NotFoundException('Appointment not found')
    }

    return appointment
  }

  async create(userId: string, organizationId: string, dto: CreateAppointmentDto) {
    // Validar que patient pertenezca a la org
    const patient = await this.prisma.patient.findUnique({ where: { id: dto.patientId } })
    if (!patient || patient.organizationId !== organizationId) {
      throw new NotFoundException('Patient not found in this organization')
    }

    // Validar que el colaborador (userId) pertenezca a la org
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.organizationId !== organizationId) {
      throw new NotFoundException('User not found in this organization')
    }

    // Validar solapamiento de horario del colaborador
    const conflicting = await this.prisma.appointment.findFirst({
      where: {
        userId: userId,
        scheduledAt: new Date(dto.scheduledAt),
        organizationId,
      },
    })

    if (conflicting) {
      throw new ConflictException('User already has an appointment at this time')
    }

    return this.prisma.appointment.create({
      data: {
        organizationId,
        patientId: dto.patientId,
        userId: userId,  // Colaborador dueño de la cita
        specialtyId: dto.specialtyId,
        scheduledAt: new Date(dto.scheduledAt),
        duration: dto.duration,
        status: dto.status || 'SCHEDULED',
        mode: dto.mode || 'IN_PERSON',
        type: dto.type,
        room: dto.room,
        reason: dto.reason,
      },
      include: {
        patient: true,
        user: true,
        specialty: true,
      },
    })
  }

  async update(userId: string, organizationId: string, id: string, dto: UpdateAppointmentDto) {
    const existing = await this.prisma.appointment.findUnique({
      where: { id },
    })

    if (!existing || existing.organizationId !== organizationId) {
      throw new NotFoundException('Appointment not found')
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        patientId: dto.patientId,
        userId: dto.userId,
        specialtyId: dto.specialtyId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        duration: dto.duration,
        status: dto.status,
        mode: dto.mode,
        type: dto.type,
        room: dto.room,
        reason: dto.reason,
      },
    })
  }

  async updateStatus(userId: string, organizationId: string, id: string, status: string) {
    const existing = await this.prisma.appointment.findUnique({
      where: { id },
    })

    if (!existing || existing.organizationId !== organizationId) {
      throw new NotFoundException('Appointment not found')
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: status as AppointmentStatus },
    })
  }

  async remove(userId: string, organizationId: string, id: string) {
    const existing = await this.prisma.appointment.findUnique({
      where: { id },
    })

    if (!existing || existing.organizationId !== organizationId) {
      throw new NotFoundException('Appointment not found')
    }

    await this.prisma.appointment.delete({ where: { id } })
    return { deleted: true }
  }
}
```

---

## 📋 DTOs

### `create-appointment.dto.ts`

```typescript
import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator'
import { AppointmentStatus, AppointmentMode } from '@prisma/client'

export class CreateAppointmentDto {
  @IsString()
  patientId: string

  @IsString()
  @IsOptional()
  userId?: string  // Colaborador (opcional, si no se pasa se usa req.user.id)

  @IsString()
  @IsOptional()
  specialtyId?: string

  @IsDateString()
  scheduledAt: string

  @IsNumber()
  duration: number

  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus

  @IsEnum(AppointmentMode)
  @IsOptional()
  mode?: AppointmentMode

  @IsString()
  type: string

  @IsString()
  @IsOptional()
  room?: string

  @IsString()
  @IsOptional()
  reason?: string
}
```

### `update-appointment.dto.ts`

```typescript
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator'
import { AppointmentStatus, AppointmentMode } from '@prisma/client'

export class UpdateAppointmentDto {
  @IsString()
  @IsOptional()
  patientId?: string

  @IsString()
  @IsOptional()
  userId?: string  // Colaborador

  @IsString()
  @IsOptional()
  specialtyId?: string

  @IsString()
  @IsOptional()
  scheduledAt?: string

  @IsNumber()
  @IsOptional()
  duration?: number

  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus

  @IsEnum(AppointmentMode)
  @IsOptional()
  mode?: AppointmentMode

  @IsString()
  @IsOptional()
  type?: string

  @IsString()
  @IsOptional()
  room?: string

  @IsString()
  @IsOptional()
  reason?: string
}
```

### `list-appointments-query.dto.ts`

```typescript
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator'
import { Transform } from 'class-transformer'
import { AppointmentStatus } from '@prisma/client'

export class ListAppointmentsQueryDto {
  @IsString()
  @IsOptional()
  search?: string

  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus

  @IsString()
  @IsOptional()
  userId?: string  // Colaborador

  @IsString()
  @IsOptional()
  specialtyId?: string

  @IsString()
  @IsOptional()
  startDate?: string

  @IsString()
  @IsOptional()
  endDate?: string

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  page?: number

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  limit?: number
}
```

---

## 🔗 Integración en `app.module.ts`

```typescript
// Agregar import
import { AppointmentsModule } from './appointments/appointments.module'

// Agregar en imports: [...AppointmentsModule ]
```

---

## ✅ Criterios de Aceptación

- [ ] Módulo `appointments/` creado
- [ ] Endpoints implementados según tabla
- [ ] Usar `userId` (colaborador) en lugar de `doctorId`
- [ ] Validación de pertenencia a `organizationId`
- [ ] Validación de solapamiento de horario del colaborador
- [ ] DTOs con `class-validator`
- [ ] Módulo registrado en `app.module.ts`

---

## 🔗 Siguiente Fase

**03-directory/README.md** → Directorio y tabla de citas
