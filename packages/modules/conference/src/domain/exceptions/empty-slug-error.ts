import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';

export class EmptySlugError extends DomainInvariantError {
  constructor() {
    super(
      'EMPTY_SLUG',
      'Conference name must contain at least one letter or number',
    );
    this.name = 'EmptySlugError';
  }
}
