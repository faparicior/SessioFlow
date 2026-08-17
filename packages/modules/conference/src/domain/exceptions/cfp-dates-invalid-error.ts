import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';

export class CfpDatesInvalidError extends DomainInvariantError {
  constructor(message = 'End date must be after start date') {
    super('CFP_DATES_INVALID', message);
    this.name = 'CfpDatesInvalidError';
  }
}
