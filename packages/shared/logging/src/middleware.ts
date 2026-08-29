/**
 * API Correlation Middleware Helper
 *
 * Provides wrappers for HTTP API route handlers to ensure request-scoped
 * context (correlation ID) is initialized and propagated to responses.
 */

import {
  extractCorrelationId,
  generateCorrelationId,
  withRequestContextAsync,
} from './request-context.js';

export type ApiRouteHandler<TReq = Request, TRes = Response> = (
  request: TReq,
  context?: unknown,
) => Promise<TRes>;

/**
 * Wraps an API route handler (e.g., Next.js Route Handler or Fetch Handler)
 * to automatically initialize the request context with a correlation ID
 * and append the x-correlation-id header to the outgoing response.
 */
export function withApiCorrelation<
  TReq extends {headers: Headers},
  TRes extends {headers: Headers},
>(handler: ApiRouteHandler<TReq, TRes>): ApiRouteHandler<TReq, TRes> {
  return async (request: TReq, context?: unknown): Promise<TRes> => {
    const extractedId = extractCorrelationId(request.headers);
    const correlationId = generateCorrelationId(extractedId);

    return withRequestContextAsync({correlationId}, async () => {
      const response = await handler(request, context);
      if (response && response.headers && typeof response.headers.set === 'function') {
        response.headers.set('x-correlation-id', correlationId);
      }
      return response;
    });
  };
}
