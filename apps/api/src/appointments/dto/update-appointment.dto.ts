import { IsString, IsOptional, IsEnum, IsDateString, IsInt, Min } from 'class-validator'
import { AppointmentStatus, AppointmentMode } from '@prisma/client'

export class UpdateAppointmentDto {
  @IsString()
  @IsOptional()
  patientId?: string

  @IsString()
  @IsOptional()
  userId?: string

  @IsString()
  @IsOptional()
  specialtyId?: string

  @IsDateString()
  @IsOptional()
  scheduledAt?: string

  @IsInt()
  @Min(1)
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

  @IsString()
  @IsOptional()
  notes?: string
}
