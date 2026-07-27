import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class GenerateMessageDto {
  @ApiProperty({ description: 'Name of the lead to generate message for' })
  @IsString()
  @IsNotEmpty()
  leadName: string;

  @ApiProperty({ description: 'Company of the lead' })
  @IsString()
  @IsNotEmpty()
  company: string;

  @ApiPropertyOptional({ description: 'Context or specific channel to guide AI generation' })
  @IsString()
  @IsOptional()
  context?: string;

  @ApiPropertyOptional({ description: 'Lead ID to fetch past AI insights or history' })
  @IsString()
  @IsOptional()
  leadId?: string;

  @ApiPropertyOptional({ description: 'Optional previous history to give the AI context' })
  @IsString()
  @IsOptional()
  history?: string;
}
