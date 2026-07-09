/**
 * @file auto-score.listener.ts
 * @description Auto-Score Event Listener — Sprint 3, Automation Team (Soumya)
 *
 * Listens to all key events from the EventBus:
 *  - lead.created   → log and trigger downstream actions
 *  - lead.scored    → alert team if hot lead
 *  - lead.status_changed → re-score lead automatically via Gemini AI
 *  - task.completed → log task completion for activity tracking
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService, LeadCreatedPayload, LeadStatusChangedPayload } from '../events/event-bus.service';
import { LeadsService } from '../leads/leads.service';
import { EventBusService, LeadCreatedPayload, LeadStatusChangedPayload, TaskCompletedPayload } from '../events/event-bus.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class AutoScoreListener implements OnModuleInit {
  private readonly logger = new Logger(AutoScoreListener.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly leadsService: LeadsService,
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  onModuleInit(): void {
    this.registerListeners();
  }

  private registerListeners(): void {
    // ── Lead Created: log and trigger downstream actions ──────────────────
    this.eventBus.on('lead.created', (payload: LeadCreatedPayload) => {
      this.onLeadCreated(payload);
    });

    // ── Lead Scored: alert team if hot lead ───────────────────────────────
    this.eventBus.on('lead.scored', (payload) => {
      if (payload.score >= 80) {
        this.logger.log(
          `🔥 HOT LEAD ALERT — Lead ${payload.leadId} scored ${payload.score}. Trigger sales team notification.`,
        );
        // Sprint 6: real notification (Slack / WhatsApp) will plug in here
      }
    });

<<<<<<< HEAD
    // ── Lead Status Changed: trigger re-scoring ───────────────────────────
=======
    // ── Sprint 3: Lead Status Changed → Re-score lead with AI ────────────
>>>>>>> origin/main
    this.eventBus.on('lead.status_changed', (payload: LeadStatusChangedPayload) => {
      this.onLeadStatusChanged(payload);
    });

<<<<<<< HEAD
    this.logger.log('[AutoScoreListener] Registered lead.created, lead.scored and lead.status_changed handlers');
=======
    // ── Sprint 3: Task Completed → Log the event ──────────────────────────
    this.eventBus.on('task.completed', (payload: TaskCompletedPayload) => {
      this.onTaskCompleted(payload);
    });

    this.logger.log('[AutoScoreListener] Registered all Sprint 3 event handlers');
>>>>>>> origin/main
  }

  private onLeadCreated(payload: LeadCreatedPayload): void {
    this.logger.log(
      `[lead.created] Lead "${payload.leadName}" (${payload.company}) — Score: ${payload.score} | Priority: ${payload.priority}`,
    );

    if (payload.score >= 80) {
      this.logger.log(`🔥 HIGH PRIORITY — ${payload.leadName} at ${payload.company} scored ${payload.score}. Flagging for immediate follow-up.`);
    } else if (payload.score >= 50) {
      this.logger.log(`📋 MEDIUM PRIORITY — ${payload.leadName} at ${payload.company} added to nurture queue.`);
    } else {
      this.logger.log(`📁 LOW PRIORITY — ${payload.leadName} at ${payload.company} added to cold list.`);
    }
  }

<<<<<<< HEAD
  private onLeadStatusChanged(payload: LeadStatusChangedPayload): void {
    this.logger.log(
      `[lead.status_changed] Lead ${payload.leadId} status changed from ${payload.previousStatus} to ${payload.newStatus} by ${payload.changedBy}`,
    );

    // Auto-trigger AI lead re-scoring
    this.leadsService.reScoreLead(payload.leadId).catch((err) => {
      this.logger.error(`Failed to auto-rescore lead ${payload.leadId} on status change:`, err);
    });
=======
  /**
   * Sprint 3 (Soumya): When a lead's status changes in the pipeline,
   * automatically re-score the lead using Gemini AI to reflect its new context.
   */
  private async onLeadStatusChanged(payload: LeadStatusChangedPayload): Promise<void> {
    this.logger.log(
      `[lead.status_changed] Lead ${payload.leadId}: ${payload.previousStatus} → ${payload.newStatus}`,
    );

    try {
      const lead = await this.prisma.lead.findUnique({ where: { id: payload.leadId } });
      if (!lead) return;

      // Re-score the lead with its updated status context
      const aiResult = await this.aiService.scoreLead({
        name: lead.name,
        company: lead.company,
        title: lead.title ?? undefined,
        source: lead.source,
        interactions: 1, // At least 1 interaction since they progressed
      });

      const previousScore = lead.score ?? 0;

      // Update the lead score in the database
      await this.prisma.lead.update({
        where: { id: payload.leadId },
        data: { score: aiResult.score },
      });

      // Create a new AI Insight record for this scoring
      await this.prisma.aIInsight.create({
        data: {
          leadId: payload.leadId,
          analysis: `Re-scored after status changed to ${payload.newStatus}. ${aiResult.reason}`,
          opportunities: [],
          sentiment: aiResult.score >= 75 ? 'positive' : aiResult.score >= 50 ? 'neutral' : 'negative',
          qualityScore: aiResult.icpFit,
          qualityReason: `ICP Fit: ${aiResult.icpFit}/100 — Priority: ${aiResult.priority}`,
          nextAction: aiResult.priority === 'high'
            ? 'Reach out within 24 hours'
            : aiResult.priority === 'medium'
            ? 'Add to nurture sequence'
            : 'Add to cold outreach list',
          model: 'gemini-1.5-flash',
          promptKey: 'lead_re_scorer',
          rawResponse: aiResult as any,
        },
      });

      // Fire the lead.scored event so the hot-lead alert handler picks it up
      this.eventBus.emit('lead.scored', {
        leadId: payload.leadId,
        score: aiResult.score,
        previousScore,
        reason: aiResult.reason,
        timestamp: new Date(),
      });

      this.logger.log(
        `[AutoScoreListener] Lead ${payload.leadId} re-scored after status change: ${previousScore} → ${aiResult.score}`,
      );
    } catch (err) {
      this.logger.error(`[AutoScoreListener] Re-scoring failed for lead ${payload.leadId}:`, err);
    }
  }

  /**
   * Sprint 3 (Soumya): When a task is completed, log it and potentially
   * trigger downstream actions (future: send congratulation notifications).
   */
  private onTaskCompleted(payload: TaskCompletedPayload): void {
    this.logger.log(
      `[task.completed] Task ${payload.taskId} completed by ${payload.completedBy}${payload.leadId ? ` for Lead ${payload.leadId}` : ''}`,
    );
    // Sprint 6: trigger Slack/WhatsApp notification to sales rep here
>>>>>>> origin/main
  }
}
