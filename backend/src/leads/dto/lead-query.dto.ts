/**
 * @file lead-query.dto.ts
 * @description Query params DTO for GET /leads — pagination, search, filter
 */

import { IsEnum, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LeadStatusEnum, LeadSourceEnum } from './create-lead.dto';

export class LeadQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search by name, email, or company' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: LeadStatusEnum })
  @IsOptional()
  @IsEnum(LeadStatusEnum)
  status?: LeadStatusEnum;

  @ApiPropertyOptional({ enum: LeadSourceEnum })
  @IsOptional()
  @IsEnum(LeadSourceEnum)
  source?: LeadSourceEnum;
}
