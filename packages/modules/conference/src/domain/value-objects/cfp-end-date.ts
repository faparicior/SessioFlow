/**
 * CfpEndDate - The end date of the CfP submission window.
 *
 * Value Object: Date
 * Invariants:
 *   - Must be a valid date
 *   - Must be after CfpStartDate (enforced by CfpConfig.validateDates())
 */

import { InvalidCfpEndDateError } from '../exceptions/invalid-cfp-end-date-error';

export class CfpEndDate {
  static create(date: Date): CfpEndDate {
    if (Number.isNaN(date.getTime())) {
      throw new InvalidCfpEndDateError();
    }

    return new CfpEndDate(date);
  }

  static fromISOString(isoString: string): CfpEndDate {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      throw new InvalidCfpEndDateError();
    }

    return this.create(date);
  }

  private constructor(private readonly _value: Date) {}

  get value(): Date {
    return this._value;
  }

  toISOString(): string {
    return this._value.toISOString();
  }

  equals(other: CfpEndDate): boolean {
    return this._value.getTime() === other._value.getTime();
  }

  isBefore(other: Date): boolean {
    return this._value.getTime() < other.getTime();
  }

  isAfter(other: Date): boolean {
    return this._value.getTime() > other.getTime();
  }
}
