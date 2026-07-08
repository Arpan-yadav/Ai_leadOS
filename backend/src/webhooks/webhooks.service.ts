import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventBusService } from '../events/event-bus.service';
import { EventCategory } from '@prisma/client';

export interface IncomingLeadPayload {
  source: string;
  name: string;
  email: string;
  company?: string;
  metadata?: any;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventBusService,
  ) {}

  async processIncomingLead(payload: IncomingLeadPayload) {
    this.logger.log(`Received incoming lead from ${payload.source}: ${payload.email}`);

    // Map source string to Enum
    const sourceMap: Record<string, any> = {
      'meta': 'META_LEADS',
      'facebook': 'META_LEADS',
      'linkedin': 'LINKEDIN',
      'website': 'WEBSITE',
      'whatsapp': 'WHATSAPP'
    };

    const mappedSource = sourceMap[payload.source.toLowerCase()] || 'WEBSITE';

    // Check if lead already exists
    const existing = await this.prisma.lead.findFirst({
      where: { email: payload.email }
    });

    if (existing) {
      this.logger.log(`Lead ${payload.email} already exists. Skipping creation.`);
      return existing;
    }

    // Create the lead
    const lead = await this.prisma.lead.create({
      data: {
        name: payload.name,
        email: payload.email,
        company: payload.company || 'Unknown',
        source: mappedSource,
        status: 'NEW',
        score: 0, // Will be updated by AI immediately after creation via event
      },
    });

    // Emit event to trigger AI Scoring and Automations
    this.eventsService.emit('lead.created', {
      leadId: lead.id,
      leadName: lead.name,
      company: lead.company,
      source: lead.source,
      score: lead.score,
      priority: 'medium',
      timestamp: new Date()
    });

    return lead;
  }
}
