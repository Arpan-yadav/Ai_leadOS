import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateActivityDto {
  @ApiProperty({ example: 'call', enum: ['call', 'email', 'note', 'whatsapp'] })
  @IsIn(['call', 'email', 'note', 'whatsapp'])
  type: string;

  @ApiProperty({ example: 'Called the client regarding pricing.' })
  @IsString()
  content: string;

  @ApiProperty({ example: 'cmr3t9cx200068pgr783tltnx' })
  @IsString()
  leadId: string;

  @ApiPropertyOptional({ example: { source: 'manual' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}