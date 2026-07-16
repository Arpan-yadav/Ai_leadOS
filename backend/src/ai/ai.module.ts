/**
 * @file ai.module.ts
 * @description NestJS AI Module — Sprint 2, AI Team
 *
 * Registers AiService as a globally available provider.
 * Import AiModule into any module that needs AI capabilities.
 */

import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
