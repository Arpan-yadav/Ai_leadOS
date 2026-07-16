import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAiSettingsDto, UpdateWhatsAppSettingsDto, UpdateEmailSettingsDto } from './dto/settings.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Get settings (keys masked) ───────────────────────────────────────────
  async getSettings(userId: string) {
    const s = await this.prisma.userSettings.findUnique({ where: { userId } });
    if (!s) {
      // Auto-create empty settings on first access
      await this.prisma.userSettings.create({ data: { userId } });
      return this.buildMasked({} as any);
    }
    return this.buildMasked(s);
  }

  private buildMasked(s: any) {
    return {
      hasGeminiKey: !!s.geminiApiKey,
      geminiKeyLast4: s.geminiApiKey ? `...${s.geminiApiKey.slice(-4)}` : null,
      whatsapp: {
        status: s.waConnectionStatus || 'DISCONNECTED',
        hasPhoneNumberId: !!s.waPhoneNumberId,
        hasAccessToken: !!s.waAccessToken,
        phoneNumberId: s.waPhoneNumberId || null,
        businessAccountId: s.waBusinessAccountId || null,
      },
      email: {
        provider: s.emailProvider || 'SMTP',
        hasResendKey: !!s.resendApiKey,
        resendKeyLast4: s.resendApiKey ? `...${s.resendApiKey.slice(-4)}` : null,
        smtpHost: s.smtpHost || null,
        smtpPort: s.smtpPort || null,
        smtpUser: s.smtpUser || null,
        hasSmtpPass: !!s.smtpPass,
        hasGmailOAuth: !!(s.gmailClientId && s.gmailRefreshToken),
      },
    };
  }

  // ─── AI Settings ──────────────────────────────────────────────────────────
  async updateAiSettings(userId: string, dto: UpdateAiSettingsDto) {
    await this.upsert(userId, { geminiApiKey: dto.geminiApiKey });
    this.logger.log(`[Settings] Gemini API key updated for user ${userId}`);
    return { success: true, message: 'Gemini API key saved.' };
  }

  // ─── WhatsApp Settings ────────────────────────────────────────────────────
  async updateWhatsAppSettings(userId: string, dto: UpdateWhatsAppSettingsDto) {
    await this.upsert(userId, {
      waPhoneNumberId: dto.waPhoneNumberId,
      waAccessToken: dto.waAccessToken,
      waBusinessAccountId: dto.waBusinessAccountId,
    });
    this.logger.log(`[Settings] WhatsApp credentials updated for user ${userId}`);
    return { success: true, message: 'WhatsApp credentials saved.' };
  }

  async testWhatsApp(userId: string, testPhone: string) {
    const s = await this.prisma.userSettings.findUnique({ where: { userId } });
    if (!s?.waPhoneNumberId || !s?.waAccessToken) {
      return { success: false, message: 'WhatsApp credentials not configured. Please save them first.' };
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${s.waPhoneNumberId}/messages`;
      const body = {
        messaging_product: 'whatsapp',
        to: testPhone.replace(/\D/g, ''), // strip non-digits
        type: 'text',
        text: { body: '✅ AI LeadOS WhatsApp connection test successful! Your WhatsApp integration is working.' }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${s.waAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json() as any;
      if (res.ok && data.messages) {
        await this.upsert(userId, { waConnectionStatus: 'CONNECTED' });
        this.logger.log(`[Settings] WhatsApp test succeeded for user ${userId}`);
        return { success: true, message: 'Test message sent! Check your WhatsApp.' };
      } else {
        this.logger.error(`[Settings] WhatsApp test failed: ${JSON.stringify(data)}`);
        return { success: false, message: data.error?.message || 'WhatsApp API returned an error. Check your credentials.' };
      }
    } catch (err) {
      this.logger.error('[Settings] WhatsApp test error:', err);
      return { success: false, message: 'Network error contacting Meta API.' };
    }
  }

  // ─── Email Settings ───────────────────────────────────────────────────────
  async updateEmailSettings(userId: string, dto: UpdateEmailSettingsDto) {
    await this.upsert(userId, {
      emailProvider: dto.emailProvider,
      resendApiKey: dto.resendApiKey,
      smtpHost: dto.smtpHost,
      smtpPort: dto.smtpPort,
      smtpUser: dto.smtpUser,
      smtpPass: dto.smtpPass,
      gmailClientId: dto.gmailClientId,
      gmailClientSecret: dto.gmailClientSecret,
      gmailRefreshToken: dto.gmailRefreshToken,
    });
    this.logger.log(`[Settings] Email settings updated for user ${userId}`);
    return { success: true, message: 'Email configuration saved.' };
  }

  async testEmail(userId: string, testEmail: string) {
    const s = await this.prisma.userSettings.findUnique({ where: { userId } });
    const provider = s?.emailProvider || 'SMTP';

    try {
      if (provider === 'RESEND' && s?.resendApiKey) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${s.resendApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'AI LeadOS <onboarding@resend.dev>',
            to: [testEmail],
            subject: '✅ AI LeadOS Email Test',
            text: 'Your email integration is working correctly via Resend!'
          })
        });
        const data = await res.json() as any;
        if (res.ok) return { success: true, message: 'Test email sent via Resend! Check your inbox.' };
        return { success: false, message: data.message || 'Resend API error.' };
      }

      if (provider === 'SMTP' && s?.smtpHost && s?.smtpUser && s?.smtpPass) {
        const transporter = nodemailer.createTransport({
          host: s.smtpHost,
          port: s.smtpPort || 587,
          secure: (s.smtpPort || 587) === 465,
          auth: { user: s.smtpUser, pass: s.smtpPass },
        });
        await transporter.sendMail({
          from: `"AI LeadOS" <${s.smtpUser}>`,
          to: testEmail,
          subject: '✅ AI LeadOS Email Test',
          text: 'Your SMTP email integration is working correctly!',
        });
        return { success: true, message: 'Test email sent via SMTP! Check your inbox.' };
      }

      return { success: false, message: 'Email provider not fully configured. Please fill in all required fields first.' };
    } catch (err: any) {
      this.logger.error('[Settings] Email test error:', err);
      return { success: false, message: err.message || 'Failed to send test email.' };
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  async getRawSettings(userId: string) {
    return this.prisma.userSettings.findUnique({ where: { userId } });
  }

  private async upsert(userId: string, data: any) {
    // Remove undefined keys so we don't accidentally null out existing values
    const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
    return this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...clean },
      update: clean,
    });
  }
}
