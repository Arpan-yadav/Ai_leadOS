import { Module } from '@nestjs/common';
import { AutoScoreListener } from './auto-score.listener';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AiModule],
  providers: [AutoScoreListener],
  exports: [AutoScoreListener],
})
export class AutomationModule {}

