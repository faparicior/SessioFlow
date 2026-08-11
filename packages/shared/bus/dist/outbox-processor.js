import { eq } from 'drizzle-orm';
import { db } from '@sessioflow/shared-database/client';
import { outboxMessagesTable } from '@sessioflow/shared-database/schema';
import { getLogger } from '@sessioflow/shared-logging/logger';
export class OutboxProcessor {
    /**
     * Processes all pending outbox messages up to a given batch limit.
     */
    static async processPending(publisher, batchSize = 50) {
        const logger = getLogger();
        const pendingMessages = await db
            .select()
            .from(outboxMessagesTable)
            .where(eq(outboxMessagesTable.status, 'PENDING'))
            .limit(batchSize);
        let processed = 0;
        let failed = 0;
        for (const msg of pendingMessages) {
            try {
                await publisher.publish({
                    type: msg.eventType,
                    payload: msg.payload,
                });
                await db
                    .update(outboxMessagesTable)
                    .set({
                    status: 'PROCESSED',
                    processedAt: new Date(),
                })
                    .where(eq(outboxMessagesTable.id, msg.id));
                processed++;
            }
            catch (err) {
                const errObj = err instanceof Error ? err : new Error(String(err));
                logger.error('Failed to process outbox message', errObj, {
                    outboxId: msg.id,
                    eventType: msg.eventType,
                });
                await db
                    .update(outboxMessagesTable)
                    .set({
                    status: 'FAILED',
                    error: err instanceof Error ? err.message : String(err),
                })
                    .where(eq(outboxMessagesTable.id, msg.id));
                failed++;
            }
        }
        return { processed, failed };
    }
}
