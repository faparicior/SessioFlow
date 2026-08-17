import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';

export class InvalidCfpStartDateError extends DomainInvariantError {
  constructor(message = 'CfpStartDate is not a valid date') {
    super('INVALID_CFP_START_DATE', message);
    this.name = 'InvalidCfpStartDateError';
  }
}
