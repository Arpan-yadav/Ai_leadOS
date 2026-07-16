import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
    
    console.log("Testing aggregate 1...");
    const agg1 = await prisma.deal.aggregate({ _sum: { amount: true }, where: { stage: 'WON' } });
    console.log(agg1);
    
    console.log("Testing aggregate 2...");
    const agg2 = await prisma.deal.aggregate({ _sum: { amount: true }, where: { stage: 'WON', closedAt: { lt: oneWeekAgo } } });
    console.log(agg2);
    
    console.log("Testing findMany...");
    const find = await prisma.deal.findMany({ where: { stage: 'WON', closedAt: { gte: oneWeekAgo } }, select: { closedAt: true, createdAt: true, amount: true } });
    console.log(find);
    
    console.log("All queries successful");
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
