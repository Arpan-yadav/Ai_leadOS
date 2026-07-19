import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CommunicationsService } from './communications.service';

@Controller('communications')
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Get()
  async getLogs(@Query('leadId') leadId?: string) {
    if (leadId) {
      return this.communicationsService.getLogsForLead(leadId);
    }
    return this.communicationsService.getAllLogs();
  }

  @Post('send')
  async sendMessage(@Body() body: { leadId?: string; recipient?: string; channel: string; content: string; subject?: string }) {
    return this.communicationsService.sendMessage(body.leadId, body.recipient, body.channel, body.content, body.subject);
  }

  @Post('webhook/resend')
  async handleResendWebhook(@Body() payload: any) {
    return this.communicationsService.handleEmailWebhook(payload);
  }

  @Post('webhook/whatsapp')
  async handleWhatsAppWebhook(@Body() payload: any) {
    return this.communicationsService.handleWhatsAppWebhook(payload);
  }

  @Post('generate-message')
  async generateMessage(@Body() body: { leadName: string; company: string; context?: string }) {
    return this.communicationsService.generatePersonalizedMessage(body.leadName, body.company, body.context);
  }

  @Post('suggest-time')
  async suggestTime(@Body() body: { leadName: string; company: string }) {
    return this.communicationsService.suggestOptimalSendTime(body.leadName, body.company);
  }
}
