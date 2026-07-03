import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ActivityQueryDto {
  @ApiPropertyOptional({
    description: 'Filter activities by Lead ID',
  })
  @IsOptional()
  @IsString()
  leadId?: string;
}