import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { DealStage } from '@prisma/client';

@Injectable()
export class DealsService {
  private readonly logger = new Logger(DealsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService
  ) {}

  async create(dto: CreateDealDto, userId: string, tenantId?: string) {
    this.logger.log(`[DealsService] Creating deal for Lead ID: ${dto.leadId}`);
    return this.prisma.deal.create({
      data: {
        title: dto.name,
        amount: dto.amount,
        stage: dto.stage ?? 'DISCOVERY',
        leadId: dto.leadId,
        ownerId: userId,
        tenantId,
      },
    });
  }

  async findAll(tenantId?: string, isSuperAdmin?: boolean) {
    return this.prisma.deal.findMany({
      where: {
        ...( (!isSuperAdmin && tenantId) && { tenantId } )
      },
      orderBy: { createdAt: 'desc' },
      include: {
        lead: { select: { id: true, name: true, company: true } },
      },
    });
  }

  async findOne(id: string, tenantId?: string, isSuperAdmin?: boolean) {
    const whereClause: any = { id };
    if (!isSuperAdmin && tenantId) {
      whereClause.tenantId = tenantId;
    }

    const deal = await this.prisma.deal.findUnique({
      where: whereClause,
      include: {
        lead: true,
      },
    });
    if (!deal) throw new NotFoundException(`Deal #${id} not found`);

    const activities = await this.prisma.activity.findMany({
      where: { leadId: deal.leadId, type: 'pipeline' },
      orderBy: { timestamp: 'desc' },
    });
    
    const dealActivities = activities.filter(
      (a) => (a.metadata as any)?.dealId === deal.id
    );

    return { ...deal, activities: dealActivities };
  }

  async update(id: string, dto: UpdateDealDto, tenantId?: string, isSuperAdmin?: boolean) {
    await this.findOne(id, tenantId, isSuperAdmin);
    return this.prisma.deal.update({
      where: { id },
      data: dto,
    });
  }

  async updateStage(id: string, stage: DealStage, userId: string, tenantId?: string, isSuperAdmin?: boolean) {
    const existingDeal = await this.findOne(id, tenantId, isSuperAdmin);

    const updatedDeal = await this.prisma.deal.update({
      where: { id },
      data: { 
        stage,
        ...(stage === 'WON' ? { closedAt: new Date() } : { closedAt: null })
      },
      include: {
        lead: true,
      },
    });

    if (stage === 'WON' && updatedDeal.leadId) {
      await this.prisma.lead.update({
        where: { id: updatedDeal.leadId },
        data: { status: 'CONVERTED' }
      });
    }

    if (existingDeal.stage !== updatedDeal.stage) {
      await this.prisma.activity.create({
        data: {
          type: 'pipeline',
          content: `Deal moved from ${existingDeal.stage} to ${updatedDeal.stage}`,
          metadata: {
            dealId: updatedDeal.id,
            dealTitle: updatedDeal.title,
            previousStage: existingDeal.stage,
            oldStage: existingDeal.stage,
            newStage: updatedDeal.stage,
          },
          leadId: updatedDeal.leadId,
          userId,
        },
      });

      // Recalculate AI Score based on new Deal Stage
      if (updatedDeal.leadId) {
        try {
          const aiResult = await this.aiService.scoreLead({
            name: updatedDeal.lead.name,
            company: updatedDeal.lead.company,
            title: updatedDeal.lead.title ?? undefined,
            source: updatedDeal.lead.source,
            interactions: 1, // At least 1 interaction for the deal stage change
            tenantId: tenantId ?? 'system',
          });

          await this.prisma.lead.update({
            where: { id: updatedDeal.leadId },
            data: { score: aiResult.score },
          });

          await this.prisma.aIInsight.create({
            data: {
              leadId: updatedDeal.leadId,
              analysis: `Deal stage changed to ${stage}. ${aiResult.reason}`,
              opportunities: [],
              sentiment: aiResult.score >= 75 ? 'positive' : aiResult.score >= 50 ? 'neutral' : 'negative',
              qualityScore: aiResult.icpFit,
              qualityReason: `ICP Fit: ${aiResult.icpFit}/100 — Priority: ${aiResult.priority}`,
              nextAction: stage === 'WON' ? 'Onboard client' : `Follow up on ${stage} stage`,
              model: 'gemini-1.5-flash',
              promptKey: 'lead_scorer_deal_update',
              rawResponse: aiResult as any,
            },
          });
          
          this.logger.log(`[DealsService] Re-scored lead ${updatedDeal.leadId} to ${aiResult.score} after deal stage changed to ${stage}`);
        } catch (err) {
          this.logger.error(`[DealsService] Failed to re-score lead ${updatedDeal.leadId}:`, err);
        }
      }

      this.logger.log(
        `[DealsService] Deal ${updatedDeal.id} moved from ${existingDeal.stage} to ${updatedDeal.stage}`,
      );
    }

    return updatedDeal;
  }

  async remove(id: string, tenantId?: string, isSuperAdmin?: boolean) {
    await this.findOne(id, tenantId, isSuperAdmin);
    return this.prisma.deal.delete({ where: { id } });
  }
}