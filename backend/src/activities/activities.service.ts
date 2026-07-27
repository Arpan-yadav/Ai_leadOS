import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityQueryDto } from './dto/activity-query.dto';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateActivityDto, userId: string, tenantId?: string) {
    return this.prisma.activity.create({
      data: {
        type: dto.type,
        content: dto.content,
        metadata: dto.metadata,
        leadId: dto.leadId,
        userId,
        tenantId,
      },
    });
  }

  async findAll(query: ActivityQueryDto, tenantId?: string, isSuperAdmin?: boolean) {
    const where = {
      ...(query.leadId && { leadId: query.leadId }),
      ...( (!isSuperAdmin && tenantId) && { tenantId } )
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

  async findOne(id: string, tenantId?: string, isSuperAdmin?: boolean) {
    const whereClause: any = { id };
    if (!isSuperAdmin && tenantId) {
      whereClause.tenantId = tenantId;
    }

    const activity = await this.prisma.activity.findUnique({
      where: whereClause,
      include: {
        lead: true,
        user: true,
      },
    });

    if (!activity) throw new NotFoundException(`Activity #${id} not found`);
    return activity;
  }

  async update(id: string, dto: UpdateActivityDto, tenantId?: string, isSuperAdmin?: boolean) {
    await this.findOne(id, tenantId, isSuperAdmin);

    return this.prisma.activity.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, tenantId?: string, isSuperAdmin?: boolean) {
    await this.findOne(id, tenantId, isSuperAdmin);
    return this.prisma.activity.delete({ where: { id } });
  }
}