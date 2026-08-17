import {DomainEvent} from './domain-event.interface.js';

/**
 * ConferenceCreatedEvent - Published when a Conference aggregate is created
 * in DRAFT state. Side effects (analytics, logs) are consumed async via the
 * Transactional Outbox.
 */
export class ConferenceCreatedEvent implements DomainEvent {
  public readonly type = 'CONFERENCE_CREATED';
  public readonly timestamp: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly organizerId: string,
  ) {
    this.timestamp = new Date();
  }

  public toJSON(): Record<string, unknown> {
    return {
      type: this.type,
      aggregateId: this.aggregateId,
      name: this.name,
      slug: this.slug,
      organizerId: this.organizerId,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
