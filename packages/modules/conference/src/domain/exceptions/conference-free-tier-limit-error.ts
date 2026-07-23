import { DomainForbiddenError } from '@sessioflow/shared-domain/exceptions';

/**
 * ConferenceFreeTierLimitError - Free tier conference limit exceeded (max 5 active).
 */
export class ConferenceFreeTierLimitError extends DomainForbiddenError {
  constructor() {
    super(
      'FREE_TIER_LIMIT',
      'Free tier limit exceeded: maximum 5 active conferences allowed. Please upgrade your plan.',
    );
    this.name = 'ConferenceFreeTierLimitError';
  }
}
