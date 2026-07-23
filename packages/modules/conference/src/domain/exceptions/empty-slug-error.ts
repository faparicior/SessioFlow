import { DomainInvariantError } from '@sessioflow/shared-domain/exceptions';

/**
 * EmptySlugError - ConferenceSlug cannot be empty after sanitization.
 */
export class EmptySlugError extends DomainInvariantError {
  constructor() {
    super('EMPTY_SLUG', 'ConferenceSlug cannot be empty');
    this.name = 'EmptySlugError';
  }
}
