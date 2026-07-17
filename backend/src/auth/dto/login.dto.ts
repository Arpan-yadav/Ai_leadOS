/**
 * @file login.dto.ts
 * @description Login Request DTO with validation
 * Sprint 1 — Backend Team Deliverable
 */

import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'sarah@aileados.com',
    description: 'User email address',
  })
  @IsString({ message: 'Please provide a valid email or username' })
  email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'User password (min 8 characters)',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}
