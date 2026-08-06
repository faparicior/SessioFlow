/**
 * DomainError - Base class for all domain exceptions.
 *
 * DDD Principle: Pure domain layer errors with explicit error codes
 * that can be translated at the application boundary (controllers / API gateway).
 */
export abstract class DomainError extends Error {
  /**
   * Unique error code identifier used for mapping to HTTP status codes / API error responses
   */
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * DomainInvariantError - Thrown when a domain business invariant rule is violated.
 */
export class DomainInvariantError extends DomainError {
  constructor(code = 'INVALID_INVARIANT', message: string) {
    super(code, message);
  }
}

/**
 * EntityNotFoundError - Thrown when a requested domain entity or aggregate cannot be found.
 */
export class EntityNotFoundError extends DomainError {
  constructor(code = 'NOT_FOUND', message: string) {
    super(code, message);
  }
}

/**
 * DomainConflictError - Thrown when a domain resource collision occurs (e.g. duplicate slug or email).
 */
export class DomainConflictError extends DomainError {
  constructor(code = 'RESOURCE_CONFLICT', message: string) {
    super(code, message);
  }
}

/**
 * DomainForbiddenError - Thrown when a domain action is disallowed due to business constraints (e.g. free tier limit).
 */
export class DomainForbiddenError extends DomainError {
  constructor(code = 'FORBIDDEN', message: string) {
    super(code, message);
  }
}
