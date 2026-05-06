import { IsString, IsOptional, IsNumber, Min, Max, IsEnum } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateNoteDto {
  @IsString()
  @IsOptional()
  specialtyId?: string

  @IsString()
  @IsOptional()
  bloodPressure?: string

  @IsNumber()
  @Min(30)
  @Max(250)
  @IsOptional()
  heartRate?: number

  @IsNumber()
  @Min(35)
  @Max(42)
  @IsOptional()
  temperature?: number

  @IsNumber()
  @Min(5)
  @Max(50)
  @IsOptional()
  respRate?: number

  @IsNumber()
  @Min(50)
  @Max(100)
  @IsOptional()
  oxygenSat?: number

  @IsNumber()
  @Min(1)
  @Max(300)
  @IsOptional()
  weight?: number

  @IsNumber()
  @Min(50)
  @Max(250)
  @IsOptional()
  height?: number

  @IsNumber()
  @Min(10)
  @Max(60)
  @IsOptional()
  bmi?: number

  @IsString()
  @IsOptional()
  subjective?: string

  @IsString()
  @IsOptional()
  diagnosis?: string

  @IsString()
  @IsOptional()
  plan?: string

  @IsOptional()
  isChronic?: boolean
}