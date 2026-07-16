import { Test } from '@nestjs/testing';
import { DashboardService } from './src/dashboard/dashboard.service';
import { PrismaService } from './src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

async function test() {
  const moduleRef = await Test.createTestingModule({
    providers: [DashboardService, PrismaService, ConfigService],
  }).compile();

  const service = moduleRef.get<DashboardService>(DashboardService);
  try {
    const start = Date.now();
    await service.getStats();
    const end = Date.now();
    console.log(`Execution time: ${end - start} ms`);
  } catch(e) {
    console.error(e);
  }
}

test();
