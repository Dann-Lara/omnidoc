import { IsString, IsNotEmpty, IsArray, ValidateNested, Min, IsNumber } from 'class-validator'
import { Type } from 'class-transformer'

export class DispenseItemDto {
  @IsString()
  productId: string

  @IsNumber()
  @Min(1)
  quantity: number
}

export class DispenseDto {
  @IsString()
  @IsNotEmpty()
  patientId: string

  @IsString()
  @IsNotEmpty()
  noteId: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DispenseItemDto)
  medications: DispenseItemDto[]
}
