import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator'
import { Transform } from 'class-transformer'
import { DocumentType } from '../types/patient.types'

export class ListPatientsQueryDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  search?: string

  @IsEnum(DocumentType)
  @IsOptional()
  documentType?: DocumentType

  @IsString()
  @IsOptional()
  documentId?: string

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