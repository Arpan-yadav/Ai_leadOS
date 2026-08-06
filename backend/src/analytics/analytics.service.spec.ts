import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

describe('AnalyticsService - by Ujjwal (Backend) | Tested by: Arpan (AI Team)', () => {
  let service: AnalyticsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      lead: { count: jest.fn() },
      deal: { aggregate: jest.fn(), findMany: jest.fn() },
      task: { count: jest.fn() },
      communicationLog: { count: jest.fn() }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiService, useValue: { scoreLead: jest.fn() } },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  // TC-ANALYTICS-01: Revenue pipeline returns 0 when no WON deals
  it('TC-ANALYTICS-01: should return 0 revenue for WON stage when no WON deals exist', async () => {
    mockPrisma.deal.aggregate.mockResolvedValue({ _sum: { amount: null, value: null }, _count: { id: 0 } });

    // The service maps 'WON' -> 'Won' via charAt(0) + slice(1).toLowerCase()
    const revenue = await service.getRevenuePipeline('t1', false);
    const wonData = revenue.find(r => r.stage === 'Won');
    expect(wonData?.revenue).toBe(0);
  });

  // TC-ANALYTICS-02: Service instantiation
  it('TC-ANALYTICS-02: service should be defined', () => {
    expect(service).toBeDefined();
  });
});
