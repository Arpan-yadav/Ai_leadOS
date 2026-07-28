import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export enum CommunicationChannel {
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  LINKEDIN = 'LINKEDIN',
  META = 'META',
}

export class SendMessageDto {
  @ApiPropertyOptional({ description: 'ID of the lead to send the message to (optional if recipient is provided)' })
  @IsString()
  @IsOptional()
  leadId?: string;

  @ApiPropertyOptional({ description: 'Email, phone, or ID of the recipient (optional if leadId is provided)' })
  @IsString()
  @IsOptional()
  recipient?: string;

  @ApiProperty({ enum: CommunicationChannel, description: 'Channel to send the message through' })
  @IsEnum(CommunicationChannel)
  @IsNotEmpty()
  channel: CommunicationChannel;

  @ApiProperty({ description: 'The content of the message' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Subject (for emails)' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional({ description: 'ID of the specific EmailAccount or WhatsAppAccount to use (bypasses AI auto-router)' })
  @IsString()
  @IsOptional()
  accountId?: string;
}
