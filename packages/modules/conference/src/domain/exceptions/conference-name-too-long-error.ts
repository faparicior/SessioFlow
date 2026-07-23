import { DomainInvariantError } from '@sessioflow/shared-domain/exceptions';

/**
 * ConferenceNameTooLongError - Conference name is too long (exceeds 100 characters).
 */
export class ConferenceNameTooLongError extends DomainInvariantError {
  constructor() {
    super('NAME_TOO_LONG', 'Conference name must be at most 100 characters');
    this.name = 'ConferenceNameTooLongError';
  }
}
