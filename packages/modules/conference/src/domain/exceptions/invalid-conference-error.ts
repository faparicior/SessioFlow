import { DomainInvariantError } from '@sessioflow/shared-domain/exceptions';

/**
 * InvalidConferenceError - Base error for invalid conference operations.
 */
export class InvalidConferenceError extends DomainInvariantError {
  constructor(message: string) {
    super('INVALID_CONFERENCE', message);
    this.name = 'InvalidConferenceError';
  }
}
