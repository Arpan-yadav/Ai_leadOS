const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const workflows = await prisma.workflow.findMany();
  console.log('Workflows in DB:', workflows.length);
  console.log(workflows.map(x => ({ id: x.id, name: x.name, tenantId: x.tenantId, createdById: x.createdById })));
  
  const users = await prisma.user.findMany();
  console.log('Users in DB:', users.length);
  console.log(users.map(x => ({ id: x.id, email: x.email, tenantId: x.tenantId })));
}

check().then(() => prisma.$disconnect());
