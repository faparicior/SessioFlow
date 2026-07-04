/**
 * Request Context Management
 * 
 * Provides request-scoped context with correlation IDs for tracing
 * requests across the application layers.
 * 
 * @module shared/infrastructure/logging
 */

import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 } from 'uuid';
import { LogContext } from '../../domain/logging/logger.js';

interface RequestContextData {
  correlationId: string;
  userId?: string;
  requestId: string;
  startTime: number;
  metadata: Record<string, unknown>;
}

// Async local storage for request-scoped context
const requestStorage = new AsyncLocalStorage<RequestContextData>();

/**
 * Get the current request context
 */
export function getRequestContext(): RequestContextData | null {
  return requestStorage.getStore() || null;
}

/**
 * Generate a correlation ID (from headers or new UUID)
 */
export function generateCorrelationId(headerValue?: string): string {
  return headerValue || `req-${uuidv4()}`.slice(0, 32);
}

/**
 * Run a function with request context
 */
export function withRequestContext<T>(
  context: Partial<RequestContextData>,
  fn: () => T
): T {
  const defaultContext: RequestContextData = {
    correlationId: context.correlationId || generateCorrelationId(),
    userId: context.userId,
    requestId: uuidv4(),
    startTime: Date.now(),
    metadata: context.metadata || {},
  };

  return requestStorage.run(defaultContext, fn);
}

/**
 * Run an async function with request context
 */
export async function withRequestContextAsync<T>(
  context: Partial<RequestContextData>,
  fn: () => Promise<T>
): Promise<T> {
  const defaultContext: RequestContextData = {
    correlationId: context.correlationId || generateCorrelationId(),
    userId: context.userId,
    requestId: uuidv4(),
    startTime: Date.now(),
    metadata: context.metadata || {},
  };

  return requestStorage.run(defaultContext, fn);
}

/**
 * Get correlation ID from current request context
 */
export function getCorrelationId(): string | null {
  const context = getRequestContext();
  return context?.correlationId || null;
}

/**
 * Get request duration in milliseconds
 */
export function getRequestDuration(): number | null {
  const context = getRequestContext();
  if (!context) return null;
  return Date.now() - context.startTime;
}

/**
 * Add metadata to current request context
 */
export function addRequestMetadata(key: string, value: unknown): void {
  const context = getRequestContext();
  if (context) {
    context.metadata[key] = value;
  }
}

/**
 * Get request metadata
 */
export function getRequestMetadata(): Record<string, unknown> {
  const context = getRequestContext();
  return context?.metadata || {};
}