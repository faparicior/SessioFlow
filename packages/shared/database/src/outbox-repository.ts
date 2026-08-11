import { db } from './client.js';
import { outboxMessagesTable } from './schema.js';

export interface OutboxRepository {
  saveAll(events: unknown[], aggregateType: string, aggregateId: string): Promise<void>;
}

export class DrizzleOutboxRepository implements OutboxRepository {
  async saveAll(events: unknown[], aggregateType: string, aggregateId: string): Promise<void> {
    if (events.length === 0) return;

    const outboxRows = events.map((event: any) => ({
      aggregateType,
      aggregateId,
      eventType: event.type ?? event.constructor.name,
      payload: typeof event.toJSON === 'function' ? event.toJSON() : event,
      status: 'PENDING',
      createdAt: new Date(),
    }));

    await db.insert(outboxMessagesTable).values(outboxRows);
  }
}
