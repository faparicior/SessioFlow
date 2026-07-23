import { DomainInvariantError } from '@sessioflow/shared-domain/exceptions';

/**
 * CfpDatesInvalidError - CfP dates are invalid (end date before start date).
 */
export class CfpDatesInvalidError extends DomainInvariantError {
  constructor(message = 'CfP end date must be after start date') {
    super('CFP_DATES_INVALID', message);
    this.name = 'CfpDatesInvalidError';
  }
}
