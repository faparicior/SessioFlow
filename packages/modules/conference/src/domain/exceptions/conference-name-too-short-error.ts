import { DomainInvariantError } from '@sessioflow/shared-domain/exceptions';

/**
 * ConferenceNameTooShortError - Conference name is too short (less than 3 characters).
 */
export class ConferenceNameTooShortError extends DomainInvariantError {
  constructor(message = 'Conference name must be at least 3 characters') {
    super('NAME_TOO_SHORT', message);
    this.name = 'ConferenceNameTooShortError';
  }
}
