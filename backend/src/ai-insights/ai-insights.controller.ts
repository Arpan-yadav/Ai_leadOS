import { Controller, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AiInsightsService } from './ai-insights.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('AI')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class AiInsightsController {
  constructor(private readonly aiInsightsService: AiInsightsService) {}

  @Post(':id/analyze')
  @ApiOperation({ summary: 'Analyze a lead using Google Gemini AI' })
  @ApiParam({ name: 'id', description: 'Lead ID (cuid)' })
  @ApiResponse({ status: 201, description: 'AI insight generated successfully.' })
  analyzeLead(@Request() req: any, @Param('id') id: string) {
    return this.aiInsightsService.analyzeLead(id, req.user.tenantId);
  }
}
