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
    const res = await service.getStats();
    console.log(JSON.stringify(res, null, 2));
  } catch(e) {
    console.error("ERROR CAUGHT:");
    console.error(e);
  }
}

test();
