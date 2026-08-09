import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDups() {
  const sequences = await prisma.sequence.findMany();
  const seqMap = new Map();
  for (const seq of sequences) {
    const key = `${seq.tenantId}-${seq.name}`;
    if (!seqMap.has(key)) seqMap.set(key, []);
    seqMap.get(key).push(seq.id);
  }

  for (const [key, ids] of seqMap.entries()) {
    if (ids.length > 1) {
      console.log(`Duplicate found for ${key}: ${ids.length} instances -> IDs: ${ids.join(', ')}`);
    }
  }
}
checkDups().catch(console.error).finally(() => prisma.$disconnect());
