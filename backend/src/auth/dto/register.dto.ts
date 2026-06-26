/**
 * @file register.dto.ts
 * @description Register Request DTO with validation
 * Sprint 1 — Backend Team Deliverable
 */

import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EXECUTIVE = 'EXECUTIVE',
}

export class RegisterDto {
  @ApiProperty({ example: 'Sarah Chen' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @ApiProperty({ example: 'sarah@aileados.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'StrongPass123!', description: 'Min 8 characters' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.EXECUTIVE })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
