import { IsString, IsNotEmpty, IsNumber, Min, IsDate, IsOptional, MaxDate } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class RestockDto {
  @ApiProperty({ example: 'prod_abc123', description: 'Product ID from catalog' })
  @IsString()
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: string

  @ApiProperty({ example: 100, description: 'Quantity to add' })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number

  @ApiProperty({ example: '2025-12-31', description: 'Expiry date (must be future)' })
  @IsDate()
  @Type(() => Date)
  @MaxDate(new Date('2030-12-31'), { message: 'Expiry date too far in future' })
  expiryDate: Date

  @ApiProperty({ example: 'BTH-2401-A9', required: false })
  @IsString()
  @IsOptional()
  batchNumber?: string

  @ApiProperty({ example: 25.50, description: 'Cost per box in tenant currency', required: false })
  @IsNumber({}, { message: 'Cost must be a number' })
  @Min(0, { message: 'Cost must be at least 0' })
  @IsOptional()
  costPerBox?: number
}
