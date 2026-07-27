const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperAdmin() {
  const email = 'admin@AI_LeadOS';
  const password = 'admin@1234';

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('Admin user already exists. Checking flags...');
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { email },
        data: { isSuperAdmin: true, password: hashedPassword }
      });
      console.log('Super admin flag and password ensured.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create a dummy tenant for the super admin
    let adminTenant = await prisma.tenant.findFirst({ where: { name: 'Super Admin Tenant' }});
    if (!adminTenant) {
      adminTenant = await prisma.tenant.create({ data: { name: 'Super Admin Tenant' }});
    }

    const admin = await prisma.user.create({
      data: {
        email,
        name: 'Super Admin',
        password: hashedPassword,
        isSuperAdmin: true,
        tenantId: adminTenant.id
      }
    });

    console.log(`Successfully created Super Admin: ${admin.email}`);
  } catch (err) {
    console.error('Failed to create super admin:', err);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
