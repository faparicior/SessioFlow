import {getLogger} from '@sessioflow/shared-logging/logger';

const logger = getLogger();

/**
 * Route-level safety net (AGENTS.md error-handling contract).
 *
 * Module controllers translate `DomainError`s into mapped responses and
 * rethrow everything else; this is the last boundary that logs the unexpected
 * failure and answers a generic 500 without leaking internals to the client.
 */
export function internalErrorResponse(scope: string, error: unknown): Response {
  const cause = error instanceof Error ? error : new Error(String(error));
  logger.error(`Unhandled API error in ${scope}`, cause);

  return new Response(
    JSON.stringify({
      error: {code: 'INTERNAL_ERROR', message: 'An unexpected error occurred'},
    }),
    {status: 500, headers: {'Content-Type': 'application/json'}},
  );
}
