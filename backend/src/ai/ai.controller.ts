import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('AI')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analytics-insight')
  @ApiOperation({ summary: 'Generate analytics insights based on dashboard metrics' })
  generateAnalyticsInsight(@Body() metricsData: any) {
    return this.aiService.generateAnalyticsInsight(metricsData);
  }
}
