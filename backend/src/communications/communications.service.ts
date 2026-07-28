import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { EmailRouterService } from '../email-router/email-router.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class CommunicationsService implements OnModuleInit {
  private readonly logger = new Logger(CommunicationsService.name);
  private fallbackTransporter: nodemailer.Transporter | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly emailRouter: EmailRouterService,
  ) {}

  async onModuleInit() {
    try {
      // Fallback Ethereal transporter for demo / when no user settings configured
      const testAccount = await nodemailer.createTestAccount();
      this.fallbackTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      this.logger.log('Ethereal fallback email initialized.');
    } catch (e) {
      this.logger.error('Failed to init fallback email transporter', e);
    }

    // Seed initial communication logs — wrapped in try/catch so a missing
    // table (e.g. migration not yet applied on fresh deployment) never crashes startup
    try {
      const count = await this.prisma.communicationLog.count();
      if (count === 0) {
        this.logger.log('Seeding initial communication logs...');
        // Ensure we have a lead to attach to
        let lead = await this.prisma.lead.findFirst();
        if (!lead) {
          lead = await this.prisma.lead.create({
            data: { name: 'James Wilson', email: 'james@techcorp.com', company: 'TechCorp', title: 'CEO' }
          });
        }

        await this.prisma.communicationLog.createMany({
          data: [
            {
              leadId: lead.id,
              channel: 'WHATSAPP',
              direction: 'inbound',
              status: 'read',
              content: 'Sounds great! When can we schedule a call?',
              sentAt: new Date(Date.now() - 1000 * 60 * 2) // 2m ago
            },
            {
              leadId: lead.id,
              channel: 'WHATSAPP',
              direction: 'outbound',
              status: 'delivered',
              content: 'Yes! We have a native HubSpot integration. Want a live demo?',
              sentAt: new Date(Date.now() - 1000 * 60 * 4) // 4m ago
            }
          ]
        });
        this.logger.log('Seeded communication logs.');
      }
    } catch (e) {
      this.logger.error('[CommunicationsService] Failed to seed communication logs — table may not exist yet. This is safe to ignore on first deploy before migrations run.', e);
    }
  }


  async getAllLogs(tenantId?: string, isSuperAdmin?: boolean) {
    return this.prisma.communicationLog.findMany({
      where: {
        ...( (!isSuperAdmin && tenantId) && { lead: { tenantId } } )
      },
      orderBy: { sentAt: 'desc' },
      include: { lead: true }
    });
  }

  async getLogsForLead(leadId: string) {
    return this.prisma.communicationLog.findMany({
      where: { leadId },
      orderBy: { sentAt: 'asc' }
    });
  }

  async sendMessage(leadId: string | undefined, recipient: string | undefined, channel: string, content: string, subject?: string, accountId?: string) {
    let finalLeadId = leadId;
    let recipientName = recipient || 'Unknown';
    let leadCompany = 'Unknown';
    if (!finalLeadId) {
      if (!recipient) {
        throw new Error('Either leadId or recipient must be provided');
      }
      let lead = await this.prisma.lead.findFirst({
        where: { OR: [{ name: { contains: recipient, mode: 'insensitive' } }, { email: recipient }] }
      });
      if (!lead) {
        lead = await this.prisma.lead.create({
          data: { name: recipient, email: recipient.includes('@') ? recipient : `${recipient.toLowerCase().replace(/\s+/g, '.')}@example.com`, company: 'Unknown', title: 'Prospect' }
        });
      }
      finalLeadId = lead.id;
      recipientName = lead.name;
      leadCompany = lead.company;
    } else {
      const lead = await this.prisma.lead.findUnique({ where: { id: finalLeadId } });
      if (lead) {
        recipientName = lead.name;
        leadCompany = lead.company;
      }
    }
    
    this.logger.log(`Sending ${channel} to lead ${finalLeadId} (${recipient})`);
    
    // ─── Email Sending ────────────────────────────────────────────────────────
    let previewUrl: string | false | null = null;
    let providerUsed = 'unknown';

    if (channel === 'EMAIL') {
      try {
        const lead = await this.prisma.lead.findUnique({ where: { id: finalLeadId }, select: { tenantId: true } });
        if (lead && lead.tenantId) {
          const result = await this.emailRouter.routeAndSendEmail(lead.tenantId, recipient || 'unknown', subject || 'Message from AI LeadOS', content, leadCompany, accountId);
          providerUsed = result.providerUsed;
          this.logger.log(`📧 Email sent via ${result.providerUsed} to ${recipient}`);
        } else {
          // 3. Fallback to Ethereal (demo) if no tenant
          if (this.fallbackTransporter) {
            const info = await this.fallbackTransporter.sendMail({
              from: '"AI LeadOS" <system@aileados.com>',
              to: recipient,
              subject: subject || 'New Message from AI LeadOS',
              text: content,
              html: `<p>${content.replace(/\n/g, '<br/>')}</p>`
            });
            previewUrl = nodemailer.getTestMessageUrl(info);
            providerUsed = 'ETHEREAL';
            this.logger.log(`📧 Email sent via Ethereal (demo). Preview: ${previewUrl}`);
          }
        }
      } catch (err: any) {
        this.logger.error('Email sending failed', err);
        throw new Error(`Email sending failed: ${err.message}`);
      }
    } else if (channel === 'WHATSAPP') {
      // ─── WhatsApp via Meta Cloud API (Pool) ────────────────────────────────────────
      try {
        const lead = finalLeadId ? await this.prisma.lead.findUnique({ where: { id: finalLeadId }, select: { tenantId: true } }) : null;
        
        let waAccount: any = null;
        if (lead && lead.tenantId) {
          if (accountId) {
            waAccount = await this.prisma.whatsAppAccount.findUnique({ where: { id: accountId } });
          } else {
            // Pick the first available active WhatsApp account if no specific one is requested
            waAccount = await this.prisma.whatsAppAccount.findFirst({
              where: { tenantId: lead.tenantId, isActive: true },
              orderBy: { createdAt: 'asc' }
            });
          }
        }

        if (waAccount && waAccount.waAccessToken && waAccount.waPhoneNumberId) {
          const url = `https://graph.facebook.com/v19.0/${waAccount.waPhoneNumberId}/messages`;
          const cleanPhone = (recipient || '').replace(/\D/g, '');
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${waAccount.waAccessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: cleanPhone,
              type: 'text',
              text: { body: content }
            }),
          });
          const data = await res.json() as any;
          if (res.ok) {
            this.logger.log(`💬 WhatsApp sent via Meta Cloud API to ${cleanPhone} using account ${waAccount.waPhoneNumberId}`);
            providerUsed = 'META_WHATSAPP';
          } else {
            this.logger.error(`Meta WhatsApp API error: ${JSON.stringify(data)}`);
            throw new Error(data.error?.message || 'Meta API Error');
          }
        } else {
          // Fallback to legacy TenantSettings if no pool account found
          const tenantSettings = finalLeadId
            ? await this.prisma.tenantSettings.findFirst({ where: { tenant: { leads: { some: { id: finalLeadId } } } } })
            : null;

          if (tenantSettings?.waAccessToken && tenantSettings?.waPhoneNumberId) {
            const url = `https://graph.facebook.com/v19.0/${tenantSettings.waPhoneNumberId}/messages`;
            const cleanPhone = (recipient || '').replace(/\D/g, '');
            const res = await fetch(url, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${tenantSettings.waAccessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: cleanPhone,
                type: 'text',
                text: { body: content }
              }),
            });
            const data = await res.json() as any;
            if (res.ok) {
              this.logger.log(`💬 WhatsApp sent via Meta Cloud API to ${cleanPhone} (Legacy Settings)`);
              providerUsed = 'META_WHATSAPP';
            } else {
              this.logger.error(`Meta WhatsApp API error: ${JSON.stringify(data)}`);
              throw new Error(data.error?.message || 'Meta API Error');
            }
          } else {
            this.logger.warn(`No WhatsApp configuration found for lead ${finalLeadId}`);
            // Let it pass (creates log entry anyway as a record)
          }
        }
      } catch (err: any) {
        this.logger.error('WhatsApp sending failed', err);
      }
    } else {
      this.logger.log(`📱 [MOCK SEND] ${channel} message to ${recipient}: ${content.substring(0, 60)}`);
    }

    const log = await this.prisma.communicationLog.create({
      data: {
        leadId: finalLeadId,
        channel,
        direction: 'outbound',
        status: 'sent',
        subject,
        content,
        metadata: {
          simulated: channel !== 'EMAIL',
          previewUrl,
          providerResponse: 'success'
        }
      }
    });

    return { success: true, log, previewUrl };
  }

  async handleEmailWebhook(payload: any) {
    this.logger.log('Received email webhook', payload);
    // process bounce/open/click
    return { received: true };
  }

  async handleWhatsAppWebhook(payload: any) {
    this.logger.log('Received WhatsApp webhook (Meta Cloud API)', payload);
    
    // Extract info from a typical webhook payload (or fallback for our manual testing)
    const sender = payload.From || payload.sender || 'Unknown Sender';
    const messageBody = payload.Body || payload.message || 'Tell me more about your product.';
    const channel = payload.channel || 'WHATSAPP';

    // 1. Find or create lead
    let lead = await this.prisma.lead.findFirst({
      where: { OR: [{ name: { contains: sender, mode: 'insensitive' } }, { email: sender }] }
    });
    if (!lead) {
      lead = await this.prisma.lead.create({
        data: { 
          name: sender, 
          email: sender.includes('@') ? sender : `${sender.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
          company: 'Unknown', 
          title: 'Prospect' 
        }
      });
    }

    // 2. Log inbound message
    await this.prisma.communicationLog.create({
      data: {
        leadId: lead.id,
        channel,
        direction: 'inbound',
        status: 'received',
        content: messageBody
      }
    });

    // 3. Fetch history for context
    const historyLogs = await this.prisma.communicationLog.findMany({
      where: { leadId: lead.id },
      orderBy: { sentAt: 'asc' },
      take: 5
    });
    const historyStrings = historyLogs.map(l => `${l.direction === 'inbound' ? 'Lead' : 'Sales Rep'}: ${l.content}`);

    // 4. Generate autonomous reply
    this.logger.log(`Generating autonomous reply for ${lead.name}...`);
    const aiResponse = await this.aiService.generateAutonomousReply(lead.name, lead.company || 'Unknown', historyStrings);

    // 5. Send automated reply
    await this.sendMessage(lead.id, undefined, channel, aiResponse.reply);

    return { received: true, replied: true, replyContent: aiResponse.reply };
  }

  async generatePersonalizedMessage(leadName: string, company: string, context?: string, leadId?: string, history?: string, tenantId?: string) {
    // Fetch additional context: lead's AI insights and past communications
    let aiInsightSummary = '';
    let conversationHistory = history || '';

    if (leadId) {
      try {
        const [insights, pastMessages] = await Promise.all([
          this.prisma.aIInsight.findFirst({ where: { leadId }, orderBy: { createdAt: 'desc' } }),
          this.prisma.communicationLog.findMany({ where: { leadId }, orderBy: { sentAt: 'desc' }, take: 5 }),
        ]);

        if (insights) {
          aiInsightSummary = `AI Analysis: ${insights.analysis}. Sentiment: ${insights.sentiment}. Next action: ${insights.nextAction || 'follow up'}`;
        }

        if (pastMessages.length > 0) {
          conversationHistory = pastMessages.reverse()
            .map(m => `${m.direction === 'inbound' ? 'Lead' : 'You'}: ${m.content}`)
            .join('\n');
        }
      } catch (e) { /* non-critical, fall through */ }
    }

    return this.aiService.generatePersonalizedMessage(leadName, company, context, aiInsightSummary, conversationHistory, tenantId);
  }

  async suggestOptimalSendTime(leadName: string, company: string) {
    return this.aiService.suggestOptimalSendTime(leadName, company);
  }
}
