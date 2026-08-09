import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicates() {
  console.log('Cleaning up duplicate sequences and workflows...');
  
  // Clean Sequences
  const sequences = await prisma.sequence.findMany();
  const seqMap = new Map();
  let seqDeleted = 0;

  for (const seq of sequences) {
    const key = `${seq.tenantId}-${seq.name}`;
    if (seqMap.has(key)) {
      // It's a duplicate, delete it
      await prisma.sequence.delete({ where: { id: seq.id } });
      seqDeleted++;
    } else {
      seqMap.set(key, true);
    }
  }

  // Clean Workflows
  const workflows = await prisma.workflow.findMany();
  const wfMap = new Map();
  let wfDeleted = 0;

  for (const wf of workflows) {
    const key = `${wf.tenantId}-${wf.name}`;
    if (wfMap.has(key)) {
      // It's a duplicate, delete it
      await prisma.workflow.delete({ where: { id: wf.id } });
      wfDeleted++;
    } else {
      wfMap.set(key, true);
    }
  }

  console.log(`Cleanup complete! Deleted ${seqDeleted} duplicate sequences and ${wfDeleted} duplicate workflows.`);
}

cleanupDuplicates().catch(console.error).finally(() => prisma.$disconnect());
