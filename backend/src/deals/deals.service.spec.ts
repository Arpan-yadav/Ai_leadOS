import { Test, TestingModule } from '@nestjs/testing';
import { DealsService } from './deals.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { EventBusService } from '../events/event-bus.service';

describe('DealsService - by Saransh (Backend) | Tested by: Soumya (AI/Automation)', () => {
  let service: DealsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      deal: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
      },
      lead: { update: jest.fn() },
      activity: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn().mockResolvedValue({}) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DealsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiService, useValue: { scoreLead: jest.fn().mockResolvedValue({ score: 80 }) } },
        { provide: EventBusService, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<DealsService>(DealsService);
  });

  // TC-DEALS-01: Tenant isolation for deals list (TC #3 in deals section)
  it('TC-DEALS-01: should fetch deals isolated by tenant', async () => {
    mockPrisma.deal.findMany.mockResolvedValue([]);
    await service.findAll('t1', false);
    expect(mockPrisma.deal.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { tenantId: 't1' },
      include: { lead: { select: { id: true, name: true, company: true } } },
      orderBy: { createdAt: 'desc' },
    }));
  });

  // TC-DEALS-02: Link Deal to Lead — creates deal with correct leadId FK (TC #15)
  it('TC-DEALS-02: linking a Deal to a Lead should persist with correct leadId FK', async () => {
    const mockDeal = { id: 'deal1', title: 'Big Deal', amount: 50000, leadId: 'l1', tenantId: 't1', stage: 'DISCOVERY' };
    mockPrisma.deal.create.mockResolvedValue(mockDeal);

    const result = await service.create({ name: 'Big Deal', amount: 50000, leadId: 'l1', stage: 'DISCOVERY' } as any, 'user1', 't1');
    expect(result).toMatchObject({ leadId: 'l1', tenantId: 't1', stage: 'DISCOVERY' });
    expect(mockPrisma.deal.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ leadId: 'l1' })
    }));
  });

  // TC-DEALS-03: Stage update to WON marks lead as CONVERTED and creates activity (TC #1 AI module)
  it('TC-DEALS-03: should update deal stage to WON and mark lead as CONVERTED with pipeline activity', async () => {
    const dealData = { id: 'd1', stage: 'PROPOSAL', leadId: 'l1', tenantId: 't1', lead: { id: 'l1', name: 'John', company: 'Acme', email: 'j@acme.com', industry: 'Tech', status: 'ACTIVE', aiScore: 70 } };
    mockPrisma.deal.findUnique.mockResolvedValue(dealData);
    mockPrisma.deal.update.mockResolvedValue({ ...dealData, stage: 'WON', leadId: 'l1' });

    await service.updateStage('d1', 'WON', 'user1', 't1');

    expect(mockPrisma.lead.update).toHaveBeenCalledWith({ where: { id: 'l1' }, data: { status: 'CONVERTED' } });
    expect(mockPrisma.activity.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ type: 'pipeline', content: expect.stringContaining('WON') })
    }));
  });

  // TC-DEALS-04: Pipeline aggregation correctly sums WON deals (covered by analytics)
  it('TC-DEALS-04: deal with WON stage should have closedAt timestamp set', async () => {
    const dealData = { id: 'd1', stage: 'NEGOTIATION', leadId: 'l1', tenantId: 't1', lead: { id: 'l1', name: 'John', company: 'Acme', email: 'j@acme.com', industry: 'Tech', status: 'ACTIVE', aiScore: 70 } };
    mockPrisma.deal.findUnique.mockResolvedValue(dealData);
    const closedAt = new Date();
    mockPrisma.deal.update.mockResolvedValue({ ...dealData, stage: 'WON', closedAt, leadId: 'l1' });

    await service.updateStage('d1', 'WON', 'user1', 't1');
    expect(mockPrisma.deal.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ closedAt: expect.any(Date) })
    }));
  });

  // TC-DEALS-05: Service instantiation
  it('TC-DEALS-05: service should be defined', () => {
    expect(service).toBeDefined();
  });
});
