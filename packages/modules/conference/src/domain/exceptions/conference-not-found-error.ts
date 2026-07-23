import { EntityNotFoundError } from '@sessioflow/shared-domain/exceptions';

/**
 * ConferenceNotFoundError - Conference entity not found by given ID.
 */
export class ConferenceNotFoundError extends EntityNotFoundError {
  constructor() {
    super('NOT_FOUND', 'Conference not found');
    this.name = 'ConferenceNotFoundError';
  }
}
