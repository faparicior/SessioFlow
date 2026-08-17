import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';

export class InvalidCfpEndDateError extends DomainInvariantError {
  constructor() {
    super('INVALID_CFP_END_DATE', 'CfpEndDate is not a valid date');
    this.name = 'InvalidCfpEndDateError';
  }
}
