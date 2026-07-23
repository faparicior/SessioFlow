import { DomainInvariantError } from '@sessioflow/shared-domain/exceptions';

/**
 * InvalidCfpStartDateError - CfpStartDate must be a valid date.
 */
export class InvalidCfpStartDateError extends DomainInvariantError {
  constructor() {
    super('INVALID_CFP_START_DATE', 'Invalid CfpStartDate');
    this.name = 'InvalidCfpStartDateError';
  }
}
