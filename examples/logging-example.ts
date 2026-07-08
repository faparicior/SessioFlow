/**
 * Logging Example
 *
 * This example demonstrates how to use the structured logging system
 * in SessioFlow. Run with: npx tsx examples/logging-example.ts
 */

import {getLogger, initObservability, withRequestContext} from '../src/shared/infrastructure/logging';
import {PinoLogger} from '../src/shared/infrastructure/logging/pino-logger.js';

// Initialize observability
initObservability({
  serviceName: 'sessioflow-example',
  environment: 'development',
});

// Get logger instance (console output - default)
const logger = getLogger();

// Example: File-based logging with pino/file transport
const fileLogger = new PinoLogger({
  level: 'debug',
  format: 'json',
  destination: 'file',
  logPath: './logs/example.log',
});

// Example 1: Basic logging
console.log('\n=== Example 1: Basic Logging (Console) ===\n');

logger.info('Application started', {
  version: '0.1.0',
  environment: 'development',
});

logger.debug('Loading configuration', {
  configPath: './config.json',
  features: ['auth', 'conferences', 'submissions'],
});

logger.warn('Deprecated feature used', {
  feature: 'old-api',
  migrationGuide: 'https://docs.sessioflow.app/migration',
});

// File-based logging example
console.log('\n=== File-based Logging Example ===\n');
fileLogger.info('Writing to file', {
  logPath: './logs/example.log',
  message: 'This will be stored in a file',
});

logger.info('Back to console logging', {test: true});

// Example 2: Error tracking with context
console.log('\n=== Example 2: Error Tracking ===\n');

try {
  // Simulate an error
  throw new Error('Database connection failed');
} catch (error) {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error('Failed to connect to database', err, {
    host: 'localhost:5432',
    database: 'sessioflow_dev',
    retryAttempt: 1,
  });
}

// Example 3: Request context with correlation ID
console.log('\n=== Example 3: Request Context ===\n');

withRequestContext(
  {
    userId: 'user-123',
    correlationId: 'req-abc-123',
  },
  () => {
    logger.info('Processing user request', {
      action: 'create_conference',
      conferenceName: 'Tech Conference 2026',
    });

    logger.debug('Validating input', {
      input: {
        name: 'Tech Conference 2026',
        organizerId: 'user-123',
      },
    });

    logger.info('Request completed successfully', {
      duration: '234ms',
      conferenceId: 'conf-456',
    });
  },
);

// Example 4: Child logger with additional context
console.log('\n=== Example 4: Child Logger ===\n');

const childLogger = logger.child({
  module: 'conference',
  operation: 'create',
});

childLogger.info('Starting conference creation', {
  conferenceName: 'Developer Summit',
});

childLogger.debug('Entity created', {
  conferenceId: 'conf-789',
});

// Example 5: Binding context to logger
console.log('\n=== Example 5: Bound Context ===\n');

logger.bind({
  requestId: 'req-xyz-999',
  userId: 'user-456',
});

logger.info('Processing authenticated request', {
  action: 'get_conference',
  conferenceId: 'conf-123',
});

// Note: Correlation ID will be automatically included from bound context

console.log('\n=== All examples completed ===\n');
