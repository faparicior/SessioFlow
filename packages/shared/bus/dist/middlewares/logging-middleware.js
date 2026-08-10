import { getCorrelationId } from '@sessioflow/shared-logging/context';
import { getLogger } from '@sessioflow/shared-logging/logger';
export class LoggingMiddleware {
    async execute(input, next) {
        const logger = getLogger();
        const correlationId = getCorrelationId() ?? 'unknown';
        const name = input?.constructor?.name ?? 'UnknownRequest';
        const startTime = Date.now();
        logger.info(`[Bus] Dispatching ${name}`, {
            correlationId,
            requestName: name,
        });
        try {
            const result = await next();
            const durationMs = Date.now() - startTime;
            logger.info(`[Bus] Completed ${name}`, {
                correlationId,
                requestName: name,
                durationMs,
            });
            return result;
        }
        catch (error) {
            const durationMs = Date.now() - startTime;
            const err = error instanceof Error ? error : new Error(String(error));
            logger.error(`[Bus] Failed ${name}`, err, {
                correlationId,
                requestName: name,
                durationMs,
            });
            throw error;
        }
    }
}
