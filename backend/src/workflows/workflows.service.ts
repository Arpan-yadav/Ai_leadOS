import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';

@Injectable()
export class WorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createWorkflowDto: CreateWorkflowDto, userId: string) {
    return this.prisma.workflow.create({
      data: {
        ...createWorkflowDto,
        definition: createWorkflowDto.definition as any, // Prisma Json handling
        createdById: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.workflow.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        executions: {
          orderBy: { startedAt: 'desc' },
          include: { lead: true },
        },
        _count: {
          select: { executions: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        executions: {
          orderBy: { startedAt: 'desc' },
          include: { lead: true },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }
    return workflow;
  }

  async update(id: string, updateWorkflowDto: UpdateWorkflowDto) {
    const workflow = await this.prisma.workflow.findUnique({ where: { id } });
    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }

    return this.prisma.workflow.update({
      where: { id },
      data: {
        ...updateWorkflowDto,
        definition: updateWorkflowDto.definition ? (updateWorkflowDto.definition as any) : undefined,
      },
    });
  }

  async remove(id: string) {
    const workflow = await this.prisma.workflow.findUnique({ where: { id } });
    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }

    return this.prisma.workflow.delete({
      where: { id },
    });
  }
}
