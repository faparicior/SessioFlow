/**
 * Proxy for Request Context & Observability
 *
 * - Injects correlation IDs for request tracing
 * - Adds request timing information
 * - Propagates user context across layers
 *
 * @module proxy
 */

import {NextResponse, type NextRequest} from 'next/server';
import {generateCorrelationId} from '@/shared/infrastructure/logging/request-context';

export function proxy(request: NextRequest) {
  // Generate or extract correlation ID
  const correlationId
    = request.headers.get('x-correlation-id')
      || request.headers.get('x-request-id')
      || generateCorrelationId();

  // Extract user context if available
  const userId = request.headers.get('x-user-id') || undefined;

  // Create response with headers for downstream services
  const response = NextResponse.next();

  // Inject correlation ID into response headers
  response.headers.set('x-correlation-id', correlationId);

  // Add request timing header
  response.headers.set('x-request-start', Date.now().toString());

  // Log request entry (in development, this will be visible)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Request] ${request.method} ${request.nextUrl.pathname} [${correlationId}]${userId ? ` userId=${userId}` : ''}`);
  }

  // Attach context to response for use in API routes
  return response;
}

// Configure which routes should use this proxy
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (stored in public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
