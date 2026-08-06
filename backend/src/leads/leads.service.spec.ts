import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventBusService } from '../events/event-bus.service';
import { AiService } from '../ai/ai.service';

describe('LeadsService - by Saransh, Dushyant (Backend) | Tested by: Arshjot, Soumya', () => {
  let service: LeadsService;
  let mockPrisma: any;
  let mockAi: any;
  let mockEventBus: any;

  beforeEach(async () => {
    mockPrisma = {
      $transaction: jest.fn().mockImplementation(async (args) => {
        return Promise.all(args.map((a: any) => typeof a === 'function' ? a() : a));
      }),
      lead: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      sequenceEnrollment: { findMany: jest.fn().mockResolvedValue([]), deleteMany: jest.fn() },
      communicationLog: { deleteMany: jest.fn() },
      aIInsight: { deleteMany: jest.fn(), create: jest.fn() },
      activity: { deleteMany: jest.fn() },
      task: { deleteMany: jest.fn() },
      deal: { deleteMany: jest.fn() },
      workflowExecution: { deleteMany: jest.fn() },
      sequence: { findUnique: jest.fn() },
      user: { findFirst: jest.fn() },
    };
    mockAi = {
      scoreLead: jest.fn().mockResolvedValue({ score: 85, reason: 'Good', priority: 'high', icpFit: 90 })
    };
    mockEventBus = { emit: jest.fn(), on: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventBusService, useValue: mockEventBus },
        { provide: AiService, useValue: mockAi },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
  });

  // TC-LEADS-01: Service instantiation
  it('TC-LEADS-01: service should be defined', () => {
    expect(service).toBeDefined();
  });

  // TC-LEADS-02: Lead creation emits EventBus event (TC #12 in report)
  it('TC-LEADS-02: should create a lead and fire lead.created event on EventBus', async () => {
    const mockLead = { id: 'l1', name: 'John Doe', email: 'john@acme.com', company: 'Acme', title: 'CEO', source: 'WEBSITE', status: 'NEW', tenantId: 't1' };
    mockPrisma.lead.create.mockResolvedValue(mockLead);

    const result = await service.create({ name: 'John Doe', email: 'john@acme.com', company: 'Acme', source: 'WEBSITE' } as any, 'user1', 't1');

    expect(result).toMatchObject({ id: 'l1', name: 'John Doe' });
    expect(mockEventBus.emit).toHaveBeenCalledWith('lead.created', expect.objectContaining({ leadId: 'l1', leadName: 'John Doe', company: 'Acme' }));
  });

  // TC-LEADS-03: Tenant isolation - leads filtered by tenantId (TC #10)
  it('TC-LEADS-03: should fetch leads isolated by tenantId', async () => {
    const mockLeads = [{ id: '1', tenantId: 't1' }, { id: '2', tenantId: 't1' }];
    mockPrisma.lead.findMany.mockResolvedValue(mockLeads);
    mockPrisma.lead.count.mockResolvedValue(2);

    const result = await service.findAll({} as any, 't1', false);
    expect(mockPrisma.lead.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { tenantId: 't1' } }));
    expect(result.data).toEqual(mockLeads);
    expect(result.total).toEqual(2);
  });

  // TC-LEADS-04: SuperAdmin bypasses tenant filter (TC #11)
  it('TC-LEADS-04: should fetch ALL leads for super admin (no tenantId filter)', async () => {
    mockPrisma.lead.findMany.mockResolvedValue([]);
    mockPrisma.lead.count.mockResolvedValue(0);
    await service.findAll({} as any, 't1', true);
    expect(mockPrisma.lead.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
  });

  // TC-LEADS-05: Cross-tenant delete protection (TC #14)
  it('TC-LEADS-05: should throw when attempting to delete a non-existent lead', async () => {
    mockPrisma.lead.findUnique.mockResolvedValue(null);
    await expect(service.remove('99', 't1', false)).rejects.toThrow();
  });

  // TC-LEADS-06: Pagination skip/take applied correctly for page 2, limit 10 (TC #13)
  it('TC-LEADS-06: pagination should apply correct skip=10, take=10 for page 2 limit 10', async () => {
    mockPrisma.lead.findMany.mockResolvedValue([]);
    mockPrisma.lead.count.mockResolvedValue(25);
    // page and limit are numbers in the DTO
    await service.findAll({ page: 2, limit: 10 } as any, 't1', false);
    expect(mockPrisma.lead.findMany).toHaveBeenCalledWith(expect.objectContaining({
      skip: 10,
      take: 10
    }));
  });
});
