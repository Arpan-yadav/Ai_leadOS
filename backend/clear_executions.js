const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const executions = await prisma.workflowExecution.findMany({ include: { lead: true } });
  console.log('Executions in DB:', executions.length);
  console.log(executions.map(x => ({ id: x.id, lead: x.lead.name, tenantId: x.lead.tenantId, workflowId: x.workflowId })));
  
  await prisma.workflowExecution.deleteMany({});
  await prisma.sequenceEnrollment.deleteMany({});
  console.log('Deleted all old executions to clear cross-tenant ghost data.');
}

check().then(() => prisma.$disconnect());
