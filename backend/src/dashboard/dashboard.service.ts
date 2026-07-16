import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    this.logger.log('[DashboardService] Calculating dashboard stats...');

    try {
      // 1. Calculate Dates
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
      oneWeekAgo.setHours(0, 0, 0, 0);

      const twoWeeksAgo = new Date(oneWeekAgo);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 2. Fetch parallel data using Prisma Transactions for speed
      const [
        totalLeads,
        newLeadsThisWeek,
        newLeadsLastWeek,
        totalDeals,
        dealsThisWeek,
        dealsLastWeek,
        pipelineAggregate,
        pipelineLastWeekAggregate,
        leadsGroupedByStatus,
        dealsGroupedByStage,
        leadsGroupedBySource,
        recentLeadsList,
        recentLeadsForChart,
        recentDealsForChart,
        leadsCapturedToday,
        recentInsights
      ] = await Promise.all([
        this.prisma.lead.count(),
        this.prisma.lead.count({ where: { createdAt: { gte: oneWeekAgo } } }),
        this.prisma.lead.count({ where: { createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } } }),
        this.prisma.deal.count(),
        this.prisma.deal.count({ where: { createdAt: { gte: oneWeekAgo } } }),
        this.prisma.deal.count({ where: { createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } } }),
        this.prisma.deal.aggregate({ _sum: { amount: true }, where: { stage: 'WON' } }),
        this.prisma.deal.aggregate({ _sum: { amount: true }, where: { stage: 'WON', closedAt: { lt: oneWeekAgo } } }), 
        (this.prisma.lead.groupBy as any)({ by: ['status'], _count: { status: true } }),
        (this.prisma.deal.groupBy as any)({ by: ['stage'], _count: { stage: true } }),
        (this.prisma.lead.groupBy as any)({ by: ['source'], _count: { source: true } }),
        this.prisma.lead.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { name: true, company: true, source: true, createdAt: true } }),
        this.prisma.lead.findMany({ where: { createdAt: { gte: oneWeekAgo } }, select: { createdAt: true } }),
        this.prisma.deal.findMany({ where: { stage: 'WON', closedAt: { gte: oneWeekAgo } }, select: { closedAt: true, createdAt: true, amount: true } }),
        this.prisma.lead.count({ where: { createdAt: { gte: today } } }),
        this.prisma.aIInsight.findMany({ take: 2, orderBy: { createdAt: 'desc' }, include: { lead: true } })
      ]);

      // 3. Format basic stats
      const leadsByStatus: Record<string, number> = {};
      leadsGroupedByStatus.forEach((item: any) => {
        if (item.status) leadsByStatus[item.status] = item._count.status;
      });

      const dealsByStage: Record<string, number> = {};
      dealsGroupedByStage.forEach((item: any) => {
        if (item.stage) dealsByStage[item.stage] = item._count.stage;
      });

      // Conversion Rate
      const convertedLeads = leadsByStatus['CONVERTED'] || 0;
      let conversionRate = totalLeads > 0 ? parseFloat(((convertedLeads / totalLeads) * 100).toFixed(1)) : 0;

      // Changes
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? '+100%' : '+0%';
        const change = ((current - previous) / previous) * 100;
        return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
      };

      const leadsChange = calculateChange(newLeadsThisWeek, newLeadsLastWeek);
      const dealsChangeStr = calculateChange(dealsThisWeek, dealsLastWeek);
      
      const currentPipeline = pipelineAggregate._sum.amount || 0;
      const lastWeekPipeline = pipelineLastWeekAggregate._sum.amount || 0;
      const pipelineChange = calculateChange(currentPipeline, lastWeekPipeline);
      // Basic conversion change logic based on new leads this week vs converted leads this week
      // For simplicity, we just check total converted vs total leads
      // Since historical is complex, we use a fixed mock or simplified delta
      const convertedThisWeek = await this.prisma.lead.count({ where: { status: 'CONVERTED', createdAt: { gte: oneWeekAgo } } });
      const convertedLastWeek = await this.prisma.lead.count({ where: { status: 'CONVERTED', createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } } });
      const convRateThisWeek = newLeadsThisWeek > 0 ? (convertedThisWeek / newLeadsThisWeek) * 100 : 0;
      const convRateLastWeek = newLeadsLastWeek > 0 ? (convertedLastWeek / newLeadsLastWeek) * 100 : 0;
      const convRateChange = convRateThisWeek - convRateLastWeek;
      const conversionChange = `${convRateChange > 0 ? '+' : ''}${convRateChange.toFixed(1)}%`;

      // 4. Format sourceData (Lead Origin Map)
      const SOURCE_COLORS: Record<string, string> = {
        'WEBSITE': '#f59e0b',
        'LINKEDIN': '#00f0ff',
        'TWITTER': '#10b981',
        'REFERRAL': '#bd00ff',
        'OTHER': '#64748b'
      };
      
      const sourceData = leadsGroupedBySource.map((item: any) => ({
        name: item.source.charAt(0) + item.source.slice(1).toLowerCase(),
        value: totalLeads > 0 ? Math.round((item._count.source / totalLeads) * 100) : 0,
        color: SOURCE_COLORS[item.source] || '#00f0ff'
      })).sort((a: any, b: any) => b.value - a.value);

      // 5. Format chartData
      const chartDataMap = new Map<string, { revenue: number, leads: number }>();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 0; i < 7; i++) {
        const d = new Date(oneWeekAgo);
        d.setDate(d.getDate() + i);
        const dayStr = days[d.getDay()];
        chartDataMap.set(dayStr, { revenue: 0, leads: 0 });
      }
      recentLeadsForChart.forEach((lead: any) => {
        const dayStr = days[new Date(lead.createdAt).getDay()];
        if (chartDataMap.has(dayStr)) chartDataMap.get(dayStr)!.leads += 1;
      });
      recentDealsForChart.forEach((deal: any) => {
        const dateToUse = deal.closedAt ? new Date(deal.closedAt) : new Date(deal.createdAt);
        const dayStr = days[dateToUse.getDay()];
        if (chartDataMap.has(dayStr)) chartDataMap.get(dayStr)!.revenue += deal.amount;
      });
      const chartData = Array.from(chartDataMap.entries()).map(([name, data]) => ({ name, revenue: data.revenue, leads: data.leads }));

      // 6. Format recentLeads
      const recentLeads = recentLeadsList.map((lead: any) => {
        const diff = new Date().getTime() - new Date(lead.createdAt).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        let timeStr = 'Recently';
        if (hours > 24) timeStr = `${Math.floor(hours/24)}d ago`;
        else if (hours > 0) timeStr = `${hours}h ago`;
        return { name: lead.name, company: lead.company, source: lead.source.charAt(0) + lead.source.slice(1).toLowerCase(), time: timeStr };
      });

      // 7. Format Recommendations
      const recommendations = recentInsights.map(insight => {
        return {
          type: insight.qualityScore > 75 ? 'High Intent Detected' : 'Strategy Optimized',
          title: `Analysis: ${insight.lead.company || insight.lead.name}`,
          description: insight.nextAction || insight.analysis.substring(0, 80) + '...'
        };
      });

      return {
        totalLeads,
        leadsChange,
        totalDeals,
        dealsChange: dealsChangeStr,
        pipelineValue: currentPipeline,
        pipelineChange,
        conversionRate,
        conversionChange,
        leadsByStatus,
        dealsByStage,
        sourceData,
        chartData,
        recentLeads,
        leadsCapturedToday,
        recommendations
      };
    } catch (error) {
      this.logger.error('[DashboardService] Error fetching stats', error);
      throw error;
    }
  }
}