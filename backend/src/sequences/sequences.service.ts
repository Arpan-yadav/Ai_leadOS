import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSequenceDto } from './dto/create-sequence.dto';
import { UpdateSequenceDto } from './dto/update-sequence.dto';
import { SequenceStatus } from '@prisma/client';

@Injectable()
export class SequencesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSequenceDto, userId: string) {
    return this.prisma.sequence.create({
      data: {
        name: dto.name,
        description: dto.description,
        durationDays: dto.durationDays ?? 7,
        aiEnabled: dto.aiEnabled ?? true,
        steps: dto.steps ?? [],
        enrollment: dto.enrollment ?? {},
        exitRules: dto.exitRules ?? {},
        tags: dto.tags ?? [],
        status: SequenceStatus.ACTIVE,
        createdById: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.sequence.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const sequence = await this.prisma.sequence.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: { lead: true },
        },
      },
    });

    if (!sequence) {
      throw new NotFoundException(`Sequence with ID ${id} not found`);
    }

    return sequence;
  }

  async update(id: string, dto: UpdateSequenceDto) {
    await this.findOne(id);
    return this.prisma.sequence.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sequence.delete({ where: { id } });
  }

  async enrollLead(sequenceId: string, leadId: string) {
    await this.findOne(sequenceId);
    
    // Check if lead exists
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    return this.prisma.sequenceEnrollment.create({
      data: {
        sequenceId,
        leadId,
        status: 'active',
        currentStepNumber: 1,
      },
    });
  }
}
