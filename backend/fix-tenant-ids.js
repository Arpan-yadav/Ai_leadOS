const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const workflows = await prisma.workflow.findMany({ include: { createdBy: true } });
  let count = 0;
  for (const wf of workflows) {
    if (!wf.tenantId && wf.createdBy && wf.createdBy.tenantId) {
      await prisma.workflow.update({
        where: { id: wf.id },
        data: { tenantId: wf.createdBy.tenantId }
      });
      count++;
    }
  }
  console.log(`Updated ${count} workflows.`);

  const sequences = await prisma.sequence.findMany({ include: { createdBy: true } });
  let seqCount = 0;
  for (const seq of sequences) {
    if (!seq.tenantId && seq.createdBy && seq.createdBy.tenantId) {
      await prisma.sequence.update({
        where: { id: seq.id },
        data: { tenantId: seq.createdBy.tenantId }
      });
      seqCount++;
    }
  }
  console.log(`Updated ${seqCount} sequences.`);
}

fix().then(() => prisma.$disconnect());
