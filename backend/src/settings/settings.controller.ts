import {
  Controller, Get, Patch, Post, Body, Request, UseGuards
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
    return this.settingsService.getSettings(req.user.id);
  }

  @Patch('ai')
  @ApiOperation({ summary: 'Save Gemini API key' })
  updateAi(@Request() req: any, @Body() dto: UpdateAiSettingsDto) {
    return this.settingsService.updateAiSettings(req.user.id, dto);
  }

  @Patch('whatsapp')
  @ApiOperation({ summary: 'Save Meta Cloud API WhatsApp credentials' })
  updateWhatsApp(@Request() req: any, @Body() dto: UpdateWhatsAppSettingsDto) {
    return this.settingsService.updateWhatsAppSettings(req.user.id, dto);
  }

  @Post('whatsapp/test')
  @ApiOperation({ summary: 'Send a test WhatsApp message to verify credentials' })
  testWhatsApp(@Request() req: any, @Body() dto: TestWhatsAppDto) {
    return this.settingsService.testWhatsApp(req.user.id, dto.testPhone);
  }

  @Patch('email')
  @ApiOperation({ summary: 'Save email provider configuration' })
  updateEmail(@Request() req: any, @Body() dto: UpdateEmailSettingsDto) {
    return this.settingsService.updateEmailSettings(req.user.id, dto);
  }

  @Post('email/test')
  @ApiOperation({ summary: 'Send a test email to verify configuration' })
  testEmail(@Request() req: any, @Body() dto: TestEmailDto) {
    return this.settingsService.testEmail(req.user.id, dto.testEmail);
  }
}
