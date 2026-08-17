import {describe, expect, it} from 'vitest';
import {CfpStartDate} from '@sessioflow/conference/domain/value-objects/cfp-start-date';
import {CfpStartDateNotInFutureError} from '@sessioflow/conference/domain/exceptions/cfp-start-date-not-in-future-error';
import {InvalidCfpStartDateError} from '@sessioflow/conference/domain/exceptions/invalid-cfp-start-date-error';
import {futureDate, pastDate} from '../../../../__helpers__/date';

// Unit tests run with a mocked "now" = 2026-07-28T00:00:00.000Z (tests/setup.ts),
// so relative helpers give deterministic dates.

describe('CfpStartDate', () => {
  it('creates a start date in the future', () => {
    const start = CfpStartDate.create(futureDate(1));
    expect(start.value.getTime()).toBe(futureDate(1).getTime());
  });

  it('allows today as the start date (BR-001: >= today)', () => {
    expect(() => CfpStartDate.create(new Date())).not.toThrow();
  });

  it('rejects start dates in the past (BR-001)', () => {
    expect(() => CfpStartDate.create(pastDate(1))).toThrow(
      CfpStartDateNotInFutureError,
    );
    expect(() => CfpStartDate.create(pastDate(1))).toThrow(
      'CfpStartDate must be in the future or today',
    );
  });

  it('rejects invalid dates', () => {
    expect(() => CfpStartDate.create(new Date('not-a-date'))).toThrow(
      InvalidCfpStartDateError,
    );
    expect(() => CfpStartDate.create(new Date('not-a-date'))).toThrow(
      'CfpStartDate is not a valid date',
    );
  });

  it('rejects start dates more than 365 days ahead', () => {
    expect(() => CfpStartDate.create(futureDate(366))).toThrow(
      InvalidCfpStartDateError,
    );
  });

  it('accepts the 365-day boundary', () => {
    expect(() => CfpStartDate.create(futureDate(365))).not.toThrow();
  });

  it('reconstitutes historical start dates via fromData (no time checks)', () => {
    const historical = CfpStartDate.fromData(pastDate(365));
    expect(historical.value.getTime()).toBe(pastDate(365).getTime());
  });

  it('computes days until start', () => {
    expect(CfpStartDate.create(futureDate(10)).daysUntil()).toBe(10);
  });

  it('implements structural equality', () => {
    const a = CfpStartDate.create(futureDate(1));
    const b = CfpStartDate.create(futureDate(1));
    expect(a.equals(b)).toBe(true);
    expect(a.equals(CfpStartDate.create(futureDate(2)))).toBe(false);
  });
});
