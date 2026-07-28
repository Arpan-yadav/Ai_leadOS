import { Test, TestingModule } from '@nestjs/testing';
import { EmailRouterService } from './email-router.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

describe('EmailRouterService - by Arpan', () => {
  let service: EmailRouterService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      emailAccount: { findMany: jest.fn(), update: jest.fn() },
      tenantSettings: { findUnique: jest.fn() }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailRouterService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiService, useValue: {} },
      ],
    }).compile();

    service = module.get<EmailRouterService>(EmailRouterService);
  });

  it('should fallback to tenant settings if no accounts are found', async () => {
    mockPrisma.emailAccount.findMany.mockResolvedValue([]);
    mockPrisma.tenantSettings.findUnique.mockResolvedValue({ emailProvider: 'RESEND', resendApiKey: 'fake-key' });
    
    // We mock fetch for the resend API call
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue({}) }) as jest.Mock;

    const result = await service.routeAndSendEmail('t1', 'test@test.com', 'Subj', 'Body');
    expect(result.isFallback).toBe(true);
    expect(result.providerUsed).toBe('RESEND');
  });

  it('should throw error if all daily quotas are exhausted', async () => {
    mockPrisma.emailAccount.findMany.mockResolvedValue([
      { id: 'a1', provider: 'RESEND', dailyLimit: 500, sentToday: 500, lastResetAt: new Date(), isActive: true }
    ]);
    
    await expect(service.routeAndSendEmail('t1', 'test@test.com', 'Subj', 'Body'))
      .rejects.toThrow('All configured email accounts have exhausted their daily quotas.');
  });
});
