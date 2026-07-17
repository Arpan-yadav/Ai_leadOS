import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const faqs = [
  {
    question: "How do I configure my own API keys?",
    answer: "You can configure your personal Gemini, WhatsApp, and SMTP keys by navigating to Settings -> Integrations. Once saved, your workspace will utilize these keys for all automated outreach."
  },
  {
    question: "What does the Supreme Admin role do?",
    answer: "The Supreme Admin is the workspace owner. They are the only user with access to the Admin Panel, where they can manage system-wide settings, create custom granular roles, and manage all users."
  },
  {
    question: "How does Lead Generation AI work?",
    answer: "The AI agent scrapes specified URLs (e.g. LinkedIn profiles) and automatically qualifies them based on your predefined criteria. Qualified leads are then pushed to the 'New Leads' stage in your pipeline."
  },
  {
    question: "Can I create custom roles for my team?",
    answer: "Yes! As a Supreme Admin, go to the Admin Panel > Roles tab. You can create custom roles (e.g. 'Content Writer', 'Sales Rep') and selectively assign permissions like Manage Users or View All Leads."
  }
];

async function main() {
  console.log('Seeding FAQs...');
  await prisma.faq.deleteMany({});
  
  for (const faq of faqs) {
    await prisma.faq.create({
      data: faq,
    });
  }
  
  console.log('FAQs seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
