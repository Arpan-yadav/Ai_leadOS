import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsObject, IsArray, IsEnum } from 'class-validator';
import { WorkflowStatus } from '@prisma/client';

export class CreateWorkflowDto {
  @ApiProperty({ description: 'The name of the workflow' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'A brief description of the workflow' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: WorkflowStatus, default: WorkflowStatus.DRAFT })
  @IsEnum(WorkflowStatus)
  @IsOptional()
  status?: WorkflowStatus;

  @ApiPropertyOptional({ description: 'Whether this workflow contains AI decision nodes' })
  @IsBoolean()
  @IsOptional()
  hasAINodes?: boolean;

  @ApiProperty({ description: 'The JSON definition of the workflow (nodes and edges)' })
  @IsObject()
  definition: Record<string, any>;

  @ApiPropertyOptional({ description: 'Tags for categorizing the workflow' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
