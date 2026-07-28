import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiInsightsService } from '../ai-insights/ai-insights.service';

describe('SettingsService - by Arpan', () => {
  let service: SettingsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      tenantSettings: {
        findUnique: jest.fn(),
        create: jest.fn(),
        upsert: jest.fn(),
      },
      emailAccount: {
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      whatsAppAccount: {
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiInsightsService, useValue: {} },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  it('should list email accounts masking sensitive fields', async () => {
    mockPrisma.emailAccount.findMany.mockResolvedValue([
      { id: '1', resendApiKey: 'full-secret-key', smtpPass: 'my-pass' }
    ]);
    const result = await service.listEmailAccounts('t1');
    expect(result[0].resendApiKey).toBe('...-key');
    expect(result[0].smtpPass).toBe('********');
  });

  it('should list whatsapp accounts masking access tokens', async () => {
    mockPrisma.whatsAppAccount.findMany.mockResolvedValue([
      { id: '1', waAccessToken: 'secret-token-1234' }
    ]);
    const result = await service.listWhatsAppAccounts('t1');
    expect(result[0].waAccessToken).toBe('...1234');
  });
});
