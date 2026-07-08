import { Module } from '@nestjs/common';
import { SequencesController } from './sequences.controller';
import { SequencesService } from './sequences.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SequencesController],
  providers: [SequencesService]
})
export class SequencesModule {}
