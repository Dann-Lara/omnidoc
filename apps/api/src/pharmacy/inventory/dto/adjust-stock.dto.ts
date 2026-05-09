import { IsString, IsNotEmpty, IsNumber, Min, IsEnum, IsIn } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export enum LogType {
  DISPENSED = 'DISPENSED',
  RESTOCKED = 'RESTOCKED',
  ADJUSTED = 'ADJUSTED',
  EXPIRED = 'EXPIRED',
}

export class AdjustStockDto {
  @ApiProperty({ example: 'batch_xyz789', description: 'Batch ID to adjust' })
  @IsString()
  @IsNotEmpty({ message: 'Batch ID is required' })
  batchId: string

  @ApiProperty({ example: 10, description: 'Quantity (always positive, service decides +/-)' })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number

  @ApiProperty({ example: 'Inventory count correction', description: 'Reason for adjustment (required)' })
  @IsString()
  @IsNotEmpty({ message: 'Reason is required for manual adjustments' })
  reason: string

  @ApiProperty({ example: 'ADJUSTED', enum: LogType, description: 'Log type' })
  @IsEnum(LogType, { message: 'Invalid log type' })
  type: LogType = LogType.ADJUSTED
}
