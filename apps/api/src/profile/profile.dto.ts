import { IsString, IsOptional, MaxLength, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({ example: 'Cardiology', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialty?: string;

  @ApiProperty({ example: ['cmo1j5wnr0000ncf49jvbde0g'], required: false })
  @IsOptional()
  @IsArray()
  specialtyIds?: string[];
}

export class UpdateAvatarDto {
  @ApiProperty({ description: 'Base64 encoded image', example: 'data:image/png;base64,...' })
  @IsString()
  @MaxLength(10000000)
  avatar: string;
}

export class UpdateOrganizationDto {
  @ApiProperty({ example: 'My Medical Practice', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
