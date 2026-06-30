import {describe, it, expect} from 'vitest';
import {CfpValidationService} from '@/domain/conference/services/cfp-validation-service.ts';

describe('CfpValidationService', () => {
  const now = new Date('2026-07-01T00:00:00Z');

  it('accepts valid CfP dates', () => {
    const start = new Date('2026-08-01T00:00:00Z');
    const end = new Date('2026-09-01T00:00:00Z');
    const result = CfpValidationService.validateCfpDates(start, end, now);
    expect(result.ok).toBe(true);
  });

  it('rejects start date in the past (BR-001)', () => {
    const start = new Date('2026-06-01T00:00:00Z');
    const end = new Date('2026-08-01T00:00:00Z');
    const result = CfpValidationService.validateCfpDates(start, end, now);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Start date must be in the future');
  });

  it('rejects end date before start date (INV-002)', () => {
    const start = new Date('2026-09-01T00:00:00Z');
    const end = new Date('2026-08-01T00:00:00Z');
    const result = CfpValidationService.validateCfpDates(start, end, now);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('End date must be after start date');
  });

  it('rejects end date equal to start date', () => {
    const start = new Date('2026-08-01T00:00:00Z');
    const end = new Date('2026-08-01T00:00:00Z');
    const result = CfpValidationService.validateCfpDates(start, end, now);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('End date must be after start date');
  });

  it('rejects CfP window exceeding 180 days', () => {
    const start = new Date('2026-08-01T00:00:00Z');
    const end = new Date('2027-03-01T00:00:00Z'); // ~212 days
    const result = CfpValidationService.validateCfpDates(start, end, now);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('CfP window cannot exceed 180 days');
  });

  it('accepts CfP window close to 180 days', () => {
    const start = new Date('2026-08-01T00:00:00Z');
    const end = new Date('2027-01-28T00:00:00Z'); // ~180 days
    const result = CfpValidationService.validateCfpDates(start, end, now);
    expect(result.ok).toBe(true);
  });
});
