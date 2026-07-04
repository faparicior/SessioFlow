/**
 * Logging Module
 * 
 * Central export point for all logging functionality.
 * Provides structured logging with correlation IDs and OpenTelemetry integration.
 * 
 * @module shared/infrastructure/logging
 */

export {
  Logger,
  LogContext,
  LoggerSymbol,
} from '../../domain/logging/logger.js';

export {
  PinoLogger,
  getLogger,
  createChildLogger,
} from './pino-logger.js';

export {
  ObservabilityInstrumentation,
  initObservability,
  getObservability,
  shutdownObservability,
} from './instrumentation.js';

export {
  getRequestContext,
  generateCorrelationId,
  withRequestContext,
  withRequestContextAsync,
  getCorrelationId,
  getRequestDuration,
  addRequestMetadata,
  getRequestMetadata,
} from './request-context.js';