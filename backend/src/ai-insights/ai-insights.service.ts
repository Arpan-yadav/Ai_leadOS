import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class AiInsightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async analyzeLead(leadId: string, userTenantId?: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    const domain = lead.email.split('@')[1] || 'example.com';
    const url = `https://${domain}`;

    const effectiveTenantId = lead.tenantId || userTenantId || null;
    const companyName = lead.company || 'Unknown Company';
    const analysis = await this.aiService.analyzeCompany(companyName, url, effectiveTenantId);

    return this.prisma.aIInsight.create({
      data: {
        leadId,
        analysis: analysis.analysis,
        opportunities: analysis.opportunities,
        nextAction: analysis.nextAction,
        sentiment: analysis.sentiment,
        qualityScore: analysis.score,
        qualityReason: `AI Analysis based on ${url}`,
        websiteAudit: url,
        model: 'gemini-flash-latest',
        rawResponse: analysis as any,
      },
    });
  }
}
