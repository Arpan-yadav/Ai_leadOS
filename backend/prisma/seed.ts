import { PrismaClient, LeadStatus, LeadSource, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create an Admin User
  const hashedPassword = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@leados.com' },
    update: {},
    create: {
      email: 'admin@leados.com',
      name: 'Sarah Chen',
      password: hashedPassword,
      role: Role.ADMIN,
      avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=e2e8f0',
    },
  });

  console.log(`✅ Admin user created: ${admin.email}`);

  // 2. Create mock Leads
  const mockLeads = [
    {
      name: 'James Wilson',
      company: 'TechCorp Solutions',
      email: 'james@techcorp.com',
      source: LeadSource.LINKEDIN,
      status: LeadStatus.QUALIFIED,
      score: 85,
    },
    {
      name: 'Elena Rodriguez',
      company: 'BrightMedia',
      email: 'elena@brightmedia.io',
      source: LeadSource.META_LEADS,
      status: LeadStatus.CONTACTED,
      score: 92,
    },
    {
      name: 'Rahul Sharma',
      company: 'Digital Agency',
      email: 'rahul@digital.com',
      source: LeadSource.WHATSAPP,
      status: LeadStatus.NEW,
      score: 71,
    },
    {
      name: 'Sarah Jenkins',
      company: 'Innovate Co',
      email: 's.jenkins@innovate.com',
      source: LeadSource.EMAIL,
      status: LeadStatus.NEW,
      score: 60,
    },
    {
      name: 'David Park',
      company: 'GlobalTrade',
      email: 'dpark@globaltrade.net',
      source: LeadSource.REFERRAL,
      status: LeadStatus.UNQUALIFIED,
      score: 38,
    }
  ];

  console.log(`📦 Seeding ${mockLeads.length} leads...`);
  
  for (const lead of mockLeads) {
    await prisma.lead.create({
      data: {
        ...lead,
        assignedToId: admin.id,
      },
    });
  }

  console.log('✅ Leads created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
