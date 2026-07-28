import { Module } from '@nestjs/common';
import { EmailRouterService } from './email-router.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AiModule],
  providers: [EmailRouterService],
  exports: [EmailRouterService],
})
export class EmailRouterModule {}
