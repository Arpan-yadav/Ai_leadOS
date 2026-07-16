/**
 * @file leads.service.ts
 * @description Leads Service — Sprint 2, Backend + AI Team
 *
 * Key Sprint 2 AI feature: auto-scores every lead on creation via AiService,
 * persists the score to Lead.score, creates an AIInsight record, and fires
 * a 'lead.created' event on the EventBusService.
 */

import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { EventBusService } from '../events/event-bus.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadQueryDto } from './dto/lead-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LeadsService implements OnModuleInit {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly eventBus: EventBusService,
  ) {}

  onModuleInit() {
    this.eventBus.on('lead.created', this.handleLeadCreatedEvent.bind(this));
  }

  // ─── Create Lead ──────────────────────────────────────────────────────────

  async create(dto: CreateLeadDto, userId: string) {
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

    // 2. Emit event (event listener will score and auto-pilot)
    this.eventBus.emit('lead.created', {
      leadId: lead.id,
      leadName: lead.name,
      company: lead.company,
      title: lead.title ?? undefined,
      source: lead.source,
      interactions: 0,
      userId: userId,
      score: 0,
      priority: 'medium',
      timestamp: new Date()
    });

    return lead;
  }

  async createBulk(dtos: CreateLeadDto[], userId: string) {
    this.logger.log(`[LeadsService] Bulk creating ${dtos.length} leads...`);
    
    const createdLeads = await Promise.all(
      dtos.map(dto => 
        this.prisma.lead.create({
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
          }
        })
      )
    );

    createdLeads.forEach(lead => {
      this.eventBus.emit('lead.created', {
        leadId: lead.id,
        leadName: lead.name,
        company: lead.company,
        title: lead.title ?? undefined,
        source: lead.source,
        interactions: 0,
        userId: userId,
        score: 0,
        priority: 'medium',
        timestamp: new Date()
      });
    });

    return { success: true, count: createdLeads.length };
  }

  /**
   * Listens for lead creation across the entire system (API, CSV, Webhook).
   * Scores the lead automatically, then hands off to Auto-Pilot.
   */
  async handleLeadCreatedEvent(event: any): Promise<void> {
    const { leadId, leadName, company, title, source, interactions, userId } = event;
    
    try {
      const aiResult = await this.aiService.scoreLead({
        name: leadName,
        company: company,
        title: title,
        source: source,
        interactions: interactions ?? 0,
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

      // 5. Fire lead.scored event for hot-lead alert listener
      this.eventBus.emit('lead.scored', {
        leadId,
        score: aiResult.score,
        previousScore: 0,
        reason: aiResult.reason,
        timestamp: new Date(),
      });

      // 6. Auto-Pilot: Generate Strategy and Enroll
      this.autoPilotLeadAsync(leadId, leadName, company, title, aiResult.score, userId)
        .catch(err => this.logger.error(`[AutoPilot] Failed for lead ${leadId}`, err));

      this.logger.log(`[LeadsService] Lead ${leadId} scored: ${aiResult.score} (${aiResult.priority})`);
    } catch (err) {
      this.logger.error(`[LeadsService] AI scoring failed for lead ${leadId}:`, err);
    }
  }

  /**
   * Auto-Pilot Engine: Dynamically generates a 14-day sequence and enrolls the lead.
   */
  private async autoPilotLeadAsync(
    leadId: string,
    leadName: string,
    company: string,
    title: string | undefined,
    score: number,
    userId?: string
  ): Promise<void> {
    this.logger.log(`[AutoPilot] Generating strategy for lead ${leadId} (Score: ${score})`);
    
    // If no userId provided (e.g. from Webhook), find the first admin user
    let assignedUserId = userId;
    if (!assignedUserId) {
      const admin = await this.prisma.user.findFirst();
      if (admin) assignedUserId = admin.id;
    }

    if (!assignedUserId) {
       this.logger.error(`[AutoPilot] Cannot auto-pilot without a valid user ID.`);
       return;
    }

    // 1. Generate Strategy & Select Master Workflow
    const strategy = await this.aiService.generateDynamicStrategy(leadName, company, title, score);
    const masterWorkflowName = strategy.masterWorkflow || 'Warm Nurture';
    
    // 2. Find or Create Master Workflow
    let workflow = await this.prisma.workflow.findFirst({
      where: { name: masterWorkflowName }
    });

    if (!workflow) {
      workflow = await this.prisma.workflow.create({
        data: {
          name: masterWorkflowName,
          description: `Auto-generated master workflow: ${masterWorkflowName}`,
          status: 'ACTIVE',
          createdById: assignedUserId,
          definition: { nodes: [], edges: [] }
        }
      });
    }

    // 3. Create Custom Sequence
    const sequence = await this.prisma.sequence.create({
      data: {
        name: `[Auto] Strategy for ${leadName}`,
        description: `Auto-generated 14-day outreach for ${leadName} at ${company} (Score: ${score})`,
        createdById: assignedUserId,
        status: 'ACTIVE',
        durationDays: 14,
        steps: strategy.sequences.map((s, index) => ({
          dayOffset: s.day,
          channel: s.channel.toUpperCase(),
          subject: s.subject,
          content: s.message,
          order: index,
        })),
        enrollment: { autoEnroll: false },
        exitRules: { exitOnReply: true }
      }
    });

    this.logger.log(`[AutoPilot] Created sequence ${sequence.id}, enrolling lead in workflow and sequence...`);

    // 4. Enroll Lead in Sequence
    await this.prisma.sequenceEnrollment.create({
      data: {
        sequenceId: sequence.id,
        leadId: leadId,
        status: 'active',
        currentStepNumber: 1,
      }
    });

    // 5. Enroll Lead in Workflow
    await this.prisma.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        leadId: leadId,
        status: 'active',
      }
    });

    this.logger.log(`[AutoPilot] Lead ${leadId} successfully enrolled in Workflow '${masterWorkflowName}' and custom Sequence!`);
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
    
    return this.prisma.$transaction([
      this.prisma.activity.deleteMany({ where: { leadId: id } }),
      this.prisma.communicationLog.deleteMany({ where: { leadId: id } }),
      this.prisma.task.deleteMany({ where: { leadId: id } }),
      this.prisma.deal.deleteMany({ where: { leadId: id } }),
      this.prisma.aIInsight.deleteMany({ where: { leadId: id } }),
      this.prisma.sequenceEnrollment.deleteMany({ where: { leadId: id } }),
      this.prisma.workflowExecution.deleteMany({ where: { leadId: id } }),
      this.prisma.lead.delete({ where: { id } })
    ]);
  }
}

