import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';

@Injectable()
export class WorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createWorkflowDto: CreateWorkflowDto, userId: string, tenantId?: string) {
    return this.prisma.workflow.create({
      data: {
        ...createWorkflowDto,
        definition: createWorkflowDto.definition as any, // Prisma Json handling
        createdById: userId,
        tenantId,
      },
    });
  }

  async findAll(tenantId?: string, isSuperAdmin?: boolean) {
    return this.prisma.workflow.findMany({
      where: {
        ...( (!isSuperAdmin && tenantId) && { tenantId } )
      },
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

  async findOne(id: string, tenantId?: string, isSuperAdmin?: boolean) {
    const whereClause: any = { id };
    if (!isSuperAdmin && tenantId) {
      whereClause.tenantId = tenantId;
    }

    const workflow = await this.prisma.workflow.findUnique({
      where: whereClause,
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

  async update(id: string, updateWorkflowDto: UpdateWorkflowDto, tenantId?: string, isSuperAdmin?: boolean) {
    const workflow = await this.findOne(id, tenantId, isSuperAdmin); // throws if not found
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

  async remove(id: string, tenantId?: string, isSuperAdmin?: boolean) {
    const workflow = await this.findOne(id, tenantId, isSuperAdmin); // throws if not found
    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }

    return this.prisma.workflow.delete({
      where: { id },
    });
  }
}
