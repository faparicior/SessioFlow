import {db} from './client.js';
import {outboxMessagesTable} from './schema.js';

export interface OutboxRepository {
  saveAll(
    events: unknown[],
    aggregateType: string,
    aggregateId: string,
    tx?: unknown,
  ): Promise<void>;
}

export class DrizzleOutboxRepository implements OutboxRepository {
  async saveAll(
    events: unknown[],
    aggregateType: string,
    aggregateId: string,
    tx?: unknown,
  ): Promise<void> {
    if (events.length === 0) return;

    const outboxRows = events.map((event: any) => ({
      aggregateType,
      aggregateId,
      eventType: event.type ?? event.constructor.name,
      payload: typeof event.toJSON === 'function' ? event.toJSON() : event,
      status: 'PENDING',
      createdAt: new Date(),
    }));

    // When a transaction handle is provided (ADR-017), write inside it so the
    // aggregate save + outbox persist atomically. `tx` is opaque (unknown) by
    // design; Drizzle transaction clients expose the same insert API as db.
    const target = (tx as {insert: typeof db.insert} | undefined) ?? db;
    await target.insert(outboxMessagesTable).values(outboxRows);
  }
}
