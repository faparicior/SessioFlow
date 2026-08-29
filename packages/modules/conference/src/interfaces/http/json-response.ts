/**
 * Minimal Web Standard JSON helpers for module HTTP controllers.
 *
 * The module stays framework-agnostic (no `next/server` dependency): the
 * route handlers in `apps/frontend` are the only framework-facing layer
 * (ADR-001). Domain error translation itself lives in
 * `mapDomainErrorToResponse` (@sessioflow/shared-http) — these helpers only
 * cover success envelopes and controller-level (pre-domain) rejections.
 */

/** Serializes a payload as a JSON `Response` with the given status. */
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {'Content-Type': 'application/json'},
  });
}

/** Standard `{ error: { code, message } }` error envelope. */
export function errorResponse(
  code: string,
  message: string,
  status: number,
): Response {
  return jsonResponse({error: {code, message}}, status);
}

/** 401 envelope emitted when the request carries no authenticated user. */
export function unauthorizedResponse(): Response {
  return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
}

/**
 * 400 envelope for bodies rejected before reaching the domain (malformed
 * JSON or shared Zod contract failures).
 */
export function invalidBodyResponse(message: string): Response {
  return errorResponse('VALIDATION_ERROR', message, 400);
}
