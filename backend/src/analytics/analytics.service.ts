import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getExplorerData() {
    this.logger.log('[AnalyticsService] Generating Explorer Data...');

    try {
      // 1. Lead Sources
      const leadsGroupedBySource = await (this.prisma.lead.groupBy as any)({
        by: ['source'],
        _count: { source: true },
      });
      const leadSourcesData = leadsGroupedBySource.map((item: any) => ({
        name: item.source.charAt(0) + item.source.slice(1).toLowerCase(),
        value: item._count.source,
      }));

      // 2. Score vs Value (Leads with Deals)
      const dealsWithLeads = await this.prisma.deal.findMany({
        where: { amount: { gt: 0 } },
        include: { lead: true },
      });
      const scoreVsValueData = dealsWithLeads.map((deal) => ({
        score: deal.lead.score || 0,
        value: deal.amount,
        name: deal.lead.company || deal.lead.name,
        size: Math.max(100, deal.amount / 50), // visual size scaling
      }));

      // 3. Stage Conversion
      const dealsGroupedByStage = await (this.prisma.deal.groupBy as any)({
        by: ['stage'],
        _count: { stage: true },
      });
      const stageConversionData = dealsGroupedByStage.map((item: any) => ({
        name: item.stage.charAt(0) + item.stage.slice(1).toLowerCase(),
        count: item._count.stage,
      }));

      // 4. Revenue by Channel
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
      oneWeekAgo.setHours(0,0,0,0);
      
      const recentDeals = await this.prisma.deal.findMany({
        where: { createdAt: { gte: oneWeekAgo } },
        include: { lead: true },
      });

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const revenueMap = new Map<string, any>();
      for (let i = 0; i < 7; i++) {
        const d = new Date(oneWeekAgo);
        d.setDate(d.getDate() + i);
        revenueMap.set(days[d.getDay()], { name: days[d.getDay()], email: 0, linkedin: 0, whatsapp: 0, website: 0, other: 0 });
      }

      recentDeals.forEach((deal) => {
        const dayStr = days[new Date(deal.createdAt).getDay()];
        const source = deal.lead?.source?.toLowerCase() || 'other';
        if (revenueMap.has(dayStr)) {
          const entry = revenueMap.get(dayStr);
          if (entry[source] !== undefined) {
            entry[source] += deal.amount;
          } else {
            entry['other'] += deal.amount;
          }
        }
      });
      const revenueByChannelData = Array.from(revenueMap.values());

      // 5. Activity Metrics
      const tasksGroupedByStatus = await (this.prisma.task.groupBy as any)({
        by: ['status'],
        _count: { status: true },
      });
      const pending = tasksGroupedByStatus.find((t: any) => t.status === 'pending')?._count?.status || 0;
      const completed = tasksGroupedByStatus.find((t: any) => t.status === 'completed')?._count?.status || 0;

      const activityMetricsData = [
        { subject: 'Pending Tasks', A: pending, B: 0, fullMark: Math.max(pending + 10, 100) },
        { subject: 'Completed Tasks', A: completed, B: 0, fullMark: Math.max(completed + 10, 100) },
        { subject: 'Deals Closed', A: dealsGroupedByStage.find((s:any) => s.stage === 'WON')?._count?.stage || 0, B: 0, fullMark: 100 },
        { subject: 'New Leads', A: leadSourcesData.reduce((acc, curr) => acc + curr.value, 0), B: 0, fullMark: 100 },
      ];

      return {
        'Lead Sources': {
          data: leadSourcesData,
          config: { key: 'value' }
        },
        'Score vs Value': {
          data: scoreVsValueData,
          config: { x: 'score', y: 'value', z: 'size', label: 'name' }
        },
        'Stage Conversion': {
          data: stageConversionData,
          config: { key: 'count' }
        },
        'Revenue by Channel': {
          data: revenueByChannelData,
          config: { keys: ['email', 'linkedin', 'whatsapp', 'website', 'other'] }
        },
        'Activity Metrics': {
          data: activityMetricsData,
          config: { key: 'A' }
        }
      };

    } catch (error) {
      this.logger.error('[AnalyticsService] Error generating explorer data', error);
      throw error;
    }
  }
}
