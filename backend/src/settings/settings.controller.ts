import {
  Controller, Get, Patch, Post, Delete, Param, Body, Request, UseGuards
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';
import {
  UpdateAiSettingsDto, UpdateWhatsAppSettingsDto,
  UpdateEmailSettingsDto, TestWhatsAppDto, TestEmailDto
} from './dto/settings.dto';

@ApiTags('Settings')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user settings (keys masked)' })
  getSettings(@Request() req: any) {
    return this.settingsService.getSettings(req.user.tenantId);
  }

  @Patch('ai')
  @ApiOperation({ summary: 'Save Gemini API key' })
  updateAi(@Request() req: any, @Body() dto: UpdateAiSettingsDto) {
    return this.settingsService.updateAiSettings(req.user.tenantId, dto);
  }

  @Patch('whatsapp')
  @ApiOperation({ summary: 'Save Meta Cloud API WhatsApp credentials' })
  updateWhatsApp(@Request() req: any, @Body() dto: UpdateWhatsAppSettingsDto) {
    return this.settingsService.updateWhatsAppSettings(req.user.tenantId, dto);
  }

  @Post('whatsapp/test')
  @ApiOperation({ summary: 'Send a test WhatsApp message to verify credentials' })
  testWhatsApp(@Request() req: any, @Body() dto: TestWhatsAppDto) {
    return this.settingsService.testWhatsApp(req.user.tenantId, dto.testPhone);
  }

  @Patch('email')
  @ApiOperation({ summary: 'Save email provider configuration' })
  updateEmail(@Request() req: any, @Body() dto: UpdateEmailSettingsDto) {
    return this.settingsService.updateEmailSettings(req.user.tenantId, dto);
  }

  @Post('email/test')
  @ApiOperation({ summary: 'Send a test email to verify configuration' })
  testEmail(@Request() req: any, @Body() dto: TestEmailDto) {
    return this.settingsService.testEmail(req.user.tenantId, dto.testEmail);
  }

  // ─── Multi-Account Management ───────────────────────────────────────────────

  @Get('email-accounts')
  @ApiOperation({ summary: 'List all email accounts for AI routing pool' })
  listEmailAccounts(@Request() req: any) {
    return this.settingsService.listEmailAccounts(req.user.tenantId);
  }

  @Post('email-accounts')
  @ApiOperation({ summary: 'Add a new email account' })
  addEmailAccount(@Request() req: any, @Body() dto: any) {
    return this.settingsService.addEmailAccount(req.user.tenantId, dto);
  }

  @Delete('email-accounts/:id')
  @ApiOperation({ summary: 'Delete an email account' })
  deleteEmailAccount(@Request() req: any, @Param('id') id: string) {
    return this.settingsService.deleteEmailAccount(req.user.tenantId, id);
  }

  @Get('whatsapp-accounts')
  @ApiOperation({ summary: 'List all WhatsApp accounts' })
  listWhatsAppAccounts(@Request() req: any) {
    return this.settingsService.listWhatsAppAccounts(req.user.tenantId);
  }

  @Post('whatsapp-accounts')
  @ApiOperation({ summary: 'Add a new WhatsApp account' })
  addWhatsAppAccount(@Request() req: any, @Body() dto: any) {
    return this.settingsService.addWhatsAppAccount(req.user.tenantId, dto);
  }

  @Delete('whatsapp-accounts/:id')
  @ApiOperation({ summary: 'Delete a WhatsApp account' })
  deleteWhatsAppAccount(@Request() req: any, @Param('id') id: string) {
    return this.settingsService.deleteWhatsAppAccount(req.user.tenantId, id);
  }
}
