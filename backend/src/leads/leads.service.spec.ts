import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { AiService } from '../ai/ai.service';

describe('LeadsService - by Leads Team', () => {
  let service: LeadsService;
  let mockPrisma: any;
  let mockAi: any;

  beforeEach(async () => {
    mockPrisma = {
      lead: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      }
    };
    mockAi = {
      scoreLead: jest.fn().mockResolvedValue({ score: 85, reason: 'Good', priority: 'high', icpFit: 90 })
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventsGateway, useValue: { server: { emit: jest.fn() } } },
        { provide: AiService, useValue: mockAi },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch leads isolated by tenantId', async () => {
    const mockLeads = [{ id: '1', tenantId: 't1' }, { id: '2', tenantId: 't1' }];
    mockPrisma.lead.findMany.mockResolvedValue(mockLeads);

    const result = await service.findAll('t1', false);
    expect(mockPrisma.lead.findMany).toHaveBeenCalledWith({
      where: { tenantId: 't1' },
      include: { latestActivity: true }
    });
    expect(result).toEqual(mockLeads);
  });

  it('should fetch all leads for super admin', async () => {
    await service.findAll('t1', true);
    expect(mockPrisma.lead.findMany).toHaveBeenCalledWith({
      where: {},
      include: { latestActivity: true }
    });
  });

  it('should prevent deleting another tenants lead', async () => {
    mockPrisma.lead.findUnique.mockResolvedValue({ id: '1', tenantId: 't2' });
    
    await expect(service.remove('1', 't1', false)).rejects.toThrow('Lead not found or unauthorized');
  });
});
