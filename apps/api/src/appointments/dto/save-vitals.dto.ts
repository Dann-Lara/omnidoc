import { IsOptional, IsString, IsNumber, IsInt, Min, Max } from 'class-validator'

export class SaveVitalsDto {
  @IsOptional()
  @IsString()
  bloodPressure?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(300)
  heartRate?: number

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(45)
  temperature?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  respRate?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  oxygenSat?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  weight?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  height?: number

  @IsOptional()
  @IsString()
  subjective?: string
}
