import { IsString, IsOptional, IsEnum, IsDateString, IsInt, Min, Max } from 'class-validator'
import { Transform } from 'class-transformer'
import { AppointmentStatus, AppointmentMode } from '@prisma/client'

export class ListAppointmentsQueryDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  search?: string

  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus

  @IsEnum(AppointmentMode)
  @IsOptional()
  mode?: AppointmentMode

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
  startDate?: string

  @IsDateString()
  @IsOptional()
  endDate?: string

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1))
  page?: number = 1

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 20))
  limit?: number = 20
}
