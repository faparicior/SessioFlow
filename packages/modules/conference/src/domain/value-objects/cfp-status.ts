import {InvalidCfpStatusError} from '../exceptions/invalid-cfp-status-error.js';

export type CfpStatusValue = 'ACTIVE' | 'CLOSED' | 'ARCHIVED';

const TRANSITIONS: Record<CfpStatusValue, readonly CfpStatusValue[]> = {
  ACTIVE: ['CLOSED'],
  CLOSED: ['ARCHIVED'],
  ARCHIVED: [],
};

/**
 * CfpStatus - Submission window state of the embedded CfP configuration.
 */
export class CfpStatus {
  private constructor(private readonly _value: CfpStatusValue) {}

  public static create(value: string): CfpStatus {
    if (!(value in TRANSITIONS)) {
      throw new InvalidCfpStatusError(value);
    }
    return new CfpStatus(value as CfpStatusValue);
  }

  public static fromData(value: string): CfpStatus {
    return CfpStatus.create(value);
  }

  public static canTransitionTo(current: CfpStatus, target: CfpStatus): boolean {
    return TRANSITIONS[current.value].includes(target.value);
  }

  public static isAcceptingSubmissions(status: CfpStatus): boolean {
    return status.value === 'ACTIVE';
  }

  public get value(): CfpStatusValue {
    return this._value;
  }

  public equals(other: CfpStatus): boolean {
    if (!other || !(other instanceof CfpStatus)) return false;
    return this._value === other._value;
  }
}
