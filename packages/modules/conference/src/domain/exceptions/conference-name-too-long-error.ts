import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';

export class ConferenceNameTooLongError extends DomainInvariantError {
  constructor() {
    super('NAME_TOO_LONG', 'Conference name cannot exceed 100 characters');
    this.name = 'ConferenceNameTooLongError';
  }
}
