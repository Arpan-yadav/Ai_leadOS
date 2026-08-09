import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const sequences = await prisma.sequence.findMany();
  console.log('Total sequences:', sequences.length);
  sequences.forEach(s => console.log(`- ${s.name} (Tenant: ${s.tenantId})`));
}

check().catch(console.error).finally(() => prisma.$disconnect());
