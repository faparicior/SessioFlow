/**
 * CfpStartDate - The start date of the CfP submission window.
 *
 * Value Object: Date
 * Invariants:
 *   - Must be a valid date
 *   - Must be in the future (or today) at creation time
 */

export class CfpStartDate implements CfpStartDate {
  static create(date: Date): CfpStartDate {
    if (Number.isNaN(date.getTime())) {
      throw new TypeError('CfpStartDate must be a valid date');
    }

    return new CfpStartDate(date);
  }

  static fromISOString(isoString: string): CfpStartDate {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      throw new TypeError('Invalid date format for CfpStartDate');
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

  equals(other: CfpStartDate): boolean {
    return this._value.getTime() === other._value.getTime();
  }

  isBefore(other: Date): boolean {
    return this._value.getTime() < other.getTime();
  }

  isAfter(other: Date): boolean {
    return this._value.getTime() > other.getTime();
  }
}
