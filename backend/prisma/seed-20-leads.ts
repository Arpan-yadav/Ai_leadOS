import { PrismaClient, LeadStatus, LeadSource } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding 20 dummy leads...');

  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!admin) {
    console.error('No admin user found. Run standard seed first.');
    process.exit(1);
  }

  const sources = [LeadSource.WEBSITE, LeadSource.LINKEDIN, LeadSource.META_LEADS, LeadSource.WHATSAPP, LeadSource.EMAIL, LeadSource.REFERRAL];
  const statuses = [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.QUALIFIED, LeadStatus.UNQUALIFIED, LeadStatus.CONVERTED];
  
  const dummyLeads = Array.from({ length: 20 }).map((_, i) => ({
    name: `Dummy Lead ${i + 1}`,
    company: `Company ${i + 1} LLC`,
    email: `dummy${i + 1}@example.com`,
    title: i % 2 === 0 ? 'CEO' : 'Marketing Director',
    phone: `+155501000${i.toString().padStart(2, '0')}`,
    source: sources[Math.floor(Math.random() * sources.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    score: Math.floor(Math.random() * 100),
    assignedToId: admin.id
  }));

  const created = await prisma.lead.createMany({
    data: dummyLeads
  });

  console.log(`✅ Successfully inserted ${created.count} dummy leads.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
