import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnalyticsService - by Analytics Team', () => {
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
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should return 0 for revenue if no deals are WON', async () => {
    mockPrisma.deal.aggregate.mockResolvedValue({ _sum: { value: null } });
    
    const revenue = await service.getRevenuePipeline('t1', false);
    const wonData = revenue.find(r => r.stage === 'WON');
    expect(wonData?.value).toBe(0);
  });
});
