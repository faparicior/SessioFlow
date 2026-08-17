import {DomainConflictError} from '@sessioflow/shared-domain/exceptions';

export class SlugExistsError extends DomainConflictError {
  constructor() {
    super('SLUG_EXISTS', 'Conference slug already exists');
    this.name = 'SlugExistsError';
  }
}
