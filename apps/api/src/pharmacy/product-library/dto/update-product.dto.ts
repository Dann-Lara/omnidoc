import { IsString, IsOptional, IsNumber, Min } from 'class-validator'

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  commercialName?: string

  @IsString()
  @IsOptional()
  activeSubstance?: string

  @IsString()
  @IsOptional()
  presentation?: string

  @IsString()
  @IsOptional()
  laboratory?: string

  @IsString()
  @IsOptional()
  barcode?: string

  @IsNumber()
  @IsOptional()
  @Min(1)
  unitsPerBox?: number
}
