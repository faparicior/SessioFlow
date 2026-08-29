import {DomainForbiddenError} from '@sessioflow/shared-domain/exceptions';

export class ConferenceFreeTierLimitError extends DomainForbiddenError {
  constructor() {
    super('FREE_TIER_LIMIT', 'Free tier limit reached. Please upgrade your plan.');
    this.name = 'ConferenceFreeTierLimitError';
  }
}
