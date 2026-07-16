import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
  const twoWeeksAgo = new Date(oneWeekAgo);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);

  await prisma.$connect();
  const start = Date.now();
  
  await prisma.lead.count();
  await prisma.lead.count({ where: { createdAt: { gte: oneWeekAgo } } });
  await prisma.lead.count({ where: { createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } } });
  await prisma.deal.aggregate({ _sum: { amount: true }, where: { stage: 'WON' } });
  await prisma.deal.aggregate({ _sum: { amount: true }, where: { stage: 'WON', closedAt: { lt: oneWeekAgo } } }); 
  await (prisma.lead.groupBy as any)({ by: ['status'], _count: { status: true } });
  await (prisma.deal.groupBy as any)({ by: ['stage'], _count: { stage: true } });
  await (prisma.lead.groupBy as any)({ by: ['source'], _count: { source: true } });
  await prisma.lead.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { name: true, company: true, source: true, createdAt: true } });
  await prisma.lead.findMany({ where: { createdAt: { gte: oneWeekAgo } }, select: { createdAt: true } });
  await prisma.deal.findMany({ where: { stage: 'WON', closedAt: { gte: oneWeekAgo } }, select: { closedAt: true, createdAt: true, amount: true } });
  await prisma.lead.count({ where: { createdAt: { gte: today } } });
  await prisma.aIInsight.findMany({ take: 2, orderBy: { createdAt: 'desc' }, include: { lead: true } });
  
  const end = Date.now();
  console.log(`Prisma sequential execution time: ${end - start} ms`);
  await prisma.$disconnect();
}

test();
