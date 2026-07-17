import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Multi-Tenant database...');

  // 1. Create Default Tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'ProyoTech Enterprise',
    },
  });
  console.log(`Created Tenant: ${tenant.name} (${tenant.id})`);

  // 2. Create Roles
  const supremeAdminRole = await prisma.customRole.create({
    data: {
      name: 'Supreme Admin',
      tenant: { connect: { id: tenant.id } },
      isDefault: true,
      permissions: { manageUsers: true, manageSettings: true, viewAllLeads: true, deleteData: true },
    },
  });

  const executiveRole = await prisma.customRole.create({
    data: {
      name: 'Executive',
      tenant: { connect: { id: tenant.id } },
      isDefault: true,
      permissions: { manageUsers: false, manageSettings: false, viewAllLeads: false, deleteData: false },
    },
  });

  // 3. Create Supreme Admin User
  const passwordHash = await bcrypt.hash('admin@1234', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@AI_LeadOS',
      name: 'Arpan Yadav',
      password: passwordHash,
      isSuperAdmin: true,
      tenantId: tenant.id,
      roleId: supremeAdminRole.id,
    },
  });
  console.log(`Created Supreme Admin: ${admin.email} (Password: admin@1234)`);

  // 4. Create Initial Tenant Settings
  await prisma.tenantSettings.create({
    data: {
      tenant: { connect: { id: tenant.id } },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
