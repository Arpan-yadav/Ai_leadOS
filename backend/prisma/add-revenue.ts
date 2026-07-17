import { PrismaClient, DealStage } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('💰 Adding a won deal for today to generate revenue...');

  // Find the most recently created dummy lead
  const latestLead = await prisma.lead.findFirst({
    where: { name: { startsWith: 'Dummy Lead' } },
    orderBy: { createdAt: 'desc' }
  });

  if (!latestLead) {
    console.error('No dummy lead found!');
    process.exit(1);
  }

  // Find the admin user
  const admin = await prisma.user.findFirst({
    where: { roleId: null }
  });

  // Create a won deal for today
  const deal = await prisma.deal.create({
    data: {
      title: 'Enterprise Automation Package',
      amount: 15500, // This will add to today's revenue chart
      stage: DealStage.WON,
      leadId: latestLead.id,
      ownerId: admin!.id,
      closedAt: new Date() // Sets it to today
    }
  });

  console.log(`✅ Successfully added a WON deal for $${deal.amount} to ${latestLead.name}. Check the Dashboard chart!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
