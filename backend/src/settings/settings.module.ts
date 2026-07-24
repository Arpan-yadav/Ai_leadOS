import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiInsightsModule } from '../ai-insights/ai-insights.module';

@Module({
  imports: [PrismaModule, AiInsightsModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
