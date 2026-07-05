import {NextRequest} from 'next/server';

/**
 * Helper to create a mock Next.js request for testing.
 */
export function createNextRequest(
  method: string,
  url: string,
  body?: any,
  headers?: Record<string, string>,
): NextRequest {
  // NextRequest requires absolute URLs
  const absoluteUrl = url.startsWith('http')
    ? url
    : `http://localhost:3000${url}`;

  return new NextRequest(absoluteUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Helper to create a mock NextResponse.
 */
export function createMockResponse(status: number, body: any) {
  return Response.json(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
