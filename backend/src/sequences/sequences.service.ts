import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSequenceDto } from './dto/create-sequence.dto';
import { UpdateSequenceDto } from './dto/update-sequence.dto';
import { SequenceStatus } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { TasksService } from '../tasks/tasks.service';
import { CommunicationsService } from '../communications/communications.service';

@Injectable()
export class SequencesService {
  private readonly logger = new Logger(SequencesService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private tasksService: TasksService,
    private commsService: CommunicationsService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processActiveEnrollments() {
    // 1. Fetch active enrollments due for processing
    const activeEnrollments = await this.prisma.sequenceEnrollment.findMany({
      where: { 
        status: 'active', 
        nextStepAt: { lte: new Date() } 
      },
      include: { sequence: true, lead: true }
    });

    if (activeEnrollments.length > 0) {
      this.logger.log(`⚙️ Sequence Engine: Processing ${activeEnrollments.length} active enrollment(s)...`);
    }

    for (const enr of activeEnrollments) {
      try {
        const steps = enr.sequence.steps as any[];
        const currentStep = steps[enr.currentStepNumber - 1];
        
        if (!currentStep) {
          // No more steps, complete it
          await this.prisma.sequenceEnrollment.update({
            where: { id: enr.id },
            data: { status: 'completed', exitedAt: new Date() }
          });
          continue;
        }

        this.logger.log(`Executing Sequence [${enr.sequence.name}] Step ${enr.currentStepNumber} for Lead [${enr.lead.name}]`);

        // Execute action based on channel — fire-and-forget for instant response
        if (currentStep.channel === 'EMAIL') {
          // Non-blocking: generate & send email in the background
          this.aiService.generateEmailDraft(
            enr.lead.name, 
            enr.lead.company || 'your company', 
            enr.lead.title || 'your role', 
            currentStep.title
          ).then(draft => this.commsService.sendMessage(enr.lead.id, enr.lead.email, 'EMAIL', draft, currentStep.title))
           .then(() => this.prisma.activity.create({
              data: { type: 'EMAIL_SENT', content: `Automated Sequence: ${currentStep.title}`, leadId: enr.lead.id, userId: enr.sequence.createdById }
            }))
           .catch(err => this.logger.error(`Email send failed for enrollment ${enr.id}:`, err.message));
        } else {
          // Create manual task for LinkedIn/WhatsApp/Call — also non-blocking
          this.tasksService.create({
            title: `[Sequence] ${currentStep.title} (${currentStep.channel}) for ${enr.lead.name}`,
            priority: 'high',
            leadId: enr.lead.id
          }, enr.sequence.createdById)
          .then(() => this.prisma.activity.create({
            data: { type: 'TASK_CREATED', content: `Automated Sequence task assigned: ${currentStep.title}`, leadId: enr.lead.id, userId: enr.sequence.createdById }
          }))
          .catch(err => this.logger.error(`Task creation failed for enrollment ${enr.id}:`, err.message));
        }

        // Advance step immediately (no waiting for AI/email)
        const hasMoreSteps = enr.currentStepNumber < steps.length;
        if (hasMoreSteps) {
          const nextStep = steps[enr.currentStepNumber];
          const currentDayNumber = Number(currentStep?.day) || enr.currentStepNumber;
          const nextDayNumber = Number(nextStep?.day) || (enr.currentStepNumber + 1);
          
          const nextDate = new Date();
          nextDate.setSeconds(nextDate.getSeconds() + 2); // 2s minimum for testing
          
          await this.prisma.sequenceEnrollment.update({
            where: { id: enr.id },
            data: { currentStepNumber: enr.currentStepNumber + 1, nextStepAt: nextDate }
          });
        } else {
          // Completed
          await this.prisma.sequenceEnrollment.update({
            where: { id: enr.id },
            data: { status: 'completed', exitedAt: new Date() }
          });
          this.logger.log(`Sequence [${enr.sequence.name}] for Lead [${enr.lead.name}] completed!`);
        }
      } catch (err) {
        this.logger.error(`Error processing enrollment ${enr.id}: ${(err as Error).message}`);
      }
    }
  }

  async create(dto: CreateSequenceDto, userId: string) {
    return this.prisma.sequence.create({
      data: {
        name: dto.name,
        description: dto.description,
        durationDays: dto.durationDays ?? 7,
        aiEnabled: dto.aiEnabled ?? true,
        steps: dto.steps ?? [],
        enrollment: dto.enrollment ?? {},
        exitRules: dto.exitRules ?? {},
        tags: dto.tags ?? [],
        status: SequenceStatus.ACTIVE,
        createdById: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.sequence.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { enrollments: true },
        },
        enrollments: {
          include: { lead: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const sequence = await this.prisma.sequence.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: { lead: true },
        },
      },
    });

    if (!sequence) {
      throw new NotFoundException(`Sequence with ID ${id} not found`);
    }

    return sequence;
  }

  async update(id: string, dto: UpdateSequenceDto) {
    await this.findOne(id);
    return this.prisma.sequence.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sequence.delete({ where: { id } });
  }

  async enrollLead(sequenceId: string, leadId: string) {
    await this.findOne(sequenceId);
    
    // Check if lead exists
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    return this.prisma.sequenceEnrollment.create({
      data: {
        sequenceId,
        leadId,
        status: 'active',
        currentStepNumber: 1,
        nextStepAt: new Date(), // Execute immediately
      },
    });
  }
  async advanceEnrollment(enrollmentId: string) {
    const enrollment = await this.prisma.sequenceEnrollment.findUnique({
      where: { id: enrollmentId },
      include: { sequence: true, lead: true },
    });
    
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    const steps = enrollment.sequence.steps as any[];
    const currentStep = steps[enrollment.currentStepNumber - 1];

    if (currentStep) {
      if (currentStep.channel === 'EMAIL') {
        // Fire-and-forget: don't block the response waiting for Gemini + SMTP
        this.aiService.generateEmailDraft(
          enrollment.lead.name, 
          enrollment.lead.company || 'your company', 
          enrollment.lead.title || 'your role', 
          currentStep.title
        ).then(draft => this.commsService.sendMessage(enrollment.lead.id, enrollment.lead.email, 'EMAIL', draft, currentStep.title))
         .then(() => this.prisma.activity.create({
           data: { type: 'EMAIL_SENT', content: `Automated Sequence: ${currentStep.title}`, leadId: enrollment.lead.id, userId: enrollment.sequence.createdById }
         }))
         .catch(err => this.logger.error(`[advanceEnrollment] Email failed:`, err.message));
      } else {
        // Fire-and-forget task creation
        this.tasksService.create({
          title: `[Sequence] ${currentStep.title} (${currentStep.channel}) for ${enrollment.lead.name}`,
          priority: 'high',
          leadId: enrollment.lead.id
        }, enrollment.sequence.createdById)
        .then(() => this.prisma.activity.create({
          data: { type: 'TASK_CREATED', content: `Automated Sequence task assigned: ${currentStep.title}`, leadId: enrollment.lead.id, userId: enrollment.sequence.createdById }
        }))
        .catch(err => this.logger.error(`[advanceEnrollment] Task creation failed:`, err.message));
      }
    }
    
    // Synchronize with WorkflowExecution to ensure live tracking on the Automation dashboard
    try {
      const execution = await this.prisma.workflowExecution.findFirst({
        where: { leadId: enrollment.leadId, status: 'active' },
        orderBy: { startedAt: 'desc' }
      });
      if (execution) {
        await this.prisma.workflowExecution.update({
          where: { id: execution.id },
          data: { 
            currentStep: execution.currentStep + 1,
            ...(enrollment.currentStepNumber >= steps.length ? { status: 'completed', completedAt: new Date() } : {})
          }
        });
      }
    } catch (e) {
      console.error("Failed to sync workflow execution progress", e);
    }
    
    // Check if we just completed the last step
    if (enrollment.currentStepNumber >= steps.length) {
      return this.prisma.sequenceEnrollment.update({
        where: { id: enrollmentId },
        data: { 
          status: 'completed',
          exitedAt: new Date(),
          currentStepNumber: enrollment.currentStepNumber + 1
        }
      });
    }

    const nextDate = new Date();
    nextDate.setSeconds(nextDate.getSeconds() + 2);

    // Otherwise, just advance to the next step
    return this.prisma.sequenceEnrollment.update({
      where: { id: enrollmentId },
      data: {
        currentStepNumber: enrollment.currentStepNumber + 1,
        nextStepAt: nextDate, // Re-queue it to fire the next step automatically
      }
    });
  }

  async undoEnrollment(enrollmentId: string, targetStep: number) {
    const enrollment = await this.prisma.sequenceEnrollment.findUnique({
      where: { id: enrollmentId },
    });
    
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (targetStep < 1) targetStep = 1;

    try {
      const execution = await this.prisma.workflowExecution.findFirst({
        where: { leadId: enrollment.leadId },
        orderBy: { startedAt: 'desc' }
      });
      if (execution && execution.currentStep > targetStep) {
        await this.prisma.workflowExecution.update({
          where: { id: execution.id },
          data: { 
            currentStep: targetStep,
            status: 'active',
            completedAt: null
          }
        });
      }
    } catch (e) {
      console.error("Failed to sync workflow execution progress", e);
    }

    return this.prisma.sequenceEnrollment.update({
      where: { id: enrollmentId },
      data: { 
        status: 'active',
        exitedAt: null,
        currentStepNumber: targetStep,
        nextStepAt: null // Set to null so the undo sticks and pauses the sequence
      }
    });
  }
}
