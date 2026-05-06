import { IsString, IsOptional, IsEnum, IsEmail, IsDateString, IsArray, IsBoolean } from 'class-validator'
import { DocumentType, Gender, BloodType } from '../types/patient.types'

export class CreatePatientDto {
  @IsEnum(DocumentType)
  @IsOptional()
  documentType?: DocumentType

  @IsString()
  @IsOptional()
  documentId?: string

  @IsString()
  firstName: string

  @IsString()
  lastName: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  phone?: string

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender

  @IsEnum(BloodType)
  @IsOptional()
  bloodType?: BloodType

  @IsString()
  @IsOptional()
  emergencyContact?: string

  @IsString()
  @IsOptional()
  emergencyPhone?: string

  @IsArray()
  @IsOptional()
  allergies?: string[]

  @IsBoolean()
  @IsOptional()
  isChronic?: boolean
}