import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SuggestTimeDto {
  @ApiProperty({ description: 'Name of the lead' })
  @IsString()
  @IsNotEmpty()
  leadName: string;

  @ApiProperty({ description: 'Company of the lead' })
  @IsString()
  @IsNotEmpty()
  company: string;
}
