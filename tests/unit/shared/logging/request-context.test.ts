import {describe, it, expect} from 'vitest';
import {
  extractCorrelationId,
  generateCorrelationId,
  getCorrelationId,
  withRequestContext,
  withRequestContextAsync,
} from '@sessioflow/shared-logging/context';
import {withApiCorrelation} from '@sessioflow/shared-logging/middleware';

describe('RequestContext', () => {
  describe('extractCorrelationId()', () => {
    it('returns undefined if headers are empty or undefined', () => {
      expect(extractCorrelationId(undefined)).toBeUndefined();
      expect(extractCorrelationId({})).toBeUndefined();
    });

    it('extracts x-correlation-id from Web Headers', () => {
      const headers = new Headers({'x-correlation-id': 'req-web-123'});
      expect(extractCorrelationId(headers)).toBe('req-web-123');
    });

    it('extracts x-request-id from Web Headers if x-correlation-id is missing', () => {
      const headers = new Headers({'x-request-id': 'req-request-id-456'});
      expect(extractCorrelationId(headers)).toBe('req-request-id-456');
    });

    it('extracts x-correlation-id from Record headers', () => {
      const headers = {'x-correlation-id': 'req-record-789'};
      expect(extractCorrelationId(headers)).toBe('req-record-789');
    });

    it('handles array header values from Record headers', () => {
      const headers = {'x-correlation-id': ['req-array-1', 'req-array-2']};
      expect(extractCorrelationId(headers)).toBe('req-array-1');
    });
  });

  describe('generateCorrelationId()', () => {
    it('uses provided headerValue if valid', () => {
      expect(generateCorrelationId('custom-id-123')).toBe('custom-id-123');
    });

    it('generates new req- prefixed string if headerValue is missing or empty', () => {
      const generated = generateCorrelationId();
      expect(generated).toMatch(/^req-/);
      expect(generateCorrelationId('  ')).toMatch(/^req-/);
    });
  });

  describe('withRequestContext / AsyncLocalStorage', () => {
    it('stores and retrieves correlationId in context', () => {
      withRequestContext({correlationId: 'test-correlation-id'}, () => {
        expect(getCorrelationId()).toBe('test-correlation-id');
      });

      expect(getCorrelationId()).toBeUndefined();
    });

    it('async context holds correlationId across async operations', async () => {
      await withRequestContextAsync({correlationId: 'async-correlation-id'}, async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        expect(getCorrelationId()).toBe('async-correlation-id');
      });
    });
  });

  describe('withApiCorrelation middleware wrapper', () => {
    it('initializes context and appends x-correlation-id to response headers', async () => {
      const mockHandler = async (req: Request) => {
        const currentId = getCorrelationId();
        return new Response(JSON.stringify({correlationId: currentId}), {
          status: 200,
          headers: {'Content-Type': 'application/json'},
        });
      };

      const wrapped = withApiCorrelation(mockHandler);
      const req = new Request('http://localhost/api/test', {
        headers: {'x-correlation-id': 'incoming-corr-id'},
      });

      const res = await wrapped(req);
      expect(res.headers.get('x-correlation-id')).toBe('incoming-corr-id');

      const body = await res.json();
      expect(body.correlationId).toBe('incoming-corr-id');
    });

    it('generates correlation ID if missing from request headers', async () => {
      const mockHandler = async () => new Response('OK');
      const wrapped = withApiCorrelation(mockHandler);
      const req = new Request('http://localhost/api/test');

      const res = await wrapped(req);
      const resHeader = res.headers.get('x-correlation-id');
      expect(resHeader).toMatch(/^req-/);
    });
  });
});
