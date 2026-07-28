import { Test, TestingModule } from '@nestjs/testing';
import { DealsService } from './deals.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { EventBusService } from '../events/event-bus.service';

describe('DealsService - by Soumya', () => {
  let service: DealsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      deal: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      lead: { update: jest.fn() }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DealsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiService, useValue: { scoreLead: jest.fn() } },
        { provide: EventBusService, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<DealsService>(DealsService);
  });

  it('should fetch deals isolated by tenant', async () => {
    mockPrisma.deal.findMany.mockResolvedValue([]);
    await service.findAll('t1', false);
    expect(mockPrisma.deal.findMany).toHaveBeenCalledWith({
      where: { lead: { tenantId: 't1' } },
      include: { lead: true }
    });
  });

  it('should update deal stage and sync AI score', async () => {
    mockPrisma.deal.update.mockResolvedValue({ id: 'd1', stage: 'WON', leadId: 'l1' });
    await service.updateStage('d1', 'WON', 'user1', 't1');
    
    // Changing to WON triggers lead status update
    expect(mockPrisma.lead.update).toHaveBeenCalledWith({
      where: { id: 'l1' },
      data: { status: 'CONVERTED' }
    });
  });
});
