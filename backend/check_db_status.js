const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$connect()
  .then(() => { console.log('DB_AWAKE'); process.exit(0); })
  .catch((e) => { console.error('DB_ASLEEP', e.message); process.exit(1); });
