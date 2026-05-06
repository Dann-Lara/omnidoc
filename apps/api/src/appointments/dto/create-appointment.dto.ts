import { IsString, IsOptional, IsEnum, IsDateString, IsInt, Min } from 'class-validator'
import { AppointmentStatus, AppointmentMode } from '@prisma/client'

export class CreateAppointmentDto {
  @IsString()
  patientId: string

  @IsString()
  userId: string

  @IsString()
  @IsOptional()
  specialtyId?: string

  @IsDateString()
  scheduledAt: string

  @IsInt()
  @Min(1)
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

  @IsString()
  @IsOptional()
  notes?: string
}
