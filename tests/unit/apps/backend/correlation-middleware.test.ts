import { describe, it, expect, vi } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { correlationMiddleware } from '../../../../apps/backend/src/interfaces/http/middlewares/correlation-middleware.js';
import { getCorrelationId } from '@sessioflow/shared-logging/context';

describe('Backend Correlation Middleware', () => {
  it('extracts x-correlation-id from incoming request, sets response header, and establishes context', () => {
    const req = {
      headers: {
        'x-correlation-id': 'backend-corr-999',
      },
    } as unknown as IncomingMessage;

    const setHeaderMock = vi.fn();
    const res = {
      setHeader: setHeaderMock,
    } as unknown as ServerResponse;

    let capturedIdInNext: string | undefined;
    const next = vi.fn(() => {
      capturedIdInNext = getCorrelationId();
    });

    correlationMiddleware(req, res, next);

    expect(setHeaderMock).toHaveBeenCalledWith('x-correlation-id', 'backend-corr-999');
    expect(next).toHaveBeenCalledTimes(1);
    expect(capturedIdInNext).toBe('backend-corr-999');
  });

  it('generates new req- prefixed correlation ID if missing from request headers', () => {
    const req = {
      headers: {},
    } as unknown as IncomingMessage;

    const setHeaderMock = vi.fn();
    const res = {
      setHeader: setHeaderMock,
    } as unknown as ServerResponse;

    let capturedIdInNext: string | undefined;
    const next = vi.fn(() => {
      capturedIdInNext = getCorrelationId();
    });

    correlationMiddleware(req, res, next);

    expect(setHeaderMock).toHaveBeenCalledWith('x-correlation-id', expect.stringMatching(/^req-/));
    expect(next).toHaveBeenCalledTimes(1);
    expect(capturedIdInNext).toMatch(/^req-/);
  });
});
