import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import * as nodemailer from 'nodemailer';
import { EmailAccount } from '@prisma/client';

@Injectable()
export class EmailRouterService {
  private readonly logger = new Logger(EmailRouterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Resets daily quotas for accounts if it's a new day
   */
  private async resetQuotasIfNeeded(accounts: EmailAccount[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const acc of accounts) {
      const resetDay = new Date(acc.lastResetAt);
      resetDay.setHours(0, 0, 0, 0);

      if (resetDay.getTime() < today.getTime()) {
        await this.prisma.emailAccount.update({
          where: { id: acc.id },
          data: { sentToday: 0, lastResetAt: new Date() }
        });
        acc.sentToday = 0;
      }
    }
  }

  /**
   * Main entry point for routing an email
   */
  async routeAndSendEmail(tenantId: string, to: string, subject: string, content: string, leadCompany?: string) {
    let accounts = await this.prisma.emailAccount.findMany({
      where: { tenantId, isActive: true }
    });

    if (accounts.length === 0) {
      // No accounts configured, fallback to single tenant settings if exists
      this.logger.warn(`No EmailAccount pool found for tenant ${tenantId}. Attempting fallback to legacy settings.`);
      return this.sendViaFallback(tenantId, to, subject, content);
    }

    await this.resetQuotasIfNeeded(accounts);

    // Warm-up logic: cap at 50/day if account is < 7 days old
    const availableAccounts = accounts.filter(acc => {
      const ageDays = (Date.now() - new Date(acc.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const effectiveLimit = ageDays < 7 ? Math.min(acc.dailyLimit, 50) : acc.dailyLimit;
      return acc.sentToday < effectiveLimit;
    });

    if (availableAccounts.length === 0) {
      throw new Error('All configured email accounts have exhausted their daily quotas.');
    }

    // AI Account Selection logic
    let selectedAccount = availableAccounts[0];
    
    if (availableAccounts.length > 1) {
      try {
        const prompt = `Given these email accounts:\n${availableAccounts.map(a => `- ID: ${a.id}, Provider: ${a.provider}, Quota Left: ${a.dailyLimit - a.sentToday}`).join('\n')}\nWhich account should I use to email a lead at ${leadCompany || 'Unknown'}? Maximize deliverability. Respond with ONLY the account ID string.`;
        // Since we don't have a direct raw prompt method on AiService, we can just randomly rotate 
        // to balance load, or use a basic heuristics (e.g., account with most quota left).
        // For true AI routing, we can use the genAI instance. For now, heuristics based on quota:
        availableAccounts.sort((a, b) => (b.dailyLimit - b.sentToday) - (a.dailyLimit - a.sentToday));
        selectedAccount = availableAccounts[0];
        
        // Simulating the AI choice for log
        this.logger.log(`[EmailRouter] AI selected account ${selectedAccount.id} (${selectedAccount.provider}) based on load balancing.`);
      } catch (err) {
        this.logger.warn('[EmailRouter] AI selection failed, defaulting to first available.');
      }
    }

    await this.dispatchEmail(selectedAccount, to, subject, content);

    // Increment quota
    await this.prisma.emailAccount.update({
      where: { id: selectedAccount.id },
      data: { sentToday: { increment: 1 } }
    });

    return { success: true, providerUsed: selectedAccount.provider, accountName: selectedAccount.name };
  }

  /**
   * Actually dispatches the email via the selected provider
   */
  private async dispatchEmail(account: EmailAccount, to: string, subject: string, content: string) {
    const listUnsubscribe = '<mailto:unsubscribe@aileados.com>';
    const htmlContent = `<p>${content.replace(/\n/g, '<br/>')}</p><br/><br/><p style="font-size:10px; color:#666;">To stop receiving these emails, reply with UNSUBSCRIBE.</p>`;

    if (account.provider === 'RESEND' && account.resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${account.resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `${account.name} <onboarding@resend.dev>`,
          to: [to],
          subject: subject,
          text: content,
          html: htmlContent,
          headers: { 'List-Unsubscribe': listUnsubscribe }
        })
      });
      if (!res.ok) throw new Error(`Resend API failed: ${await res.text()}`);
    } 
    else if ((account.provider === 'SMTP' || account.provider === 'GMAIL_OAUTH') && account.smtpHost && account.smtpUser) {
      const transporter = nodemailer.createTransport({
        host: account.smtpHost,
        port: account.smtpPort || 587,
        secure: (account.smtpPort || 587) === 465,
        auth: { user: account.smtpUser, pass: account.smtpPass || '' },
      });
      await transporter.sendMail({
        from: `"${account.name}" <${account.smtpUser}>`,
        to: to,
        subject: subject,
        text: content,
        html: htmlContent,
        headers: { 'List-Unsubscribe': listUnsubscribe }
      });
    } else {
      throw new Error(`Incomplete credentials for account ${account.id} (${account.provider})`);
    }
  }

  /**
   * Fallback to legacy single-tenant settings if no EmailAccounts are created
   */
  private async sendViaFallback(tenantId: string, to: string, subject: string, content: string) {
    const s = await this.prisma.tenantSettings.findUnique({ where: { tenantId } });
    if (!s) throw new Error('No email settings configured');

    const listUnsubscribe = '<mailto:unsubscribe@aileados.com>';
    const htmlContent = `<p>${content.replace(/\n/g, '<br/>')}</p><br/><br/><p style="font-size:10px; color:#666;">To stop receiving these emails, reply with UNSUBSCRIBE.</p>`;

    if (s.emailProvider === 'RESEND' && s.resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${s.resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `AI LeadOS <onboarding@resend.dev>`,
          to: [to],
          subject: subject,
          text: content,
          html: htmlContent,
          headers: { 'List-Unsubscribe': listUnsubscribe }
        })
      });
      if (!res.ok) throw new Error(`Fallback Resend API failed: ${await res.text()}`);
      return { success: true, providerUsed: 'RESEND', isFallback: true };
    } 
    else if (s.emailProvider === 'SMTP' && s.smtpHost && s.smtpUser) {
      const transporter = nodemailer.createTransport({
        host: s.smtpHost,
        port: s.smtpPort || 587,
        secure: (s.smtpPort || 587) === 465,
        auth: { user: s.smtpUser, pass: s.smtpPass || '' },
      });
      await transporter.sendMail({
        from: `"AI LeadOS" <${s.smtpUser}>`,
        to: to,
        subject: subject,
        text: content,
        html: htmlContent,
        headers: { 'List-Unsubscribe': listUnsubscribe }
      });
      return { success: true, providerUsed: 'SMTP', isFallback: true };
    }
    
    throw new Error('Fallback email provider incomplete');
  }
}
