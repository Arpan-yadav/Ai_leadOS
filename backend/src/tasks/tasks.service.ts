/**
 * @file tasks.service.ts
 * @description Tasks Service — Sprint 3, Backend (Saransh) + AI (Soumya)
 * Sprint 3 addition: fires task.completed event on the EventBus when a task is marked done.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventBusService } from '../events/event-bus.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';

import { AiService } from '../ai/ai.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly aiService: AiService,
  ) {}

  async create(dto: CreateTaskDto, userId: string) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        priority: dto.priority ?? 'medium',
        status: 'pending',
        leadId: dto.leadId,
        assignedToId: userId,
      },
    });
  }

  async findAll(query: TaskQueryDto) {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          lead: { select: { id: true, name: true, company: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        lead: { select: { id: true, name: true, company: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    if (!task) throw new NotFoundException(`Task #${id} not found`);
    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    await this.findOne(id);

    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async complete(id: string, userId: string) {
    const task = await this.findOne(id);

    const completed = await this.prisma.task.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // Sprint 3 (Soumya): Fire task.completed event for the automation listener
    this.eventBus.emit('task.completed', {
      taskId: id,
      leadId: task.leadId ?? undefined,
      completedBy: userId,
      timestamp: new Date(),
    });

    return completed;
  }

  async undo(id: string) {
    await this.findOne(id);

    return this.prisma.task.update({
      where: { id },
      data: {
        status: 'pending',
        completedAt: null,
      },
    });
  }

  async suggest() {
    const activeDeals = await this.prisma.deal.findMany({
      where: { stage: { in: ['PROPOSAL', 'NEGOTIATION'] } },
      take: 5,
      include: { lead: { select: { company: true, name: true } } },
      orderBy: { updatedAt: 'asc' }
    });

    const newLeads = await this.prisma.lead.findMany({
      where: { status: 'NEW' },
      take: 5,
      orderBy: { createdAt: 'asc' }
    });

    const contextData = { activeDeals, newLeads };
    return this.aiService.suggestTasks(contextData);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.task.delete({ where: { id } });
  }
}