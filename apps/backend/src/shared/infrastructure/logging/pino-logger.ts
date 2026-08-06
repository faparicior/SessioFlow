/**
 * Pino Logger Implementation
 *
 * Production-ready logger using Pino with structured JSON output.
 * Supports correlation IDs, error tracking, and context propagation.
 *
 * @module shared/infrastructure/logging
 */

import pino from 'pino';
import {type Logger, type LogContext} from '../../domain/logging/logger';

type PinoLoggerConfig = {
  level?: string;
  format?: 'json' | 'pretty';
  enabled?: boolean;
  destination?: 'console' | 'file';
  logPath?: string; // Path for file-based logging
  fileTransport?: string; // Custom pino transport for file (e.g., 'pino-roll')
};

export class PinoLogger implements Logger {
  private readonly logger: pino.Logger;
  private boundContext: LogContext;

  constructor(config: PinoLoggerConfig = {}) {
    // Read from environment variables if not explicitly provided
    const envDestination = process.env.LOG_DESTINATION ?? 'console';

    if (envDestination !== 'console' && envDestination !== 'file' && envDestination !== 'both') {
      console.warn(`Invalid LOG_DESTINATION: ${envDestination}`);
    }

    const envLogPath = process.env.LOG_PATH ?? './logs/app.log';
    const envLevel = process.env.LOG_LEVEL ?? 'info';
    const envFormat = process.env.LOG_FORMAT ?? 'json';
    if (envFormat !== 'json' && envFormat !== 'pretty') {
      console.warn(`Invalid LOG_FORMAT: ${envFormat}`);
    }

    const {
      level = envLevel,
      format = envFormat,
      enabled = process.env.LOG_ENABLED !== 'false',
      destination = envDestination ?? 'console',
      logPath = envLogPath,
      fileTransport = 'pino/file',
    } = config;

    if (!enabled) {
      // Disabled logger - no output
      this.logger = pino({level: 'silent'});
      this.boundContext = {};
      return;
    }

    const baseOptions: pino.LoggerOptions = {
      level,
      timestamp: pino.stdTimeFunctions.isoTime,
      base: undefined, // Remove default pid, hostname
    };

    // Note: formatters.level is not compatible with multiple transport targets
    // We'll add it only for single-target configurations

    // Determine destination based on config
    let transportOptions: pino.LoggerOptions;

    if (destination === 'both') {
      // Log to both console and file - use pino-multistream or simple console
      transportOptions = {
        ...baseOptions,
        level,
        transport: {
          targets: [
            {
              target: 'pino-pretty',
              level: 'info',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
            },
            {
              target: fileTransport,
              level,
              options: {
                destination: logPath,
                mkdir: true,
              },
            },
          ],
        },
      };
      this.logger = pino(transportOptions);
    } else if (destination === 'file') {
      // File-based logging using pino transport
      transportOptions = {
        ...baseOptions,
        formatters: {
          level: label => ({level: label.toUpperCase()}),
        },
        transport: {
          target: fileTransport,
          options: {
            destination: logPath,
            mkdir: true,
          },
        },
      };
      this.logger = pino(transportOptions);
    } else if (format === 'pretty' || process.env.NODE_ENV === 'development') {
      // Pretty printing in development
      transportOptions = {
        ...baseOptions,
        formatters: {
          level: label => ({level: label.toUpperCase()}),
        },
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      };
      this.logger = pino(transportOptions);
    } else {
      // JSON output to stdout
      this.logger = pino(baseOptions);
    }

    this.boundContext = {};
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = error
      ? {
        error: error.message,
        stack: error.stack,
        name: error.name,
      }
      : {};

    this.log('error', message, {...context, ...errorContext});
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  trace(message: string, context?: LogContext): void {
    this.log('trace', message, context);
  }

  child(context: LogContext): Logger {
    const childLogger = new PinoLogger();
    childLogger.bind({...this.boundContext, ...context});
    return childLogger;
  }

  bind(context: LogContext): void {
    this.boundContext = {...this.boundContext, ...context};
  }

  private log(
    level: pino.LevelWithSilent,
    message: string,
    context?: LogContext,
  ): void {
    const mergedContext = {...this.boundContext, ...context};

    // Remove undefined values
    const cleanContext = Object.fromEntries(
      Object.entries(mergedContext).filter(([_, value]) => value !== undefined),
    );

    if (Object.keys(cleanContext).length > 0) {
      this.logger[level](cleanContext, message);
    } else {
      this.logger[level](message);
    }
  }
}

// Singleton instance for application-wide use
let globalLogger: PinoLogger | undefined;

export function getLogger(config?: PinoLoggerConfig): PinoLogger {
  globalLogger ??= new PinoLogger(config);
  return globalLogger;
}

export function createChildLogger(
  parent: PinoLogger,
  context: LogContext,
): PinoLogger {
  const child = new PinoLogger();
  child.bind(context);
  return child;
}
