const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTenants() {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: { users: true, leads: true }
        }
      }
    });
    console.log(`Total Tenants: ${tenants.length}`);
    console.table(tenants.map(t => ({ id: t.id, name: t.name, users: t._count.users, leads: t._count.leads })));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkTenants();
