import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsInt, IsArray, IsObject, Min } from 'class-validator';

export class CreateSequenceDto {
  @ApiProperty({ example: 'Q3 Outbound Campaign' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Targeting enterprise SaaS companies' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  aiEnabled?: boolean;

  @ApiPropertyOptional({ example: [{ day: 1, channel: 'email', template: 'Hello {name}...' }] })
  @IsOptional()
  @IsArray()
  steps?: any[];

  @ApiPropertyOptional({ example: { autoEnroll: false } })
  @IsOptional()
  @IsObject()
  enrollment?: Record<string, any>;

  @ApiPropertyOptional({ example: { exitOnReply: true } })
  @IsOptional()
  @IsObject()
  exitRules?: Record<string, any>;

  @ApiPropertyOptional({ example: ['outbound', 'q3'] })
  @IsOptional()
  @IsArray()
  tags?: string[];
}
