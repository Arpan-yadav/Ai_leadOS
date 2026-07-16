import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  // ─── Explorer (existing) ───────────────────────────────────────────────────
  async getExplorerData() {
    this.logger.log('[Analytics] Generating Explorer Data...');
    try {
      const leadsGroupedBySource = await (this.prisma.lead.groupBy as any)({
        by: ['source'],
        _count: { source: true },
      });
      const leadSourcesData = leadsGroupedBySource.map((item: any) => ({
        name: item.source.charAt(0) + item.source.slice(1).toLowerCase(),
        value: item._count.source,
      }));

      const dealsWithLeads = await this.prisma.deal.findMany({
        where: { amount: { gt: 0 } },
        include: { lead: true },
      });
      const scoreVsValueData = dealsWithLeads.map((deal) => ({
        score: deal.lead.score || 0,
        value: deal.amount,
        name: deal.lead.company || deal.lead.name,
        size: Math.max(100, deal.amount / 50),
      }));

      const dealsGroupedByStage = await (this.prisma.deal.groupBy as any)({
        by: ['stage'],
        _count: { stage: true },
      });
      const stageConversionData = dealsGroupedByStage.map((item: any) => ({
        name: item.stage.charAt(0) + item.stage.slice(1).toLowerCase(),
        count: item._count.stage,
      }));

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
      oneWeekAgo.setHours(0, 0, 0, 0);
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
          if (entry[source] !== undefined) entry[source] += deal.amount;
          else entry['other'] += deal.amount;
        }
      });
      const revenueByChannelData = Array.from(revenueMap.values());

      const tasksGroupedByStatus = await (this.prisma.task.groupBy as any)({
        by: ['status'],
        _count: { status: true },
      });
      const pending = tasksGroupedByStatus.find((t: any) => t.status === 'pending')?._count?.status || 0;
      const completed = tasksGroupedByStatus.find((t: any) => t.status === 'completed')?._count?.status || 0;
      const activityMetricsData = [
        { subject: 'Pending Tasks', A: pending, B: 0, fullMark: Math.max(pending + 10, 100) },
        { subject: 'Completed Tasks', A: completed, B: 0, fullMark: Math.max(completed + 10, 100) },
        { subject: 'Deals Closed', A: dealsGroupedByStage.find((s: any) => s.stage === 'WON')?._count?.stage || 0, B: 0, fullMark: 100 },
        { subject: 'New Leads', A: leadSourcesData.reduce((acc: number, curr: any) => acc + curr.value, 0), B: 0, fullMark: 100 },
      ];

      return {
        'Lead Sources': { data: leadSourcesData, config: { key: 'value' } },
        'Score vs Value': { data: scoreVsValueData, config: { x: 'score', y: 'value', z: 'size', label: 'name' } },
        'Stage Conversion': { data: stageConversionData, config: { key: 'count' } },
        'Revenue by Channel': { data: revenueByChannelData, config: { keys: ['email', 'linkedin', 'whatsapp', 'website', 'other'] } },
        'Activity Metrics': { data: activityMetricsData, config: { key: 'A' } },
      };
    } catch (error) {
      this.logger.error('[Analytics] Error generating explorer data', error);
      throw error;
    }
  }

  // ─── Sprint 7: Conversion Funnel ──────────────────────────────────────────
  async getConversionFunnel() {
    const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CONVERTED', 'UNQUALIFIED'];
    const counts = await Promise.all(
      stages.map(stage =>
        this.prisma.lead.count({ where: { status: stage as any } })
      )
    );
    return stages.map((stage, i) => ({
      stage: stage.charAt(0) + stage.slice(1).toLowerCase(),
      count: counts[i],
      pct: i === 0 ? 100 : counts[0] > 0 ? Math.round((counts[i] / counts[0]) * 100) : 0,
    }));
  }

  // ─── Sprint 7: Revenue Pipeline by Deal Stage ──────────────────────────────
  async getRevenuePipeline() {
    const stages = ['DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'CLOSING', 'WON', 'LOST'];
    const results = await Promise.all(
      stages.map(stage =>
        this.prisma.deal.aggregate({
          where: { stage: stage as any },
          _sum: { amount: true },
          _count: { id: true },
        })
      )
    );
    return stages.map((stage, i) => ({
      stage: stage.charAt(0) + stage.slice(1).toLowerCase(),
      revenue: results[i]._sum.amount || 0,
      deals: results[i]._count.id,
    }));
  }

  // ─── Sprint 7: Lead Velocity (avg days NEW -> CONVERTED) ──────────────────
  async getLeadVelocity() {
    const converted = await this.prisma.lead.findMany({
      where: { status: 'CONVERTED' },
      select: { createdAt: true, updatedAt: true, company: true, name: true },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    if (converted.length === 0) {
      return { avgDays: 0, minDays: 0, maxDays: 0, trend: [], samples: [] };
    }

    const daysArr = converted.map(l => {
      const ms = new Date(l.updatedAt).getTime() - new Date(l.createdAt).getTime();
      return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
    });

    const avgDays = Math.round(daysArr.reduce((a, b) => a + b, 0) / daysArr.length);
    const minDays = Math.min(...daysArr);
    const maxDays = Math.max(...daysArr);

    // Weekly velocity trend (last 8 weeks)
    const trend: { week: string; converted: number; avgDays: number }[] = [];
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - w * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const weekConverted = converted.filter(l =>
        new Date(l.updatedAt) >= weekStart && new Date(l.updatedAt) < weekEnd
      );
      trend.push({
        week: `W${8 - w}`,
        converted: weekConverted.length,
        avgDays: weekConverted.length > 0
          ? Math.round(weekConverted.reduce((sum, l) => {
              return sum + Math.round((new Date(l.updatedAt).getTime() - new Date(l.createdAt).getTime()) / 86400000);
            }, 0) / weekConverted.length)
          : 0,
      });
    }

    const samples = converted.slice(0, 10).map((l, i) => ({
      name: l.name,
      company: l.company,
      days: daysArr[i],
    }));

    return { avgDays, minDays, maxDays, trend, samples };
  }

  // ─── Sprint 7: Team Performance ────────────────────────────────────────────
  async getTeamPerformance() {
    const users = await this.prisma.user.findMany({
      select: { id: true, name: true, role: true },
    });

    const performance = await Promise.all(
      users.map(async (user) => {
        const [leadsOwned, dealsWon, activitiesLogged, tasksCompleted] = await Promise.all([
          this.prisma.lead.count({ where: { assignedToId: user.id } }),
          this.prisma.deal.count({ where: { ownerId: user.id, stage: 'WON' } }),
          this.prisma.activity.count({ where: { userId: user.id } }),
          this.prisma.task.count({ where: { assignedToId: user.id, status: 'completed' } }),
        ]);
        const totalDeals = await this.prisma.deal.count({ where: { ownerId: user.id } });
        const revenue = await this.prisma.deal.aggregate({
          where: { ownerId: user.id, stage: 'WON' },
          _sum: { amount: true },
        });

        const score = leadsOwned * 2 + dealsWon * 15 + activitiesLogged + tasksCompleted * 3;

        return {
          id: user.id,
          name: user.name,
          role: user.role,
          leadsOwned,
          dealsWon,
          totalDeals,
          activitiesLogged,
          tasksCompleted,
          revenue: revenue._sum?.amount ?? 0,
          score,
        };
      })
    );

    return performance.sort((a, b) => b.score - a.score);
  }

  // ─── Sprint 7: Anomaly Detection ───────────────────────────────────────────
  async getAnomalies(inactiveDays = 14) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - inactiveDays);

    const staleLeads = await this.prisma.lead.findMany({
      where: {
        status: { notIn: ['CONVERTED', 'UNQUALIFIED'] as any },
        updatedAt: { lt: cutoff },
      },
      select: { id: true, name: true, company: true, status: true, updatedAt: true, score: true },
      orderBy: { updatedAt: 'asc' },
      take: 20,
    });

    const highValueNoActivity = await this.prisma.lead.findMany({
      where: {
        score: { gte: 70 },
        status: { notIn: ['CONVERTED'] as any },
        activities: { none: { createdAt: { gte: cutoff } } },
      },
      select: { id: true, name: true, company: true, score: true, status: true },
      take: 10,
    });

    return {
      staleLeads: staleLeads.map(l => ({
        ...l,
        daysSinceActivity: Math.round((Date.now() - new Date(l.updatedAt).getTime()) / 86400000),
      })),
      highValueAtRisk: highValueNoActivity,
      summary: {
        staleCount: staleLeads.length,
        highValueAtRisk: highValueNoActivity.length,
        inactiveDays,
      },
    };
  }

  // ─── Sprint 7: AI Weekly Performance Summary ───────────────────────────────
  async getAiWeeklySummary() {
    // Gather real data first
    const [totalLeads, convertedLeads, totalDeals, wonDeals, topTeam] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.count({ where: { status: 'CONVERTED' } }),
      this.prisma.deal.count(),
      this.prisma.deal.count({ where: { stage: 'WON' } }),
      this.getTeamPerformance(),
    ]);

    const wonRevenue = await this.prisma.deal.aggregate({
      where: { stage: 'WON' },
      _sum: { amount: true },
    });

    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';
    const topPerformer = topTeam[0];

    // Use AI to generate a summary from real data
    const summary = await this.ai.generateAnalyticsSummary({
      totalLeads,
      convertedLeads,
      conversionRate: parseFloat(conversionRate),
      totalDeals,
      wonDeals,
      wonRevenue: wonRevenue._sum.amount || 0,
      topPerformer: topPerformer ? { name: topPerformer.name, score: topPerformer.score, dealsWon: topPerformer.dealsWon } : null,
    });

    return {
      ...summary,
      metrics: { totalLeads, convertedLeads, conversionRate, totalDeals, wonDeals, wonRevenue: wonRevenue._sum.amount || 0 },
    };
  }

  // ─── Sprint 7: Predictive Deal Close Probability ───────────────────────────
  async getPredictiveProbabilities() {
    const openDeals = await this.prisma.deal.findMany({
      where: { stage: { notIn: ['WON', 'LOST'] as any } },
      include: { lead: { select: { name: true, company: true, score: true } } },
      orderBy: { amount: 'desc' },
      take: 15,
    });

    // Score-based probability model + stage weight
    const stageWeights: Record<string, number> = {
      DISCOVERY: 0.1, PROPOSAL: 0.3, NEGOTIATION: 0.55, CLOSING: 0.75,
    };

    return openDeals.map(deal => {
      const stageBase = stageWeights[deal.stage] || 0.1;
      const scoreBoost = ((deal.lead.score || 50) / 100) * 0.25;
      const probability = Math.min(0.97, stageBase + scoreBoost);
      return {
        id: deal.id,
        title: deal.title,
        company: deal.lead.company || deal.lead.name,
        amount: deal.amount,
        stage: deal.stage,
        leadScore: deal.lead.score || 0,
        probability: Math.round(probability * 100),
        expectedRevenue: Math.round(deal.amount * probability),
      };
    });
  }
}
