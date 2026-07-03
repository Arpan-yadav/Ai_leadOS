import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityQueryDto } from './dto/activity-query.dto';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateActivityDto, userId: string) {
    return this.prisma.activity.create({
      data: {
        type: dto.type,
        content: dto.content,
        metadata: dto.metadata,
        leadId: dto.leadId,
        userId,
      },
    });
  }

  async findAll(query: ActivityQueryDto) {
    const where = {
      ...(query.leadId && { leadId: query.leadId }),
    };

    return this.prisma.activity.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      include: {
        lead: { select: { id: true, name: true, company: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findOne(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        lead: true,
        user: true,
      },
    });

    if (!activity) throw new NotFoundException(`Activity #${id} not found`);
    return activity;
  }

  async update(id: string, dto: UpdateActivityDto) {
    await this.findOne(id);

    return this.prisma.activity.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.activity.delete({ where: { id } });
  }
}