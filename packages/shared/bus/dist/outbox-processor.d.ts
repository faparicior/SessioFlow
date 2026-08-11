export interface EventPublisher {
    publish(event: {
        type: string;
        payload: unknown;
    }): Promise<void>;
}
export declare class OutboxProcessor {
    /**
     * Processes all pending outbox messages up to a given batch limit.
     */
    static processPending(publisher: EventPublisher, batchSize?: number): Promise<{
        processed: number;
        failed: number;
    }>;
}
