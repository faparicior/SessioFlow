import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';

export class ConferenceNameTooShortError extends DomainInvariantError {
  constructor() {
    super('NAME_TOO_SHORT', 'Conference name must be at least 3 characters');
    this.name = 'ConferenceNameTooShortError';
  }
}
