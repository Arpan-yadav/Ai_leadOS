import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class CommunicationsService implements OnModuleInit {
  private readonly logger = new Logger(CommunicationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async onModuleInit() {
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
  }

  async getAllLogs() {
    return this.prisma.communicationLog.findMany({
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

  async sendMessage(leadId: string | undefined, recipient: string | undefined, channel: string, content: string, subject?: string) {
    let finalLeadId = leadId;
    let recipientName = recipient || 'Unknown';
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
    }
    
    this.logger.log(`Sending ${channel} to lead ${finalLeadId}`);
    
    // In a real implementation, we would call Nodemailer, Twilio, Resend, etc here.
    // For now, we simulate success and log to DB.

    const log = await this.prisma.communicationLog.create({
      data: {
        leadId: finalLeadId,
        channel,
        direction: 'outbound',
        status: 'sent',
        subject,
        content,
        metadata: {
          simulated: true,
          providerResponse: 'success'
        }
      }
    });

    return { success: true, log };
  }

  async handleEmailWebhook(payload: any) {
    this.logger.log('Received email webhook', payload);
    // process bounce/open/click
    return { received: true };
  }

  async handleTwilioWebhook(payload: any) {
    this.logger.log('Received WhatsApp webhook', payload);
    
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

  async generatePersonalizedMessage(leadName: string, company: string, context?: string) {
    return this.aiService.generatePersonalizedMessage(leadName, company, context);
  }

  async suggestOptimalSendTime(leadName: string, company: string) {
    return this.aiService.suggestOptimalSendTime(leadName, company);
  }
}
