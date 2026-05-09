import { IsString, IsOptional, IsNumber, Min, IsDate, MaxDate } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateBatchDto {
  @ApiProperty({ example: 'BTH-2401-A9', required: false })
  @IsString()
  @IsOptional()
  batchNumber?: string

  @ApiProperty({ example: 100, required: false })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(0, { message: 'Quantity must be at least 0' })
  @IsOptional()
  quantity?: number

  @ApiProperty({ example: '2025-12-31', required: false })
  @IsDate()
  @Type(() => Date)
  @MaxDate(new Date('2030-12-31'), { message: 'Expiry date too far in future' })
  @IsOptional()
  expiryDate?: Date

  @ApiProperty({ example: 25.50, description: 'Cost per box', required: false })
  @IsNumber({}, { message: 'Cost must be a number' })
  @Min(0, { message: 'Cost must be at least 0' })
  @IsOptional()
  costPerBox?: number
}
