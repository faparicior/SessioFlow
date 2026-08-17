import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';

export class InvalidConferenceStatusError extends DomainInvariantError {
  constructor(status: string = 'unknown') {
    super(
      'INVALID_CONFERENCE_STATUS',
      `"${status}" is not a valid conference status`,
    );
    this.name = 'InvalidConferenceStatusError';
  }
}
