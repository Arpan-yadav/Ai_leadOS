/**
 * @file create-lead.dto.ts
 * @description DTO for creating a new lead — Sprint 2, Backend + AI Team
 */

import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum LeadSourceEnum {
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
  META_LEADS = 'META_LEADS',
  LINKEDIN = 'LINKEDIN',
  WEBSITE = 'WEBSITE',
  COLD_OUTREACH = 'COLD_OUTREACH',
  REFERRAL = 'REFERRAL',
}

export enum LeadStatusEnum {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  UNQUALIFIED = 'UNQUALIFIED',
  CONVERTED = 'CONVERTED',
}

export class CreateLeadDto {
  @ApiProperty({ example: 'James Wilson' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'james@techcorp.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'TechCorp Inc.' })
  @IsString()
  @MinLength(2)
  company: string;

  @ApiPropertyOptional({ example: 'CTO' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: '+91-9876543210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://techcorp.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/jameswilson' })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiPropertyOptional({ enum: LeadSourceEnum, default: LeadSourceEnum.WEBSITE })
  @IsOptional()
  @IsEnum(LeadSourceEnum)
  source?: LeadSourceEnum;

  @ApiPropertyOptional({ enum: LeadStatusEnum, default: LeadStatusEnum.NEW })
  @IsOptional()
  @IsEnum(LeadStatusEnum)
  status?: LeadStatusEnum;
}
