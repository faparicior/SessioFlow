/**
 * Logging Module
 *
 * Central export point for all logging functionality.
 * Provides structured logging with correlation IDs and OpenTelemetry integration.
 *
 * @module shared/infrastructure/logging
 */

export {
  type Logger,
  type LogContext,
  LoggerSymbol,
} from '../../domain/logging/logger';

export {
  PinoLogger,
  getLogger,
  createChildLogger,
} from './pino-logger';

export {
  ObservabilityInstrumentation,
  initObservability,
  getObservability,
  shutdownObservability,
} from './instrumentation';

export {
  getRequestContext,
  generateCorrelationId,
  withRequestContext,
  withRequestContextAsync,
  getCorrelationId,
  getRequestDuration,
  addRequestMetadata,
  getRequestMetadata,
} from './request-context';
