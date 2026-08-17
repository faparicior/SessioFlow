import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';

export class InvalidCfpStatusError extends DomainInvariantError {
  constructor(status: string = 'unknown') {
    super('INVALID_CFP_STATUS', `"${status}" is not a valid CfP status`);
    this.name = 'InvalidCfpStatusError';
  }
}
