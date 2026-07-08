import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhooksService, IncomingLeadPayload } from './webhooks.service';

@Controller('api/webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('incoming-lead')
  @HttpCode(HttpStatus.OK)
  async handleIncomingLead(@Body() payload: IncomingLeadPayload) {
    // Note: In production, we'd verify Webhook signatures here (e.g., from Meta or Stripe)
    const lead = await this.webhooksService.processIncomingLead(payload);
    return { success: true, leadId: lead.id };
  }
}
