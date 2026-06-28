import { IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DealStageEnum {
  DISCOVERY = 'DISCOVERY',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
}

export class CreateDealDto {
  @ApiProperty({ example: 'Enterprise Software License' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: DealStageEnum, default: DealStageEnum.DISCOVERY })
  @IsOptional()
  @IsEnum(DealStageEnum)
  stage?: DealStageEnum;

  @ApiProperty({ description: 'Lead ID to which this deal belongs', example: 'cuid123456789' })
  @IsString()
  leadId: string;
}