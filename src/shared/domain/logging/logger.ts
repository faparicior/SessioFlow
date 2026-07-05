/**
 * Logger Interface
 *
 * Abstraction for logging functionality. This interface allows swapping
 * logging implementations without changing domain or application code.
 *
 * @module shared/domain/logging
 */

export type LogContext = {
  correlationId?: string;
  userId?: string;
  conferenceId?: string;
  submissionId?: string;
  [key: string]: unknown;
};

export type Logger = {
  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext): void;

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void;

  /**
   * Log error messages with optional error object
   */
  error(message: string, error?: Error, context?: LogContext): void;

  /**
   * Log debug messages
   */
  debug(message: string, context?: LogContext): void;

  /**
   * Log trace messages (very detailed)
   */
  trace(message: string, context?: LogContext): void;

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger;

  /**
   * Bind context to this logger instance
   */
  bind(context: LogContext): void;
};

export const LoggerSymbol = Symbol('Logger');
