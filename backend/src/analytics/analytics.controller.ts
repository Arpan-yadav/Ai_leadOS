import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
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
  getExplorerData() {
    return this.analyticsService.getExplorerData();
  }

  @Get('funnel')
  @ApiOperation({ summary: 'Lead conversion funnel by status' })
  getConversionFunnel() {
    return this.analyticsService.getConversionFunnel();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Revenue pipeline value by deal stage' })
  getRevenuePipeline() {
    return this.analyticsService.getRevenuePipeline();
  }

  @Get('velocity')
  @ApiOperation({ summary: 'Lead velocity — avg days from NEW to CONVERTED' })
  getLeadVelocity() {
    return this.analyticsService.getLeadVelocity();
  }

  @Get('team')
  @ApiOperation({ summary: 'Team performance leaderboard' })
  getTeamPerformance() {
    return this.analyticsService.getTeamPerformance();
  }

  @Get('anomalies')
  @ApiOperation({ summary: 'Anomaly detection — stale leads and high-value leads at risk' })
  @ApiQuery({ name: 'days', required: false, description: 'Inactivity threshold in days (default: 14)' })
  getAnomalies(@Query('days') days?: string) {
    return this.analyticsService.getAnomalies(days ? parseInt(days) : 14);
  }

  @Post('ai-summary')
  @ApiOperation({ summary: 'Generate AI weekly performance summary' })
  getAiWeeklySummary() {
    return this.analyticsService.getAiWeeklySummary();
  }

  @Get('predictions')
  @ApiOperation({ summary: 'Predictive deal close probability for open deals' })
  getPredictiveProbabilities() {
    return this.analyticsService.getPredictiveProbabilities();
  }
}
