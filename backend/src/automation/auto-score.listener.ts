/**
 * @file auto-score.listener.ts
 * @description Auto-Score Event Listener — Sprint 2, Automation Team
 *
 * Listens for 'lead.created' events and triggers high-priority alerts.
 * Additional listeners for status changes will be added in Sprint 3.
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService, LeadCreatedPayload } from '../events/event-bus.service';

@Injectable()
export class AutoScoreListener implements OnModuleInit {
  private readonly logger = new Logger(AutoScoreListener.name);

  constructor(private readonly eventBus: EventBusService) {}

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

    this.logger.log('[AutoScoreListener] Registered lead.created and lead.scored handlers');
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
}
