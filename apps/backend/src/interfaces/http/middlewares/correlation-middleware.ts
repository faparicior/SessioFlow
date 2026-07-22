import type {IncomingMessage, ServerResponse} from 'node:http';
import {
  extractCorrelationId,
  generateCorrelationId,
  withRequestContext,
} from '@sessioflow/shared-logging/context';

/**
 * Backend Express / Node HTTP Correlation ID Middleware
 *
 * Extracts 'x-correlation-id' (or 'x-request-id') from incoming request headers,
 * generates a fallback correlation ID if not present, sets the response header,
 * and initializes request-scoped AsyncLocalStorage context.
 */
export function correlationMiddleware<
  Req extends IncomingMessage = IncomingMessage,
  Res extends ServerResponse = ServerResponse,
>(req: Req, res: Res, next: () => void): void {
  const extracted = extractCorrelationId(
    req.headers as Record<string, string | string[] | undefined>,
  );
  const correlationId = generateCorrelationId(extracted);

  res.setHeader('x-correlation-id', correlationId);

  withRequestContext({correlationId}, () => {
    next();
  });
}
