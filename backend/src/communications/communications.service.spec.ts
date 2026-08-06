import { Test, TestingModule } from '@nestjs/testing';
import { CommunicationsService } from './communications.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { EmailRouterService } from '../email-router/email-router.service';

describe('CommunicationsService - by Dushyant, Ujjwal (Backend) | Tested by: Arav, Soumya', () => {
  let service: CommunicationsService;
  let mockPrisma: any;
  let mockEmailRouter: any;
  let mockAi: any;

  beforeEach(async () => {
    mockPrisma = {
      communicationLog: {
        create: jest.fn().mockResolvedValue({ id: 'log1' }),
        count: jest.fn().mockResolvedValue(1),
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
        findMany: jest.fn().mockResolvedValue([])
      },
      lead: {
        findUnique: jest.fn().mockResolvedValue({ id: 'l1', tenantId: 't1', name: 'John', email: 'john@test.com', company: 'Acme' }),
        findFirst: jest.fn().mockResolvedValue({ id: 'l1', name: 'Seed Lead', email: 'seed@test.com', company: 'Seed Corp' }),
        create: jest.fn().mockResolvedValue({ id: 'l1' }),
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      whatsAppAccount: { findUnique: jest.fn(), findFirst: jest.fn() },
      tenantSettings: { findFirst: jest.fn() },
    };
    mockEmailRouter = {
      routeAndSendEmail: jest.fn().mockResolvedValue({ success: true, providerUsed: 'RESEND', isFallback: false }),
    };
    mockAi = {
      generateMessage: jest.fn().mockResolvedValue('AI generated message'),
      suggestOptimalSendTime: jest.fn().mockResolvedValue('9:00 AM'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunicationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiService, useValue: mockAi },
        { provide: EmailRouterService, useValue: mockEmailRouter },
      ],
    }).compile();

    service = module.get<CommunicationsService>(CommunicationsService);
    // Bypass nodemailer initialization
    (service as any).fallbackTransporter = null;
  });

  // Signature: sendMessage(leadId, recipient, channel, content, subject?, accountId?)

  // TC-COMMS-01: EMAIL channel delegates to EmailRouterService (TC #24 in report)
  it('TC-COMMS-01: should route EMAIL channel via EmailRouterService (not Ethereal)', async () => {
    // sendMessage(leadId, recipient, channel, content, subject?, accountId?)
    await service.sendMessage('l1', 'john@test.com', 'EMAIL', 'Body content', 'Hello Subject');
    expect(mockEmailRouter.routeAndSendEmail).toHaveBeenCalled();
  });

  // TC-COMMS-02: Manual accountId selection bypasses auto-pick (TC #29)
  it('TC-COMMS-02: specifying accountId uses that specific WhatsApp account (manual override)', async () => {
    const specificAccount = { id: 'acc123', waAccessToken: 'tok', waPhoneNumberId: '268898716316310', isActive: true };
    mockPrisma.whatsAppAccount.findUnique.mockResolvedValue(specificAccount);
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue({ messages: [{ id: 'wamid.001' }] }) }) as any;

    // accountId is the 6th arg
    await service.sendMessage('l1', '+15551234567', 'WHATSAPP', 'Hi!', undefined, 'acc123');

    expect(mockPrisma.whatsAppAccount.findUnique).toHaveBeenCalledWith({ where: { id: 'acc123' } });
    expect(mockPrisma.whatsAppAccount.findFirst).not.toHaveBeenCalled();
  });

  // TC-COMMS-03: WhatsApp uses correct Meta Cloud API URL (TC #27 / Meta webhook)
  it('TC-COMMS-03: WhatsApp uses graph.facebook.com/v19.0/{phoneNumberId}/messages endpoint', async () => {
    const waAccount = { id: 'wa1', waAccessToken: 'token123', waPhoneNumberId: '268898716316310', isActive: true };
    mockPrisma.whatsAppAccount.findFirst.mockResolvedValue(waAccount);

    let capturedUrl = '';
    global.fetch = jest.fn().mockImplementation((url: string) => {
      capturedUrl = url;
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ messages: [{ id: 'wamid.001' }] }) });
    }) as any;

    await service.sendMessage('l1', '+15551234567', 'WHATSAPP', 'Test msg');

    expect(capturedUrl).toBe('https://graph.facebook.com/v19.0/268898716316310/messages');
  });

  // TC-COMMS-04: AI auto-selects first active account when no accountId given (TC #4 AI module)
  it('TC-COMMS-04: AI auto-select uses findFirst with tenantId and isActive when no accountId specified', async () => {
    const waAccount = { id: 'wa1', waAccessToken: 'tok', waPhoneNumberId: '268898716316310', isActive: true };
    mockPrisma.whatsAppAccount.findFirst.mockResolvedValue(waAccount);
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ messages: [{ id: 'wamid.002' }] }) }) as any;

    await service.sendMessage('l1', '+15551234567', 'WHATSAPP', 'Auto select test');

    expect(mockPrisma.whatsAppAccount.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { tenantId: 't1', isActive: true }
    }));
  });

  // TC-COMMS-05: Service instantiation
  it('TC-COMMS-05: service should be defined', () => {
    expect(service).toBeDefined();
  });
});
