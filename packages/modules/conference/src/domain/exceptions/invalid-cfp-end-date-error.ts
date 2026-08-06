import { DomainInvariantError } from '@sessioflow/shared-domain/exceptions';

/**
 * InvalidCfpEndDateError - CfpEndDate must be a valid date.
 */
export class InvalidCfpEndDateError extends DomainInvariantError {
  constructor() {
    super('INVALID_CFP_END_DATE', 'Invalid CfpEndDate');
    this.name = 'InvalidCfpEndDateError';
  }
}
