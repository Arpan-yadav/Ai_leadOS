import { Test, TestingModule } from '@nestjs/testing';
import { SequencesService } from './sequences.service';
import { PrismaService } from '../prisma/prisma.service';
import { CommunicationsService } from '../communications/communications.service';
import { AiService } from '../ai/ai.service';
import { TasksService } from '../tasks/tasks.service';

describe('SequencesService - by Automation Team', () => {
  let service: SequencesService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      sequenceEnrollment: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      sequence: { findUnique: jest.fn(), findMany: jest.fn() }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SequencesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: TasksService, useValue: { createTask: jest.fn() } },
        { provide: CommunicationsService, useValue: { sendMessage: jest.fn() } },
        { provide: AiService, useValue: {} },
      ],
    }).compile();

    service = module.get<SequencesService>(SequencesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
