import {CfpStartDateNotInFutureError} from '../exceptions/cfp-start-date-not-in-future-error.js';
import {InvalidCfpStartDateError} from '../exceptions/invalid-cfp-start-date-error.js';

const MS_PER_DAY = 86_400_000;
const MAX_FUTURE_DAYS = 365;

/**
 * Calendar-day anchor in UTC (DST-proof day arithmetic).
 */
function startOfUtcDayMs(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * CfpStartDate - When the CfP window opens (BR-001).
 * `create()` enforces temporal rules (today or future, ≤ 365 days ahead);
 * `fromData()` reconstitutes historical dates without time checks.
 */
export class CfpStartDate {
  private constructor(private readonly _value: Date) {}

  public static create(date: Date): CfpStartDate {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new InvalidCfpStartDateError();
    }
    const daysFromToday = Math.round(
      (startOfUtcDayMs(date) - startOfUtcDayMs(new Date())) / MS_PER_DAY,
    );
    if (daysFromToday < 0) {
      throw new CfpStartDateNotInFutureError();
    }
    if (daysFromToday > MAX_FUTURE_DAYS) {
      throw new InvalidCfpStartDateError('CfpStartDate cannot be more than 365 days in the future');
    }
    return new CfpStartDate(date);
  }

  public static fromData(date: Date): CfpStartDate {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new InvalidCfpStartDateError();
    }
    return new CfpStartDate(date);
  }

  public get value(): Date {
    return this._value;
  }

  public daysUntil(): number {
    return Math.round((startOfUtcDayMs(this._value) - startOfUtcDayMs(new Date())) / MS_PER_DAY);
  }

  public equals(other: CfpStartDate): boolean {
    if (!other || !(other instanceof CfpStartDate)) return false;
    return this._value.getTime() === other._value.getTime();
  }
}
