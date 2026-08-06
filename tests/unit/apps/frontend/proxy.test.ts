import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '../../../../apps/frontend/src/proxy.js';

describe('Next.js Edge Proxy (apps/frontend)', () => {
  it('preserves existing x-correlation-id header and echoes in response', () => {
    const req = new NextRequest('http://localhost:3000/api/v1/conferences', {
      headers: { 'x-correlation-id': 'custom-fe-id-123' },
    });

    const res = proxy(req);
    expect(res.headers.get('x-correlation-id')).toBe('custom-fe-id-123');
  });

  it('generates req- prefixed correlation ID if missing from request', () => {
    const req = new NextRequest('http://localhost:3000/api/v1/conferences');

    const res = proxy(req);
    const correlationId = res.headers.get('x-correlation-id');
    expect(correlationId).toBeDefined();
    expect(correlationId).toMatch(/^req-/);
  });
});
