import {type NextRequest, NextResponse} from 'next/server';

/**
 * SessioFlow Next.js Global Middleware
 *
 * Intercepts incoming requests to ensure every request has an 'x-correlation-id'
 * header. If missing, generates a new correlation ID and propagates it to downstream
 * handlers and in the outgoing HTTP response header.
 */
export function middleware(request: NextRequest) {
  const existingCorrelationId =
    request.headers.get('x-correlation-id') ??
    request.headers.get('x-request-id');

  const correlationId =
    existingCorrelationId && existingCorrelationId.trim().length > 0
      ? existingCorrelationId.trim()
      : `req-${crypto.randomUUID()}`.slice(0, 32);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-correlation-id', correlationId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('x-correlation-id', correlationId);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and favicon
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
