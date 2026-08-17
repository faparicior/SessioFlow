import {EntityNotFoundError} from '@sessioflow/shared-domain/exceptions';

export class ConferenceNotFoundError extends EntityNotFoundError {
  constructor(id: string) {
    super('NOT_FOUND', `Conference with ID "${id}" was not found.`);
    this.name = 'ConferenceNotFoundError';
  }
}
