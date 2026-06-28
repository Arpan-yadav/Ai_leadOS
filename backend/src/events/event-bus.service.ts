/**
 * @file event-bus.service.ts
 * @description NestJS Injectable Event Bus — Sprint 2, Automation Team
 *
 * A typed, in-process event bus for the AI LeadOS automation system.
 * Wraps Node.js EventEmitter as a NestJS singleton service.
 *
 * Usage:
 *   this.eventBus.emit('lead.created', { leadId, score, source });
 *   this.eventBus.on('lead.created', (payload) => { ... });
 */

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter } from 'events';

// ─── Event Payload Types ──────────────────────────────────────────────────────

export interface LeadCreatedPayload {
  leadId: string;
  leadName: string;
  company: string;
  source: string;
  score: number;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

export interface LeadStatusChangedPayload {
  leadId: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  timestamp: Date;
}

export interface LeadScoredPayload {
  leadId: string;
  score: number;
  previousScore: number;
  reason: string;
  timestamp: Date;
}

export interface TaskCompletedPayload {
  taskId: string;
  leadId?: string;
  completedBy: string;
  timestamp: Date;
}

// ─── Event Type Map ───────────────────────────────────────────────────────────

export interface LeadOSEventMap {
  'lead.created': LeadCreatedPayload;
  'lead.status_changed': LeadStatusChangedPayload;
  'lead.scored': LeadScoredPayload;
  'task.completed': TaskCompletedPayload;
}

export type LeadOSEventName = keyof LeadOSEventMap;

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class EventBusService implements OnModuleDestroy {
  private readonly logger = new Logger(EventBusService.name);
  private readonly emitter = new EventEmitter();

  constructor() {
    // Increase max listeners to support many event handlers
    this.emitter.setMaxListeners(50);
  }

  /**
   * Emit a typed event on the bus.
   */
  emit<K extends LeadOSEventName>(event: K, payload: LeadOSEventMap[K]): void {
    this.logger.debug(`[EventBus] emit → ${event}: ${JSON.stringify(payload)}`);
    this.emitter.emit(event, payload);
  }

  /**
   * Subscribe to a typed event.
   */
  on<K extends LeadOSEventName>(
    event: K,
    handler: (payload: LeadOSEventMap[K]) => void | Promise<void>,
  ): void {
    this.emitter.on(event, (payload: LeadOSEventMap[K]) => {
      Promise.resolve(handler(payload)).catch((err) => {
        this.logger.error(`[EventBus] handler error for ${event}:`, err);
      });
    });
    this.logger.debug(`[EventBus] subscribed → ${event}`);
  }

  /**
   * Subscribe once — handler fires on next event only.
   */
  once<K extends LeadOSEventName>(
    event: K,
    handler: (payload: LeadOSEventMap[K]) => void | Promise<void>,
  ): void {
    this.emitter.once(event, (payload: LeadOSEventMap[K]) => {
      Promise.resolve(handler(payload)).catch((err) => {
        this.logger.error(`[EventBus] once handler error for ${event}:`, err);
      });
    });
  }

  /**
   * Remove a specific handler from an event.
   */
  off<K extends LeadOSEventName>(
    event: K,
    handler: (...args: any[]) => void,
  ): void {
    this.emitter.off(event, handler);
  }

  onModuleDestroy(): void {
    this.emitter.removeAllListeners();
    this.logger.log('[EventBus] All listeners removed on module destroy');
  }
}
