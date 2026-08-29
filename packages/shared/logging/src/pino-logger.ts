/**
 * Pino Logger Implementation
 */

import pino from 'pino';

export type LogContext = Record<string, unknown>;

export interface Logger {
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
  trace(message: string, context?: LogContext): void;
  child(context: LogContext): Logger;
  bind(context: LogContext): void;
}

export type PinoLoggerConfig = {
  level?: string;
  format?: 'json' | 'pretty';
  enabled?: boolean;
  destination?: 'console' | 'file';
  logPath?: string;
  fileTransport?: string;
};

export class PinoLogger implements Logger {
  private readonly logger: pino.Logger;
  private boundContext: LogContext;

  constructor(config: PinoLoggerConfig = {}) {
    const envLevel = process.env.LOG_LEVEL ?? 'info';
    const envFormat = process.env.LOG_FORMAT ?? 'json';

    const {
      level = envLevel,
      format = envFormat,
      enabled = process.env.LOG_ENABLED !== 'false',
    } = config;

    if (!enabled) {
      this.logger = pino({level: 'silent'});
      this.boundContext = {};
      return;
    }

    const baseOptions: pino.LoggerOptions = {
      level,
      timestamp: pino.stdTimeFunctions.isoTime,
      base: undefined,
    };

    if (format === 'pretty' || process.env.NODE_ENV === 'development') {
      this.logger = pino({
        ...baseOptions,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      });
    } else {
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

  private log(level: pino.LevelWithSilent, message: string, context?: LogContext): void {
    const mergedContext = {...this.boundContext, ...context};

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

let globalLogger: PinoLogger | undefined;

export function getLogger(config?: PinoLoggerConfig): PinoLogger {
  globalLogger ??= new PinoLogger(config);
  return globalLogger;
}
