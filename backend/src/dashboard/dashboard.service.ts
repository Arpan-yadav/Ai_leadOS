import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    this.logger.log('[DashboardService] Calculating dashboard stats...');

    try {
      // 1. Calculate Date for "This Week"
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // 2. Fetch parallel data using Prisma Transactions for speed
      const [
        totalLeads,
        newLeadsThisWeek,
        totalDeals,
        pipelineAggregate,
        leadsGrouped,
        dealsGrouped,
      ] = await this.prisma.$transaction([
        this.prisma.lead.count(),
        this.prisma.lead.count({
          where: { createdAt: { gte: oneWeekAgo } },
        }),
        this.prisma.deal.count(),
        // Assuming your Deal model has an 'amount' or 'value' field
        this.prisma.deal.aggregate({
          _sum: { amount: true }, 
        }),
        this.prisma.lead.groupBy({
          by: ['status'],
          _count: { status: true },
        }),
        this.prisma.deal.groupBy({
          by: ['stage'],
          _count: { stage: true },
        }),
      ]);

      // 3. Format leadsByStatus shape: { NEW: 30, CONTACTED: 20... }
      const leadsByStatus: Record<string, number> = {};
      leadsGrouped.forEach((item) => {
        if (item.status) {
          leadsByStatus[item.status] = item._count.status;
        }
      });

      // 4. Format dealsByStage shape: { DISCOVERY: 5, WON: 6... }
      const dealsByStage: Record<string, number> = {};
      dealsGrouped.forEach((item) => {
        if (item.stage) {
          dealsByStage[item.stage] = item._count.stage;
        }
      });

      // 5. Calculate Conversion Rate (Converted Leads / Total Leads)
      const convertedLeads = leadsByStatus['CONVERTED'] || 0;
      let conversionRate = 0;
      if (totalLeads > 0) {
        conversionRate = parseFloat(((convertedLeads / totalLeads) * 100).toFixed(1));
      }

      // 6. Return exact required JSON shape
      return {
        totalLeads,
        newLeadsThisWeek,
        totalDeals,
        pipelineValue: pipelineAggregate._sum.amount || 0,
        conversionRate,
        leadsByStatus,
        dealsByStage,
      };
    } catch (error) {
      this.logger.error('[DashboardService] Error fetching stats', error);
      throw error;
    }
  }
}