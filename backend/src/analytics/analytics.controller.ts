import { Controller, Get, Post, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('explorer')
  @ApiOperation({ summary: 'Raw datasets for the analytics explorer' })
  getExplorerData(@Request() req: any) {
    return this.analyticsService.getExplorerData(req.user.tenantId, req.user.isSuperAdmin);
  }

  @Get('funnel')
  @ApiOperation({ summary: 'Lead conversion funnel by status' })
  getConversionFunnel(@Request() req: any) {
    return this.analyticsService.getConversionFunnel(req.user.tenantId, req.user.isSuperAdmin);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Revenue pipeline value by deal stage' })
  getRevenuePipeline(@Request() req: any) {
    return this.analyticsService.getRevenuePipeline(req.user.tenantId, req.user.isSuperAdmin);
  }

  @Get('velocity')
  @ApiOperation({ summary: 'Lead velocity — avg days from NEW to CONVERTED' })
  getLeadVelocity(@Request() req: any) {
    return this.analyticsService.getLeadVelocity(req.user.tenantId, req.user.isSuperAdmin);
  }

  @Get('team')
  @ApiOperation({ summary: 'Team performance leaderboard' })
  getTeamPerformance(@Request() req: any) {
    return this.analyticsService.getTeamPerformance(req.user.tenantId, req.user.isSuperAdmin);
  }

  @Get('anomalies')
  @ApiOperation({ summary: 'Anomaly detection — stale leads and high-value leads at risk' })
  @ApiQuery({ name: 'days', required: false, description: 'Inactivity threshold in days (default: 14)' })
  getAnomalies(@Request() req: any, @Query('days') days?: string) {
    return this.analyticsService.getAnomalies(days ? parseInt(days) : 14, req.user.tenantId, req.user.isSuperAdmin);
  }

  @Post('ai-summary')
  @ApiOperation({ summary: 'Generate AI weekly performance summary' })
  getAiWeeklySummary(@Request() req: any) {
    return this.analyticsService.getAiWeeklySummary(req.user.tenantId, req.user.isSuperAdmin);
  }

  @Get('predictions')
  @ApiOperation({ summary: 'Predictive deal close probability for open deals' })
  getPredictiveProbabilities(@Request() req: any) {
    return this.analyticsService.getPredictiveProbabilities(req.user.tenantId, req.user.isSuperAdmin);
  }
}
