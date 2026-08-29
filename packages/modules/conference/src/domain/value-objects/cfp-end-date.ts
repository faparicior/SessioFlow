import {InvalidCfpEndDateError} from '../exceptions/invalid-cfp-end-date-error.js';

const MS_PER_DAY = 86_400_000;

/**
 * Calendar-day anchor in UTC (DST-proof day arithmetic).
 */
function startOfUtcDayMs(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * CfpEndDate - When the CfP window closes (BR-001).
 * Structural validity is checked here; ordering against the start date and
 * the 180-day window are enforced by the composite `CfpConfig` VO.
 */
export class CfpEndDate {
  private constructor(private readonly _value: Date) {}

  public static create(date: Date): CfpEndDate {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new InvalidCfpEndDateError();
    }
    return new CfpEndDate(date);
  }

  public static fromData(date: Date): CfpEndDate {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new InvalidCfpEndDateError();
    }
    return new CfpEndDate(date);
  }

  public get value(): Date {
    return this._value;
  }

  public isAfter(other: Date): boolean {
    return this._value.getTime() > other.getTime();
  }

  public daysRemaining(): number {
    return Math.round((startOfUtcDayMs(this._value) - startOfUtcDayMs(new Date())) / MS_PER_DAY);
  }

  public equals(other: CfpEndDate): boolean {
    if (!other || !(other instanceof CfpEndDate)) return false;
    return this._value.getTime() === other._value.getTime();
  }
}
