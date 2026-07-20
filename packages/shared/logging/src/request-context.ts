/**
 * Request Context Management
 *
 * Provides request-scoped context with correlation IDs for tracing
 * requests across application layers.
 */

import { AsyncLocalStorage } from 'node:async_hooks';
import { v4 as uuidv4 } from 'uuid';

export type RequestContextData = {
  correlationId: string;
  userId?: string;
  requestId: string;
  startTime: number;
  metadata: Record<string, unknown>;
};

const requestStorage = new AsyncLocalStorage<RequestContextData>();

export function getRequestContext(): RequestContextData | undefined {
  return requestStorage.getStore();
}

export function generateCorrelationId(headerValue?: string): string {
  return headerValue ?? `req-${uuidv4()}`.slice(0, 32);
}

export function withRequestContext<T>(
  context: Partial<RequestContextData>,
  fn: () => T
): T {
  const defaultContext: RequestContextData = {
    correlationId: context.correlationId ?? generateCorrelationId(),
    userId: context.userId,
    requestId: uuidv4(),
    startTime: Date.now(),
    metadata: context.metadata ?? {},
  };

  return requestStorage.run(defaultContext, fn);
}

export async function withRequestContextAsync<T>(
  context: Partial<RequestContextData>,
  fn: () => Promise<T>
): Promise<T> {
  const defaultContext: RequestContextData = {
    correlationId: context.correlationId ?? generateCorrelationId(),
    userId: context.userId,
    requestId: uuidv4(),
    startTime: Date.now(),
    metadata: context.metadata ?? {},
  };

  return requestStorage.run(defaultContext, fn);
}

export function getCorrelationId(): string | undefined {
  const context = getRequestContext();
  return context?.correlationId;
}

export function getRequestDuration(): number | undefined {
  const context = getRequestContext();
  if (!context) {
    return undefined;
  }
  return Date.now() - context.startTime;
}

export function addRequestMetadata(key: string, value: unknown): void {
  const context = getRequestContext();
  if (context) {
    context.metadata[key] = value;
  }
}

export function getRequestMetadata(): Record<string, unknown> {
  const context = getRequestContext();
  return context?.metadata ?? {};
}
