import { DomainInvariantError } from '@sessioflow/shared-domain/exceptions';

/**
 * InvalidConferenceIdError - Invalid UUID format for ConferenceId.
 */
export class InvalidConferenceIdError extends DomainInvariantError {
  constructor() {
    super('INVALID_CONFERENCE_ID', 'Invalid UUID format for ConferenceId');
    this.name = 'InvalidConferenceIdError';
  }
}
