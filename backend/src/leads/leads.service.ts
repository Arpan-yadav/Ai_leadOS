/**
 * @file leads.service.ts
 * @description Leads Service — Sprint 2, Backend + AI Team
 *
 * Key Sprint 2 AI feature: auto-scores every lead on creation via AiService,
 * persists the score to Lead.score, creates an AIInsight record, and fires
 * a 'lead.created' event on the EventBusService.
 */

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { EventBusService } from '../events/event-bus.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadQueryDto } from './dto/lead-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly eventBus: EventBusService,
  ) {}

  // ─── Create Lead + AI Auto-Score ──────────────────────────────────────────

  async create(dto: CreateLeadDto, userId: string) {
    // 1. Persist the lead first
    const lead = await this.prisma.lead.create({
      data: {
        name: dto.name,
        email: dto.email,
        company: dto.company,
        title: dto.title,
        phone: dto.phone,
        website: dto.website,
        linkedin: dto.linkedin,
        source: dto.source ?? 'WEBSITE',
        status: dto.status ?? 'NEW',
        assignedToId: userId,
      },
    });

    this.logger.log(`[LeadsService] Lead created: ${lead.id} (${lead.name} @ ${lead.company})`);

    // 2. AI Auto-Score (async — does not block the response)
    this.scoreLeadAsync(lead.id, {
      name: lead.name,
      company: lead.company,
      title: lead.title ?? undefined,
      source: lead.source,
      interactions: 0,
    });

    return lead;
  }

  /** Scores a lead asynchronously, updates DB, creates AIInsight, fires event. */
  private async scoreLeadAsync(
    leadId: string,
    input: { name: string; company: string; title?: string; source: string; interactions: number },
  ): Promise<void> {
    try {
      const aiResult = await this.aiService.scoreLead({
        name: input.name,
        company: input.company,
        title: input.title,
        source: input.source,
        interactions: input.interactions,
      });

      // 3. Update Lead.score with the AI result
      await this.prisma.lead.update({
        where: { id: leadId },
        data: { score: aiResult.score },
      });

      // 4. Persist AIInsight record for this lead
      await this.prisma.aIInsight.create({
        data: {
          leadId,
          analysis: aiResult.reason,
          opportunities: [],
          sentiment: aiResult.score >= 75 ? 'positive' : aiResult.score >= 50 ? 'neutral' : 'negative',
          qualityScore: aiResult.icpFit,
          qualityReason: `ICP Fit: ${aiResult.icpFit}/100 — Priority: ${aiResult.priority}`,
          nextAction: aiResult.priority === 'high'
            ? 'Reach out within 24 hours'
            : aiResult.priority === 'medium'
            ? 'Add to nurture sequence'
            : 'Add to cold outreach list',
          model: 'gemini-1.5-flash',
          promptKey: 'lead_scorer',
          rawResponse: aiResult as any,
        },
      });

      // 5. Fire lead.created event on the event bus
      this.eventBus.emit('lead.created', {
        leadId,
        leadName: input.name,
        company: input.company,
        source: input.source,
        score: aiResult.score,
        priority: aiResult.priority,
        timestamp: new Date(),
      });

      // 6. Fire lead.scored event for hot-lead alert listener
      this.eventBus.emit('lead.scored', {
        leadId,
        score: aiResult.score,
        previousScore: 0,
        reason: aiResult.reason,
        timestamp: new Date(),
      });

      this.logger.log(`[LeadsService] Lead ${leadId} scored: ${aiResult.score} (${aiResult.priority})`);
    } catch (err) {
      this.logger.error(`[LeadsService] AI scoring failed for lead ${leadId}:`, err);
    }
  }

  // ─── Read ─────────────────────────────────────────────────────────────────

  async findAll(query: LeadQueryDto) {
    const { page = 1, limit = 20, search, status, source } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
      ...(source && { source }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          aiInsights: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        aiInsights: { orderBy: { createdAt: 'desc' }, take: 3 },
        deals: true,
        tasks: true,
        activities: { orderBy: { timestamp: 'desc' }, take: 20 },
      },
    });
    if (!lead) throw new NotFoundException(`Lead #${id} not found`);
    return lead;
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateLeadDto, userId?: string) {
    const existing = await this.findOne(id); // throws if not found
    const updated = await this.prisma.lead.update({ where: { id }, data: dto });

    // Sprint 3 (Soumya): Fire lead.status_changed event when status changes
    if (dto.status && dto.status !== existing.status) {
      this.eventBus.emit('lead.status_changed', {
        leadId: id,
        previousStatus: existing.status,
        newStatus: dto.status,
        changedBy: userId ?? 'system',
        timestamp: new Date(),
      });
    }

    return updated;
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async remove(id: string) {
    await this.findOne(id); // throws if not found
    return this.prisma.lead.delete({ where: { id } });
  }
}

