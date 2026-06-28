import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

@Injectable()
export class DealsService {
  private readonly logger = new Logger(DealsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDealDto, userId: string) {
    this.logger.log(`[DealsService] Creating deal for Lead ID: ${dto.leadId}`);
    return this.prisma.deal.create({
      data: {
        name: dto.name,
        amount: dto.amount,
        stage: dto.stage ?? 'DISCOVERY',
        leadId: dto.leadId,
        // Agar Deal model mein owner/assignedTo hai, toh userId use kar sakte ho
        // assignedToId: userId, 
      },
    });
  }

  async findAll() {
    return this.prisma.deal.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        lead: { select: { id: true, name: true, company: true } },
      },
    });
  }

  async findOne(id: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: {
        lead: true,
      },
    });
    if (!deal) throw new NotFoundException(`Deal #${id} not found`);
    return deal;
  }

  async update(id: string, dto: UpdateDealDto) {
    await this.findOne(id); 
    return this.prisma.deal.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); 
    return this.prisma.deal.delete({ where: { id } });
  }
}