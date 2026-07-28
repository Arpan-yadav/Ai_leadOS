import { Test, TestingModule } from '@nestjs/testing';
import { CommunicationsService } from './communications.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { EmailRouterService } from '../email-router/email-router.service';

describe('CommunicationsService - by Comms Team', () => {
  let service: CommunicationsService;
  let mockPrisma: any;
  let mockEmailRouter: any;

  beforeEach(async () => {
    mockPrisma = {
      lead: { findFirst: jest.fn(), create: jest.fn(), findUnique: jest.fn() },
      communicationLog: { create: jest.fn(), findMany: jest.fn() },
      tenantSettings: { findFirst: jest.fn() }
    };
    mockEmailRouter = {
      routeAndSendEmail: jest.fn().mockResolvedValue({ providerUsed: 'RESEND' })
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunicationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiService, useValue: {} },
        { provide: EmailRouterService, useValue: mockEmailRouter },
      ],
    }).compile();

    service = module.get<CommunicationsService>(CommunicationsService);
  });

  it('should delegate EMAIL channel to EmailRouterService', async () => {
    mockPrisma.lead.findUnique.mockResolvedValue({ id: 'l1', tenantId: 't1', company: 'Acme' });
    
    await service.sendMessage('l1', 'test@acme.com', 'EMAIL', 'Hello');
    
    expect(mockEmailRouter.routeAndSendEmail).toHaveBeenCalledWith(
      't1', 'test@acme.com', 'Message from AI LeadOS', 'Hello', 'Acme'
    );
  });
});
