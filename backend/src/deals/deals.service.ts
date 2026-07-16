import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { DealStage } from '@prisma/client';

@Injectable()
export class DealsService {
  private readonly logger = new Logger(DealsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDealDto, userId: string) {
    this.logger.log(`[DealsService] Creating deal for Lead ID: ${dto.leadId}`);
    return this.prisma.deal.create({
      data: {
        title: dto.name,
        amount: dto.amount,
        stage: dto.stage ?? 'DISCOVERY',
        leadId: dto.leadId,
        ownerId: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.deal.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        lead: { select: { id: true, name: true, company: true } },
      },
    });
  }

  async findOne(id: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
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

  async update(id: string, dto: UpdateDealDto) {
    await this.findOne(id);
    return this.prisma.deal.update({
      where: { id },
      data: dto,
    });
  }

  async updateStage(id: string, stage: DealStage, userId: string) {
    const existingDeal = await this.findOne(id);

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
            newStage: updatedDeal.stage,
          },
          leadId: updatedDeal.leadId,
          userId,
        },
      });

      this.logger.log(
        `[DealsService] Deal ${updatedDeal.id} moved from ${existingDeal.stage} to ${updatedDeal.stage}`,
      );
    }

    return updatedDeal;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.deal.delete({ where: { id } });
  }
}