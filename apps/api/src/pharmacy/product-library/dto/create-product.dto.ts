import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, MaxLength, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateProductDto {
  @ApiProperty({ example: 'Amoxicillin Trihydrate', description: 'Commercial product name' })
  @IsString()
  @IsNotEmpty({ message: 'Commercial name is required' })
  @MinLength(2, { message: 'Commercial name too short' })
  @MaxLength(200, { message: 'Commercial name too long' })
  commercialName: string

  @ApiProperty({ example: 'Amoxicillin', description: 'Active substance' })
  @IsString()
  @IsNotEmpty({ message: 'Active substance is required' })
  @MinLength(2, { message: 'Active substance too short' })
  activeSubstance: string

  @ApiProperty({ example: '500mg Capsules', description: 'Dosage/presentation' })
  @IsString()
  @IsNotEmpty({ message: 'Presentation is required' })
  presentation: string

  @ApiProperty({ example: 'PharmaCorp', description: 'Laboratory/manufacturer' })
  @IsString()
  @IsNotEmpty({ message: 'Laboratory is required' })
  laboratory: string

  @ApiProperty({ example: '750103131130', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Barcode too long' })
  barcode?: string

  @ApiProperty({ example: 30, description: 'Units per box', required: false })
  @IsNumber()
  @IsOptional()
  @Min(1, { message: 'Units per box must be at least 1' })
  unitsPerBox?: number
}
