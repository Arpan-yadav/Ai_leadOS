import { Controller, Get, Post, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommunicationsService } from './communications.service';

@Controller('communications')
@UseGuards(JwtAuthGuard)
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Get()
  async getLogs(@Request() req: any, @Query('leadId') leadId?: string) {
    const { tenantId, isSuperAdmin } = req.user;
    if (leadId) {
      return this.communicationsService.getLogsForLead(leadId);
    }
    return this.communicationsService.getAllLogs(tenantId, isSuperAdmin);
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
  async generateMessage(
    @Request() req: any,
    @Body() body: { leadName: string; company: string; context?: string; leadId?: string; history?: string }
  ) {
    return this.communicationsService.generatePersonalizedMessage(
      body.leadName, body.company, body.context, body.leadId, body.history, req.user?.tenantId
    );
  }

  @Post('suggest-time')
  async suggestTime(@Body() body: { leadName: string; company: string }) {
    return this.communicationsService.suggestOptimalSendTime(body.leadName, body.company);
  }
}
