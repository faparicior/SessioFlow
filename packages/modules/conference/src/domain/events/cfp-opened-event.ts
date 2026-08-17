import {DomainEvent} from './domain-event.interface.js';

/**
 * CfpOpenedEvent - Published when a Conference transitions DRAFT -> CFP_OPEN.
 * Consumed async via the Transactional Outbox (welcome email worker is
 * optional per ADR-011-01 and out of scope for this flow).
 */
export class CfpOpenedEvent implements DomainEvent {
  public readonly type = 'CFP_OPENED';
  public readonly timestamp: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
  ) {
    this.timestamp = new Date();
  }

  public toJSON(): Record<string, unknown> {
    return {
      type: this.type,
      aggregateId: this.aggregateId,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
      timestamp: this.timestamp.toISOString(),
    };
  }
}
