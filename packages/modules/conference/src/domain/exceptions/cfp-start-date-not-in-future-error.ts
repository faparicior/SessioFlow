import { DomainInvariantError } from '@sessioflow/shared-domain/exceptions';

/**
 * CfpStartDateNotInFutureError - CfpStartDate must be in the future or today.
 */
export class CfpStartDateNotInFutureError extends DomainInvariantError {
  constructor() {
    super('CFP_START_DATE_NOT_IN_FUTURE', 'CfpStartDate must be in the future or today');
    this.name = 'CfpStartDateNotInFutureError';
  }
}
