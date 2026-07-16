import { Module } from '@nestjs/common';
import { SequencesController } from './sequences.controller';
import { SequencesService } from './sequences.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';
import { TasksModule } from '../tasks/tasks.module';
import { CommunicationsModule } from '../communications/communications.module';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [PrismaModule, AiModule, TasksModule, CommunicationsModule, ActivitiesModule],
  controllers: [SequencesController],
  providers: [SequencesService]
})
export class SequencesModule {}
