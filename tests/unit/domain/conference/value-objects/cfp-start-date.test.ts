import {describe, it, expect} from 'vitest';
import {CfpStartDate} from '@/domain/conference/value-objects/cfp-start-date.ts';

describe('CfpStartDate', () => {
  const now = new Date('2026-07-01T00:00:00Z');

  it('creates a valid future date', () => {
    const future = new Date('2026-08-01T00:00:00Z');
    const result = CfpStartDate.create(future, now);
    expect(result.ok).toBe(true);
    expect(result.value).toBeDefined();
  });

  it('rejects a date in the past', () => {
    const past = new Date('2026-06-01T00:00:00Z');
    const result = CfpStartDate.create(past, now);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Start date must be in the future');
  });

  it('rejects today as past (start of day)', () => {
    // Create a date at the same UTC time as the reference - should be rejected
    const same = new Date(now);
    const result = CfpStartDate.create(same, now);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Start date must be in the future');
  });

  it('rejects more than 1 year in the future', () => {
    const farFuture = new Date('2028-01-01T00:00:00Z');
    const result = CfpStartDate.create(farFuture, now);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Start date cannot be more than 1 year in the future');
  });

  it('rejects invalid dates', () => {
    const result = CfpStartDate.create(new Date('invalid'), now);
    expect(result.ok).toBe(false);
  });

  it('isInFuture returns true for future dates', () => {
    const future = new Date('2027-01-01T00:00:00Z');
    const result = CfpStartDate.create(future, now);
    expect(result.ok).toBe(true);
    expect(result.value!.isInFuture()).toBe(true);
  });

  it('daysUntil calculates correctly', () => {
    const future = new Date('2026-07-11T00:00:00Z');
    const result = CfpStartDate.create(future, now);
    expect(result.ok).toBe(true);
    expect(result.value!.daysUntil()).toBeGreaterThanOrEqual(9);
  });

  it('equals compares correctly', () => {
    const date = new Date('2026-08-01T00:00:00Z');
    const result1 = CfpStartDate.create(date, now);
    const result2 = CfpStartDate.create(date, now);
    expect(result1.value!.equals(result2.value!)).toBe(true);
  });
});
