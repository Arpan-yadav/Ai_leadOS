import { Controller, Get, Post, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommunicationsService } from './communications.service';
import { SendMessageDto } from './dto/send-message.dto';
import { GenerateMessageDto } from './dto/generate-message.dto';
import { SuggestTimeDto } from './dto/suggest-time.dto';

@ApiTags('Communications')
@Controller('communications')
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Get()
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get communications history for a tenant or a specific lead' })
  async getLogs(@Request() req: any, @Query('leadId') leadId?: string) {
    const { tenantId, isSuperAdmin } = req.user;
    if (leadId) {
      return this.communicationsService.getLogsForLead(leadId);
    }
    return this.communicationsService.getAllLogs(tenantId, isSuperAdmin);
  }

  @Post('send')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Send a message (Email, WhatsApp, LinkedIn, Meta)' })
  async sendMessage(@Body() body: SendMessageDto) {
    return this.communicationsService.sendMessage(body.leadId, body.recipient, body.channel, body.content, body.subject);
  }

  @Post('webhook/resend')
  @ApiOperation({ summary: 'Incoming webhook from Resend for email events (No JWT required)' })
  async handleResendWebhook(@Body() payload: any) {
    return this.communicationsService.handleEmailWebhook(payload);
  }

  @Post('webhook/whatsapp')
  @ApiOperation({ summary: 'Incoming webhook from Meta for WhatsApp messages (No JWT required)' })
  async handleWhatsAppWebhook(@Body() payload: any) {
    return this.communicationsService.handleWhatsAppWebhook(payload);
  }

  @Post('generate-message')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate a personalized message via AI' })
  async generateMessage(
    @Request() req: any,
    @Body() body: GenerateMessageDto
  ) {
    return this.communicationsService.generatePersonalizedMessage(
      body.leadName, body.company, body.context, body.leadId, body.history, req.user?.tenantId
    );
  }

  @Post('suggest-time')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Suggest the optimal send time via AI' })
  async suggestTime(@Body() body: SuggestTimeDto) {
    return this.communicationsService.suggestOptimalSendTime(body.leadName, body.company);
  }
}
