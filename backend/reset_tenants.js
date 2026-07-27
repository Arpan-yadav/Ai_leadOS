const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting tenant reset...');

  // 1. Find Super Admin
  const superAdmin = await prisma.user.findUnique({
    where: { email: 'admin@AI_LeadOS' }
  });

  if (!superAdmin || !superAdmin.tenantId) {
    console.error('Could not find Super Admin or their tenantId!');
    process.exit(1);
  }

  const superAdminTenantId = superAdmin.tenantId;
  console.log(`Found Supreme Admin. Preserving tenant: ${superAdminTenantId}`);

  // Delete all tasks, activities, communication logs, leads, deals, roles, users for other tenants
  console.log('Cleaning up child records for test tenants...');
  await prisma.task.deleteMany({ where: { assignedTo: { tenantId: { not: superAdminTenantId } } } });
  await prisma.activity.deleteMany({ where: { user: { tenantId: { not: superAdminTenantId } } } });
  await prisma.workflowExecution.deleteMany({ where: { workflow: { createdBy: { tenantId: { not: superAdminTenantId } } } } });
  await prisma.workflowEdge?.deleteMany({ where: { workflow: { createdBy: { tenantId: { not: superAdminTenantId } } } } }).catch(() => {});
  await prisma.workflowNode?.deleteMany({ where: { workflow: { createdBy: { tenantId: { not: superAdminTenantId } } } } }).catch(() => {});
  await prisma.sequenceEnrollment.deleteMany({ where: { sequence: { createdBy: { tenantId: { not: superAdminTenantId } } } } });
  await prisma.sequenceStep?.deleteMany({ where: { sequence: { createdBy: { tenantId: { not: superAdminTenantId } } } } }).catch(() => {});
  await prisma.workflow.deleteMany({ where: { createdBy: { tenantId: { not: superAdminTenantId } } } });
  await prisma.sequence.deleteMany({ where: { createdBy: { tenantId: { not: superAdminTenantId } } } });
  await prisma.invitation?.deleteMany({ where: { tenantId: { not: superAdminTenantId } } }).catch(() => {});
  await prisma.aIInsight.deleteMany({ where: { lead: { assignedTo: { tenantId: { not: superAdminTenantId } } } } });
  await prisma.deal.deleteMany({ where: { owner: { tenantId: { not: superAdminTenantId } } } });
  await prisma.lead.deleteMany({ where: { assignedTo: { tenantId: { not: superAdminTenantId } } } });
  await prisma.customRole.deleteMany({ where: { tenantId: { not: superAdminTenantId } } });
  await prisma.user.deleteMany({ where: { tenantId: { not: superAdminTenantId } } });

  // 2. Delete all other tenants
  const deleteResult = await prisma.tenant.deleteMany({
    where: {
      id: { not: superAdminTenantId }
    }
  });

  console.log(`Deleted ${deleteResult.count} test tenants.`);

  // 3. Create Arpan Yadav's tenant
  const newTenant = await prisma.tenant.create({
    data: {
      name: "Arpan Yadav's Company"
    }
  });
  console.log(`Created new tenant: ${newTenant.name}`);

  // 4. Create Arpan Yadav user
  const hashedPassword = await bcrypt.hash('@Apy18748', 10);
  
  const newUser = await prisma.user.create({
    data: {
      email: 'yadavarpan03@gmail.com',
      name: 'Arpan Yadav',
      password: hashedPassword,
      isSuperAdmin: false,
      tenantId: newTenant.id
    }
  });

  console.log(`Created new user: ${newUser.email} attached to tenant ${newTenant.id}`);
  console.log('Reset complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
