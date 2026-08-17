/**
 * DomainEvent - Structural contract for domain events recorded by aggregates.
 *
 * Module-local interface (D13): `@sessioflow/shared-domain` does not export a
 * DomainEvent type; events implement this contract and are serialized via
 * toJSON() for Transactional Outbox persistence (ADR-017).
 */
export interface DomainEvent {
  /** Discriminator tag (e.g. 'CONFERENCE_CREATED'). */
  readonly type: string;
  /** When the event occurred. */
  readonly timestamp: Date;
  /** Serialize the event payload for outbox persistence. */
  toJSON(): Record<string, unknown>;
}
