import {describe, it, expect} from 'vitest';
import {CfpEndDate} from '@/domain/conference/value-objects/cfp-end-date.ts';

describe('CfpEndDate', () => {
  it('creates a valid date', () => {
    const date = new Date('2026-08-31T00:00:00Z');
    const result = CfpEndDate.create(date);
    expect(result.ok).toBe(true);
  });

  it('createsAfter rejects date before start', () => {
    const start = new Date('2026-08-01T00:00:00Z');
    const end = new Date('2026-07-01T00:00:00Z');
    const result = CfpEndDate.createAfter(end, start);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('End date must be after start date');
  });

  it('createsAfter accepts date after start', () => {
    const start = new Date('2026-08-01T00:00:00Z');
    const end = new Date('2026-09-01T00:00:00Z');
    const result = CfpEndDate.createAfter(end, start);
    expect(result.ok).toBe(true);
  });

  it('daysRemaining calculates correctly', () => {
    const end = new Date('2027-01-01T00:00:00Z');
    const result = CfpEndDate.create(end);
    expect(result.ok).toBe(true);
    expect(result.value!.daysRemaining()).toBeGreaterThan(0);
  });
});
