import { ApiProperty } from '@nestjs/swagger';
import { DealStage } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateStageDto {
  @ApiProperty({
    enum: DealStage,
    example: DealStage.PROPOSAL,
    description: 'New stage for the deal',
  })
  @IsEnum(DealStage)
  stage: DealStage;
}