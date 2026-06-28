import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregated CRM statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns total leads, pipeline value, conversion rates, and grouped stats.',
    schema: {
      example: {
        totalLeads: 87,
        newLeadsThisWeek: 12,
        totalDeals: 23,
        pipelineValue: 145000,
        conversionRate: 18.5,
        leadsByStatus: {
          NEW: 30,
          CONTACTED: 20,
          QUALIFIED: 25,
          CONVERTED: 12,
        },
        dealsByStage: {
          DISCOVERY: 5,
          PROPOSAL: 8,
          NEGOTIATION: 4,
          WON: 6,
        },
      },
    },
  })
  getStats() {
    return this.dashboardService.getStats();
  }
}