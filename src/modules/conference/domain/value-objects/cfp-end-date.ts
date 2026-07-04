/**
 * CfpEndDate - The end date of the CfP submission window.
 *
 * Value Object: Date
 * Invariants:
 *   - Must be a valid date
 *   - Must be after CfpStartDate (enforced by CfpConfig.validateDates())
 */
export type CfpEndDate = {
  readonly value: Date;
};

export class CfpEndDate implements CfpEndDate {
  private constructor(private readonly _value: Date) {}

  static create(date: Date): CfpEndDate {
    if (isNaN(date.getTime())) {
      throw new TypeError('Invalid date format for CfpEndDate');
    }

    return new CfpEndDate(date);
  }

  static fromISOString(isoString: string): CfpEndDate {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      throw new TypeError('Invalid date format for CfpEndDate');
    }

    return this.create(date);
  }

  get value(): Date {
    return this._value;
  }

  toISOString(): string {
    return this._value.toISOString();
  }

  equals(other: CfpEndDate): boolean {
    return this._value.getTime() === other._value.getTime();
  }

  isBefore(other: CfpEndDate): boolean {
    return this._value.getTime() < other._value.getTime();
  }

  isAfter(other: CfpEndDate): boolean {
    return this._value.getTime() > other._value.getTime();
  }
}
