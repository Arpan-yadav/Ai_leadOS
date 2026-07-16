const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  // Promote all existing users who are EXECUTIVE to ADMIN for the first admin setup
  const user = await prisma.user.updateMany({
    where: { email: 'yadavarpan03@gmail.com' },
    data: { role: 'ADMIN' }
  });
  console.log('Updated:', user.count, 'user(s) to ADMIN role');
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
