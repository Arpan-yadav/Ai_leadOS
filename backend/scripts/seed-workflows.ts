import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedWorkflows() {
  console.log('Seeding workflows & sequences...');

  // Get first user to assign as creator
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No users found in database to assign workflows to.');
    return;
  }

  // Clear existing workflows & sequences
  await prisma.workflowExecution.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.sequenceEnrollment.deleteMany();
  await prisma.sequence.deleteMany();

  const pairs = [
    {
      name: 'Enterprise VIP Outreach (14 Days)',
      description: 'High-touch 14-day sequence for top-tier enterprise leads.',
      workflowDefinition: {
        nodes: [
          { id: 't1', type: 'triggerNode', position: { x: 250, y: 50 }, data: { label: 'New Lead Created', description: 'Enterprise tier identified' } },
          { id: 'ai1', type: 'aiDecisionNode', position: { x: 250, y: 200 }, data: { label: 'Check Intent Score', description: 'Score > 85?' } },
          { id: 'a1', type: 'actionNode', position: { x: 50, y: 350 }, data: { label: 'Send High-Touch Intro Email', description: 'Hyper-personalized by AI' } },
          { id: 'a2', type: 'actionNode', position: { x: 450, y: 350 }, data: { label: 'Add to Standard Nurture', description: 'Fallback sequence' } },
          { id: 'a3', type: 'actionNode', position: { x: 50, y: 500 }, data: { label: 'LinkedIn Connect', description: 'Executive matching' } },
          { id: 'a4', type: 'actionNode', position: { x: 50, y: 650 }, data: { label: 'Wait 3 Days', description: 'Cooldown period' } },
          { id: 'a5', type: 'actionNode', position: { x: 50, y: 800 }, data: { label: 'Follow-up Value Prop', description: 'Case study focused' } },
          { id: 'ai2', type: 'aiDecisionNode', position: { x: 250, y: 950 }, data: { label: 'Analyze Response', description: 'Positive sentiment?' } },
          { id: 'a6', type: 'actionNode', position: { x: 50, y: 1100 }, data: { label: 'Schedule Discovery Call', description: 'Route to AE' } },
        ],
        edges: [
          { id: 'e1', source: 't1', target: 'ai1', animated: true },
          { id: 'e2', source: 'ai1', target: 'a1', label: 'Yes', animated: true },
          { id: 'e3', source: 'ai1', target: 'a2', label: 'No', animated: true },
          { id: 'e4', source: 'a1', target: 'a3', animated: true },
          { id: 'e5', source: 'a3', target: 'a4', animated: true },
          { id: 'e6', source: 'a4', target: 'a5', animated: true },
          { id: 'e7', source: 'a5', target: 'ai2', animated: true },
          { id: 'e8', source: 'ai2', target: 'a6', label: 'Yes', animated: true },
        ]
      },
      sequenceSteps: [
        { type: 'AI_EMAIL', title: 'Send High-Touch Intro Email', content: 'AI-generated intro based on intent.' },
        { type: 'LINKEDIN', title: 'LinkedIn Connect Request', content: 'Executive match request.' },
        { type: 'DELAY', title: 'Wait 3 Days', waitDays: 3 },
        { type: 'EMAIL', title: 'Follow-up Value Prop Email', content: 'Case study attachment.' },
        { type: 'MANUAL', title: 'Schedule Discovery Call', content: 'Call lead to schedule.' }
      ]
    },
    {
      name: 'Inbound Trial Nurture',
      description: 'Onboarding sequence for new trial signups.',
      workflowDefinition: {
        nodes: [
          { id: 't1', type: 'triggerNode', position: { x: 250, y: 50 }, data: { label: 'Form Submitted', description: 'Trial Signup' } },
          { id: 'a1', type: 'actionNode', position: { x: 250, y: 200 }, data: { label: 'Welcome Email', description: 'Quick Start Guide attached' } },
          { id: 'a2', type: 'actionNode', position: { x: 250, y: 350 }, data: { label: 'Wait 2 Days', description: 'Let them explore' } },
          { id: 'ai1', type: 'aiDecisionNode', position: { x: 250, y: 500 }, data: { label: 'Active in App?', description: 'Check telemetry data' } },
          { id: 'a3', type: 'actionNode', position: { x: 50, y: 650 }, data: { label: 'Send Pro Tips', description: 'Advanced features' } },
          { id: 'a4', type: 'actionNode', position: { x: 450, y: 650 }, data: { label: 'Check-in Call Task', description: 'CSM manual intervention' } },
          { id: 'a5', type: 'actionNode', position: { x: 50, y: 800 }, data: { label: 'Offer Extension', description: 'If usage is high' } },
        ],
        edges: [
          { id: 'e1', source: 't1', target: 'a1', animated: true },
          { id: 'e2', source: 'a1', target: 'a2', animated: true },
          { id: 'e3', source: 'a2', target: 'ai1', animated: true },
          { id: 'e4', source: 'ai1', target: 'a3', label: 'Yes', animated: true },
          { id: 'e5', source: 'ai1', target: 'a4', label: 'No', animated: true },
          { id: 'e6', source: 'a3', target: 'a5', animated: true },
        ]
      },
      sequenceSteps: [
        { type: 'EMAIL', title: 'Welcome Email', content: 'Quick Start Guide attached.' },
        { type: 'DELAY', title: 'Wait 2 Days', waitDays: 2 },
        { type: 'EMAIL', title: 'Send Pro Tips', content: 'Highlight advanced features.' },
        { type: 'MANUAL', title: 'Check-in Call Task', content: 'Check if they need help.' }
      ]
    },
    {
      name: 'Cold Outbound Drip',
      description: 'Standard 4-touch AI drip campaign for cold leads.',
      workflowDefinition: {
        nodes: [
          { id: 't1', type: 'triggerNode', position: { x: 250, y: 50 }, data: { label: 'Tag Added', description: 'Cold List' } },
          { id: 'a1', type: 'actionNode', position: { x: 250, y: 200 }, data: { label: 'AI Icebreaker Email', description: 'Scraped from LinkedIn' } },
          { id: 'a2', type: 'actionNode', position: { x: 250, y: 350 }, data: { label: 'Wait 4 Days', description: '' } },
          { id: 'a3', type: 'actionNode', position: { x: 250, y: 500 }, data: { label: 'Follow-up Email', description: 'Value Prop' } },
          { id: 'ai1', type: 'aiDecisionNode', position: { x: 250, y: 650 }, data: { label: 'Opened Email?', description: 'Engagement Check' } },
          { id: 'a4', type: 'actionNode', position: { x: 50, y: 800 }, data: { label: 'Send Case Study', description: 'Social Proof' } },
          { id: 'a5', type: 'actionNode', position: { x: 450, y: 800 }, data: { label: 'Archive', description: 'Move to cold pool' } },
        ],
        edges: [
          { id: 'e1', source: 't1', target: 'a1', animated: true },
          { id: 'e2', source: 'a1', target: 'a2', animated: true },
          { id: 'e3', source: 'a2', target: 'a3', animated: true },
          { id: 'e4', source: 'a3', target: 'ai1', animated: true },
          { id: 'e5', source: 'ai1', target: 'a4', label: 'Yes', animated: true },
          { id: 'e6', source: 'ai1', target: 'a5', label: 'No', animated: true },
        ]
      },
      sequenceSteps: [
        { type: 'AI_EMAIL', title: 'AI Icebreaker Email', content: 'Scraped from LinkedIn' },
        { type: 'DELAY', title: 'Wait 4 Days', waitDays: 4 },
        { type: 'EMAIL', title: 'Follow-up Email', content: 'Value Prop focused' },
        { type: 'EMAIL', title: 'Send Case Study', content: 'Social proof case study.' }
      ]
    },
    {
      name: 'Post-Webinar Engagement',
      description: 'Engage attendees after a webinar.',
      workflowDefinition: {
        nodes: [
          { id: 't1', type: 'triggerNode', position: { x: 250, y: 50 }, data: { label: 'Tag Added', description: 'webinar-attendee' } },
          { id: 'a1', type: 'actionNode', position: { x: 250, y: 200 }, data: { label: 'Send Recording & Slides', description: 'Resource delivery' } },
          { id: 'ai1', type: 'aiDecisionNode', position: { x: 250, y: 350 }, data: { label: 'High Intent Topic?', description: 'Based on webinar' } },
          { id: 'a2', type: 'actionNode', position: { x: 50, y: 500 }, data: { label: 'Offer Strategy Session', description: 'Direct CTA' } },
          { id: 'a3', type: 'actionNode', position: { x: 450, y: 500 }, data: { label: 'Send ROI Calculator', description: 'Nurture asset' } },
          { id: 'a4', type: 'actionNode', position: { x: 50, y: 650 }, data: { label: 'Wait 1 Day', description: '' } },
          { id: 'a5', type: 'actionNode', position: { x: 50, y: 800 }, data: { label: 'Follow-up on Session', description: 'Urgency driver' } },
        ],
        edges: [
          { id: 'e1', source: 't1', target: 'a1', animated: true },
          { id: 'e2', source: 'a1', target: 'ai1', animated: true },
          { id: 'e3', source: 'ai1', target: 'a2', label: 'Yes', animated: true },
          { id: 'e4', source: 'ai1', target: 'a3', label: 'No', animated: true },
          { id: 'e5', source: 'a2', target: 'a4', animated: true },
          { id: 'e6', source: 'a4', target: 'a5', animated: true },
        ]
      },
      sequenceSteps: [
        { type: 'EMAIL', title: 'Send Recording & Slides', content: 'Here is the webinar recording.' },
        { type: 'EMAIL', title: 'Offer Strategy Session', content: 'Book a strategy session with us.' },
        { type: 'DELAY', title: 'Wait 1 Day', waitDays: 1 },
        { type: 'EMAIL', title: 'Follow-up on Session', content: 'Urgency driver.' }
      ]
    },
    {
      name: 'Churn Prevention / Re-engagement',
      description: 'Automated recovery for ghosted leads.',
      workflowDefinition: {
        nodes: [
          { id: 't1', type: 'triggerNode', position: { x: 250, y: 50 }, data: { label: 'Stage Changed', description: 'Ghosted' } },
          { id: 'a1', type: 'actionNode', position: { x: 250, y: 200 }, data: { label: 'Send Breakup Email', description: 'Polite withdrawal' } },
          { id: 'a2', type: 'actionNode', position: { x: 250, y: 350 }, data: { label: 'Wait 7 Days', description: 'Radio silence' } },
          { id: 'ai1', type: 'aiDecisionNode', position: { x: 250, y: 500 }, data: { label: 'Still no response?', description: 'Check inbox' } },
          { id: 'a3', type: 'actionNode', position: { x: 50, y: 650 }, data: { label: 'Hail Mary WhatsApp', description: 'Final discount offer' } },
          { id: 'a4', type: 'actionNode', position: { x: 450, y: 650 }, data: { label: 'Remove from Pipeline', description: 'Clean CRM' } },
          { id: 'a5', type: 'actionNode', position: { x: 50, y: 800 }, data: { label: 'Archive Lead', description: 'Mark as lost' } },
        ],
        edges: [
          { id: 'e1', source: 't1', target: 'a1', animated: true },
          { id: 'e2', source: 'a1', target: 'a2', animated: true },
          { id: 'e3', source: 'a2', target: 'ai1', animated: true },
          { id: 'e4', source: 'ai1', target: 'a3', label: 'Yes', animated: true },
          { id: 'e5', source: 'ai1', target: 'a4', label: 'No', animated: true },
          { id: 'e6', source: 'a3', target: 'a5', animated: true },
        ]
      },
      sequenceSteps: [
        { type: 'EMAIL', title: 'Send Breakup Email', content: 'Are you still interested?' },
        { type: 'DELAY', title: 'Wait 7 Days', waitDays: 7 },
        { type: 'MANUAL', title: 'Hail Mary WhatsApp', content: 'Final discount offer.' },
        { type: 'MANUAL', title: 'Archive Lead', content: 'Mark lead as lost.' }
      ]
    }
  ];

  const createdPairs: any[] = [];
  for (const pair of pairs) {
    const wf = await prisma.workflow.create({
      data: {
        name: pair.name,
        description: pair.description,
        hasAINodes: true,
        status: 'ACTIVE',
        definition: pair.workflowDefinition,
        createdById: user.id,
      }
    });

    const seq = await prisma.sequence.create({
      data: {
        name: pair.name,
        description: pair.description,
        status: 'ACTIVE',
        steps: pair.sequenceSteps,
        enrollment: { autoEnroll: false },
        exitRules: { reply: true, meeting: true },
        createdById: user.id,
      }
    });

    createdPairs.push({ workflow: wf, sequence: seq });
    console.log(`Created: ${pair.name}`);
  }

  // Assign to active leads
  const activeLeads = await prisma.lead.findMany();
  let pairIndex = 0;

  for (const lead of activeLeads) {
    const { workflow, sequence } = createdPairs[pairIndex];

    // Enroll in Sequence
    const enrollment = await prisma.sequenceEnrollment.create({
      data: {
        sequenceId: sequence.id,
        leadId: lead.id,
        status: 'active',
        currentStepNumber: 1,
        nextStepAt: new Date(Date.now() + 2000), // start in 2 seconds
      }
    });

    // Create Workflow Execution
    await prisma.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        leadId: lead.id,
        status: 'active',
        currentStep: 1,
      }
    });

    console.log(`Assigned Lead ${lead.name} to ${workflow.name}`);
    pairIndex = (pairIndex + 1) % createdPairs.length;
  }

  console.log('Seeding complete!');
}

seedWorkflows()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
