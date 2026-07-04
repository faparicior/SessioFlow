import {z} from 'zod';

/**
 * CfpStartDate - The start date of the CfP submission window.
 *
 * Value Object: Date
 * Invariants:
 *   - Must be a valid date
 *   - Must be in the future (or today) at creation time
 */

export class CfpStartDate implements CfpStartDate {
  private constructor(private readonly _value: Date) {}

  static create(date: Date): CfpStartDate {
    if (date.getTime() < new Date().setHours(0, 0, 0, 0)) {
      throw new Error('CfpStartDate must be in the future or today');
    }

    return new CfpStartDate(date);
  }

  static fromISOString(isoString: string): CfpStartDate {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      throw new TypeError('Invalid date format for CfpStartDate');
    }

    return this.create(date);
  }

  get value(): Date {
    return this._value;
  }

  toISOString(): string {
    return this._value.toISOString();
  }

  equals(other: CfpStartDate): boolean {
    return this._value.getTime() === other._value.getTime();
  }

  isBefore(other: CfpStartDate): boolean {
    return this._value.getTime() < other._value.getTime();
  }

  isAfter(other: CfpStartDate): boolean {
    return this._value.getTime() > other._value.getTime();
  }
}
