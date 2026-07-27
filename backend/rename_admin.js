const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function renameAdmin() {
  const email = 'admin@AI_LeadOS';
  try {
    await prisma.user.update({
      where: { email },
      data: { name: 'arun azad' }
    });
    console.log('Successfully renamed admin to arun azad');
  } catch (err) {
    console.error('Failed to rename admin:', err);
  } finally {
    await prisma.$disconnect();
  }
}

renameAdmin();
