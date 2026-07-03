import { PrismaClient, LeadStatus, LeadSource, Role, DealStage } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Supabase database seed...');

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
  const mockLeadsData = [
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

  console.log(`📦 Seeding ${mockLeadsData.length} leads...`);
  
  const createdLeads: any[] = [];
  for (const lead of mockLeadsData) {
    const createdLead = await prisma.lead.create({
      data: {
        ...lead,
        assignedToId: admin.id,
      },
    });
    createdLeads.push(createdLead);
  }

  console.log('✅ Leads created successfully!');

  // 3. Create Deals for the pipeline
  console.log('💼 Seeding Deals...');
  const deals = [
    { title: 'TechCorp Enterprise Plan', amount: 45000, stage: DealStage.PROPOSAL, leadId: createdLeads[0].id },
    { title: 'BrightMedia Q3 Campaign', amount: 12500, stage: DealStage.NEGOTIATION, leadId: createdLeads[1].id },
    { title: 'Digital Agency Audit', amount: 5000, stage: DealStage.DISCOVERY, leadId: createdLeads[2].id }
  ];

  for (const deal of deals) {
    await prisma.deal.create({
      data: { ...deal, ownerId: admin.id }
    });
  }

  // 4. Create Tasks
  console.log('📋 Seeding Tasks...');
  await prisma.task.createMany({
    data: [
      { title: 'Send revised proposal to James', dueDate: new Date(Date.now() + 86400000), leadId: createdLeads[0].id, assignedToId: admin.id, priority: 'high', status: 'pending' },
      { title: 'Follow up on BrightMedia negotiations', dueDate: new Date(Date.now() + 172800000), leadId: createdLeads[1].id, assignedToId: admin.id, priority: 'medium', status: 'pending' },
      { title: 'Initial discovery call with Rahul', dueDate: new Date(Date.now() - 86400000), leadId: createdLeads[2].id, assignedToId: admin.id, priority: 'medium', status: 'completed', completedAt: new Date() }
    ]
  });

  // 5. Create Activities
  console.log('📝 Seeding Activities...');
  await prisma.activity.createMany({
    data: [
      { type: 'email', content: 'Sent initial outreach email regarding our enterprise plans.', leadId: createdLeads[0].id, userId: admin.id, timestamp: new Date(Date.now() - 259200000) },
      { type: 'call', content: 'Discovery call completed. Strong interest in automation features.', leadId: createdLeads[0].id, userId: admin.id, timestamp: new Date(Date.now() - 172800000) },
      { type: 'whatsapp', content: 'Messaged to coordinate next meeting time.', leadId: createdLeads[1].id, userId: admin.id, timestamp: new Date(Date.now() - 86400000) }
    ]
  });

  console.log('✅ Supabase Database fully seeded with mock data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
