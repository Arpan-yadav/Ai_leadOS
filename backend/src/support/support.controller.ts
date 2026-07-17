import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Support')
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('faqs')
  @ApiOperation({ summary: 'Get all FAQs' })
  async getFaqs() {
    return this.supportService.getFaqs();
  }

  @UseGuards(JwtAuthGuard)
  @Post('ticket')
  @ApiOperation({ summary: 'Submit a new support ticket' })
  async submitTicket(
    @Body() body: { subject: string; message: string },
    @Req() req: any
  ) {
    return this.supportService.submitTicket(body.subject, body.message, req.user.id);
  }
}
