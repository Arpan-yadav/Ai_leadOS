import { Module } from '@nestjs/common';
import { AiInsightsController } from './ai-insights.controller';
import { AiInsightsService } from './ai-insights.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [AiInsightsController],
  providers: [AiInsightsService],
  exports: [AiInsightsService]
})
export class AiInsightsModule {}
