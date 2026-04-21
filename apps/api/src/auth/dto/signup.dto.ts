import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum, IsArray, ArrayMinSize, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72, { message: 'Password too long' })
  password: string;

  @ApiProperty({ example: 'My Clinic' })
  @IsString()
  @MinLength(2, { message: 'Organization name too short' })
  @MaxLength(100, { message: 'Organization name too long' })
  orgName: string;

  @ApiProperty({ example: 'INDIVIDUAL', enum: ['INDIVIDUAL', 'CLINIC'], required: false })
  @IsOptional()
  @IsEnum(['INDIVIDUAL', 'CLINIC'])
  orgType?: 'INDIVIDUAL' | 'CLINIC';

  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: ['cardiology', 'pediatrics'], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one specialty is required' })
  specialties?: string[];

  @ApiProperty({ example: 'es', enum: ['en', 'es'], required: false })
  @IsOptional()
  @IsIn(['en', 'es'])
  lang?: 'en' | 'es';
}
